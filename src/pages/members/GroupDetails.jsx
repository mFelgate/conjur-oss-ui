import {
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MembershipGroups from "./memberGroup.jsx";


export default function GroupDetails({ resource }) {
  const parts = String(resource.id ?? "").split(":");
  const serviceId = parts[2];

  return (
    <Box sx={{ py: 2 }}>
        <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" component="h2">
                    Memberships
                  </Typography>
                  <MembershipGroups serviceId={serviceId} />
                </Stack>
              </Paper>
        </Stack>
    </Box>
  );
}
