import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { authService } from "../../services";

export default function ApiKeyDetails({ resource }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const parts = String(resource.id ?? "").split(":");
  const resourceType = parts[1];
  const resourceName = parts[2];
  const canRotate = Boolean(resourceType && resourceName);
  const [key, setKey] = useState("");

  async function rotateKey(type, serviceId) {
    if (!type || !serviceId) {
      setError("Invalid resource id. Expected format: account:type:id");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.rotateUserApiKey(type, serviceId);
      setKey(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to rotate key.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Stack spacing={3}>
          <Stack spacing={3}>
            {loading && <Alert severity="info">Rotating key...</Alert>}
            {!loading && error && <Alert severity="error">{error}</Alert>}
            {!loading && key && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2">API Key</Typography>
                <Typography
                  variant="body2"
                  component="code"
                  sx={{ wordBreak: "break-all" }}
                >
                  {key}
                </Typography>
             </Paper>
            )}
          </Stack>
        <Button
          sx={{ alignSelf: "flex-start", width: "fit-content" }}
          startIcon={<EditIcon />}
          onClick={() => rotateKey(resourceType, resourceName)}
          disabled={!canRotate || loading}
        >
          Rotate key
        </Button>
      </Stack>
    </Box>
  );
}
