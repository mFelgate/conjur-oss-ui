import { Stack, Typography } from "@mui/material";
import { DetailRow } from "../resources/resourceDetails.jsx";

export default function PolicyResourceInfo({ title, resource }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" color="text.secondary">
        {resource.identifier}
      </Typography>
      <DetailRow label="Name" value={resource.id} />
      <DetailRow label="Type" value={resource.type} />
      <DetailRow label="Owner" value={resource.owner} />
      <DetailRow label="Policy" value={resource.policy} />

      {resource.members?.length > 0 && (
        <>
          <DetailRow label="Members" value={JSON.stringify(resource.members)} />
        </>
      )}

      {resource.memberships?.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            Memberships
          </Typography>
          {resource.memberships.map((membership) => (
            <Typography key={membership} variant="body2">
              {membership}
            </Typography>
          ))}
        </>
      )}
    </Stack>
  );
}

