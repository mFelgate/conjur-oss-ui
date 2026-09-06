import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Button,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import { authService, resourcesService } from "../services";
import ApiKeyDetails from "./apiKey/apiKeyDetails.jsx";

function DetailRow({ label, value }) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "right" }}>
        {String(value ?? "")}
      </Typography>
    </Stack>
  );
}

function ChangePassword({ username }) {
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const updatePassword = async () => {
    try {
      await authService.changePassword(username, password, value);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update password.",
      );
    } finally {
      setValue("");
      setPassword("");
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Change Password</Typography>

      <TextField
        fullWidth
        value={password}
        label="Current Conjur Password/API key"
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          mt: 1,
          "& textarea": {
            fontFamily: "monospace",
          },
        }}
      />

      <TextField
        fullWidth
        value={value}
        label="New Password"
        onChange={(e) => setValue(e.target.value)}
        sx={{
          mt: 2,
          "& textarea": {
            fontFamily: "monospace",
          },
        }}
      />

      <Button sx={{ mt: 2 }} variant="contained" onClick={updatePassword}>
        Update Password
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}

export default function WhoAmI() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [resourceError, setResourceError] = useState("");
  const [resource, setResource] = useState(null);
  const [whoAmI, setWhoAmI] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWhoAmI() {
      setLoading(true);
      setError("");

      try {
        const response = await authService.whoAmI();
        setWhoAmI(response);
        if (isMounted) {
          setWhoAmI(response);
        }
        loadResource(response.username);
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load whoami information.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function loadResource(username) {
      setLoading(true);
      setResourceError("");
      try {
        const resource = await resourcesService.get("user", username);
        if (isMounted) {
          setResource(resource);
        }
      } catch (requestError) {
        if (isMounted) {
          setResourceError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load resource.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadWhoAmI();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            My Identity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Authenticated Conjur identity
          </Typography>

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading identity...</Typography>
            </Stack>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && whoAmI && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                {Object.entries(whoAmI).map(([label, value]) => (
                  <DetailRow key={label} label={label} value={value} />
                ))}
                {resource && !resourceError && <ApiKeyDetails resource={resource} />}
                {resourceError && <Alert severity="error">{resourceError}</Alert>}
              </Stack>
            </Paper>
          )}

          {!loading && !error && whoAmI && (
            <ChangePassword username={whoAmI.username} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
