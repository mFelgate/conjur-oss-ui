import { Paper, Stack, Typography } from "@mui/material";
import PolicyDryRunResourceInfo from "./policyDryRunResourceInfo.jsx";

export default function PolicyDeleted({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mt: 1 }}>
        Resource to Be Deleted
      </Typography>
      <Stack spacing={1}>
        {items.map((resource) => (
          <Paper key={resource.id} variant="outlined" sx={{ p: 2 }}>
            <PolicyDryRunResourceInfo
              title="Deleted Resource"
              resource={resource}
            />
          </Paper>
        ))}
      </Stack>
    </>
  );
}
