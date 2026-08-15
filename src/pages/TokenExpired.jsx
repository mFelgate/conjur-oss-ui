import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function TokenExpired() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h4" component="h1">
              Session expired
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your access token has expired. Please sign in again to continue.
            </Typography>
            <Button component={Link} to="/login" variant="contained">
              Go to login
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
