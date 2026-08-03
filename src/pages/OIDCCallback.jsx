import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { authService } from "../services/authService";

export default function OIDCCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { setAccessToken } = useAuth();

  useEffect(() => {
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
        sessionStorage.removeItem("oidc_nonce");
        sessionStorage.removeItem("oidc_code_verifier");
        sessionStorage.removeItem("oidc_service_id");
        sessionStorage.removeItem("oidc_state");

        navigate("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "OIDC login failed.",
        );
      }
    }

    authenticate();
  }, [navigate, setAccessToken]);

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        Completing login...
      </Typography>
    </Box>
  );
}