import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useAuth } from "../auth/useAuth";
import { authenticatorsService } from "../services";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [loginName, setLoginName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [localError, setLocalError] = useState("");
  const [providers, setProviders] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    try {    
      await login({login: loginName, apiKey });
      navigate("/dashboard");
    } catch (requestError) {
      setLocalError(
        requestError instanceof Error ? requestError.message : "Login failed.",
      );
    }
  };

  const handleOIDCLogin = async (provider) => {
    sessionStorage.setItem("oidc_nonce", provider.nonce);
    sessionStorage.setItem("oidc_code_verifier", provider.code_verifier);
    sessionStorage.setItem("oidc_service_id", provider.service_id);
    window.location.assign(provider.redirect_uri);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadProvider() {
      try {
        const response = await authenticatorsService.providers();
        // Only update state if component still exists.
        if (isMounted) {
          setProviders(response);
        }
      } catch (requestError) {
        // Normalize unknown error into a readable string.
        if (isMounted) {
          setLocalError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load providers.",
          );
        }
      } finally {
        // Auth loading is managed by AuthContext.
      }
    }
    loadProvider();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Login
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Sign in with your Conjur login, and API key to load
            authenticated data.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Login"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                fullWidth
              />
              <TextField
                label="API Key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                fullWidth
              />
              {(localError || error) && (
                <Alert severity="error">{localError || error}</Alert>
              )}
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <Stack spacing={1}>
                <Typography variant="h6">Available Providers</Typography>
                {providers.length > 0 ? (
                  providers.map((provider) => (
                    <Button
                      key={provider.service_id ?? provider.name}
                      disabled={loading}
                      onClick={() => handleOIDCLogin(provider)}
                      variant="contained"
                      fullWidth
                    >
                      {" "}
                      {loading
                        ? "Signing in..."
                        : `Sign in with ${provider.name}`}
                    </Button>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No providers available.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
