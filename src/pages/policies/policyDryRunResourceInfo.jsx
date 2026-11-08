import { Stack, Typography } from "@mui/material";

export default function PolicyDryRunResourceInfo({ resource }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">
        <strong>ID:</strong> {resource?.id}
      </Typography>
      {resource?.kind && (
        <Typography variant="body2">
          <strong>Kind:</strong> {resource.kind}
        </Typography>
      )}
      {resource?.branch && (
        <Typography variant="body2">
          <strong>Branch:</strong> {resource.branch}
        </Typography>
      )}
    </Stack>
  );
}
