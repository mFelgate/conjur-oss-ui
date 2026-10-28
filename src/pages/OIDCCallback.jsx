import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import { authService } from "../services/authService";
import { ApiError } from "../services/apiClient";

const LOGIN_REDIRECT_DELAY_MS = 5000;

export default function OIDCCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { setAccessToken } = useAuth();
  const hasAttemptedAuth = useRef(false);

  function clearOidcSession() {
    sessionStorage.removeItem("oidc_nonce");
    sessionStorage.removeItem("oidc_code_verifier");
    sessionStorage.removeItem("oidc_service_id");
    sessionStorage.removeItem("oidc_state");
  }

  useEffect(() => {
    if (hasAttemptedAuth.current) {
      return;
    }
    hasAttemptedAuth.current = true;

    async function authenticate() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          throw new Error("Missing authorization code.");
        }

        const nonce = sessionStorage.getItem("oidc_nonce");
        const codeVerifier = sessionStorage.getItem(
          "oidc_code_verifier",
        );
        const serviceId = sessionStorage.getItem(
          "oidc_service_id",
        );

        if (!nonce || !codeVerifier || !serviceId) {
          throw new Error("Missing OIDC session data.");
        }


        const token = await authService.oidcLogin(
          serviceId,
          code,
          nonce,
          codeVerifier,
        );
        setAccessToken(token);
        clearOidcSession();

        navigate("/dashboard");
      } catch (err) {
        clearOidcSession();
        if (err instanceof ApiError && err.status === 403) {
          setError("Forbidden: your account is not allowed to authenticate with this OIDC service.");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "OIDC login failed.",
        );
      }
    }

    authenticate();
  }, [navigate, setAccessToken]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, LOGIN_REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [error, navigate]);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper sx={{ p: 3, width: "100%", maxWidth: 640 }}>
          <Stack spacing={2}>
            <Typography variant="h5" component="h1">
              Login error
            </Typography>
            <Alert severity="error">{error}</Alert>
            <Typography variant="body2" color="text.secondary">
              Redirecting to login in 5 seconds...
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login", { replace: true })}
              sx={{ alignSelf: "flex-start" }}
            >
              Back to login
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 420, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Completing login...
        </Typography>
      </Paper>
    </Box>
  );
}