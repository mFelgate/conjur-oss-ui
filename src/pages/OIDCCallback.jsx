import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { authService } from "../services/authService";

export default function OIDCCallback() {
  const TOKEN_STORAGE_KEY = 'conjur.accessToken'
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    async function authenticate() {
      try {
        console.log("Starting OIDC callback authentication process...");
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        console.log("Params:", params.toString());

        if (!code) {
          throw new Error("Missing authorization code.");
        }

        // Optional UI state validation
        // const storedState = sessionStorage.getItem("oidc_state");

        // if (storedState && state !== storedState) {
        //   throw new Error("Invalid OIDC state.");
        // }

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

        const account = "cucumber"; // make this dynamic later

        const token = await authService.oidcLogin(
          serviceId,
          account,
          code,
          nonce,
          codeVerifier,
        );

        console.log("OIDC login successful, token received:", token);
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem("conjur.account", account);

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
  }, [navigate]);

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