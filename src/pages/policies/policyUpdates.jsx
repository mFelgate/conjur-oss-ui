import {
  Alert,
  Box,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function PolicyUpdates({ UpdatedResources }) {
  const beforeItems = UpdatedResources?.before?.items ?? [];
  const afterItems = UpdatedResources?.after?.items ?? [];
  // Compare two arrays of objects and return the added and removed items
  const arrayChanged = (before, after) => {
    const beforeSet = new Set(before || []);
    const afterSet = new Set(after || []);

    const added = [...afterSet].filter((newItem) => !beforeSet.has(newItem));
    const removed = [...beforeSet].filter((oldItem) => !afterSet.has(oldItem));

    return { added, removed };
  };

  const objectChanged = (before, after) => {
    const beforeObj = before || {};
    const afterObj = after || {};

    const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);

    const added = {};
    const removed = {};

    for (const key of keys) {
      if (!(key in beforeObj)) {
        added[key] = afterObj[key];
      } else if (!(key in afterObj)) {
        removed[key] = beforeObj[key];
      } else if (
        Array.isArray(beforeObj[key]) &&
        Array.isArray(afterObj[key])
      ) {
        const diff = arrayChanged(beforeObj[key], afterObj[key]);

        if (diff.added.length) added[key] = diff.added;
        if (diff.removed.length) removed[key] = diff.removed;
      } else if (
        JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])
      ) {
        added[key] = afterObj[key];
        removed[key] = beforeObj[key];
      }
    }

    return { added, removed };
  };

  function RenderChanges(changes, Type) {
    return (
      <>
        <Typography variant="subtitle2" color="text.secondary">
          {Type}
        </Typography>
        {changes.added.map((item) => (
          <Box key={item}>
            <Typography
              sx={{ color: "success.main", overflowWrap: "anywhere" }}
            >
              + {item}
            </Typography>
          </Box>
        ))}
        {changes.removed.map((item) => (
          <Box key={item}>
            <Typography sx={{ color: "error.main", overflowWrap: "anywhere" }}>
              - {item}
            </Typography>
          </Box>
        ))}
      </>
    );
  }

  function RenderObjectChanges(changes, Type) {
    return (
      <>
        <Typography variant="subtitle2" color="text.secondary">
          {Type}
        </Typography>

        {Object.entries(changes.added).map(([key, value]) => (
          <Box key={key}>
            <Typography sx={{ color: "success.main" }}>
              + {key}: {JSON.stringify(value)}
            </Typography>
          </Box>
        ))}
        {Object.entries(changes.removed).map(([key, value]) => (
          <Box key={key}>
            <Typography sx={{ color: "error.main" }}>
              - {key}: {JSON.stringify(value)}
            </Typography>
          </Box>
        ))}
      </>
    );
  }

  if (beforeItems.length === 0) {
    return <Alert severity="info">No resources will be updated.</Alert>;
  }

  return (
    <Stack spacing={1}>
      {beforeItems.map((beforeItem) => {
        const afterItem =
          afterItems.find((item) => item.identifier === beforeItem.identifier) ??
          {};
        const membersChange = arrayChanged(
          beforeItem.members,
          afterItem.members,
        );
        const memberships = arrayChanged(
          beforeItem.memberships,
          afterItem.memberships,
        );
        const annotationsChange = objectChanged(
          beforeItem.annotations,
          afterItem.annotations,
        );
        const restrictionsChange = arrayChanged(
          beforeItem.restricted_to,
          afterItem.restricted_to,
        );
        const permissionChanges = objectChanged(
          beforeItem.permissions,
          afterItem.permissions,
        );
        const permittedChanges = objectChanged(
          beforeItem.permitted,
          afterItem.permitted,
        );
        const resourceId = beforeItem.identifier;
        return (
          <Accordion key={resourceId} variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="text.secondary">
                {resourceId}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              {membersChange.added.length > 0 ||
              membersChange.removed.length > 0
                ? RenderChanges(membersChange, "Members")
                : null}
              {memberships.added.length > 0 || memberships.removed.length > 0
                ? RenderChanges(memberships, "Memberships")
                : null}
              {Object.keys(annotationsChange.added).length > 0 ||
              Object.keys(annotationsChange.removed).length > 0
                ? RenderObjectChanges(annotationsChange, "Annotations")
                : null}
              {restrictionsChange.added.length > 0 ||
              restrictionsChange.removed.length > 0
                ? RenderChanges(restrictionsChange, "Restrictions")
                : null}
              {Object.keys(permissionChanges.added).length > 0 ||
              Object.keys(permissionChanges.removed).length > 0
                ? RenderObjectChanges(permissionChanges, "Permissions")
                : null}
              {Object.keys(permittedChanges.added).length > 0 ||
              Object.keys(permittedChanges.removed).length > 0
                ? RenderObjectChanges(permittedChanges, "Permitted")
                : null}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
