import { apiRequest, apiRequestText } from "./apiClient";
import type {
  AccessTokenResponse,
  ConjurAccessTokenRequest,
  PasswordLoginRequest,
} from "../types";
import { CONJUR_ACCOUNT } from "../config";
function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function normalizeConjurToken(rawToken: string): string {
  const token = rawToken?.trim();

  // Conjur authenticate commonly returns a JSON token object as text.
  // API requests expect that token to be Base64-encoded in the Authorization header.
  if (token.startsWith("{")) {
    return toBase64(token);
  }

  return token;
}

export const authService = {
  getAccessToken(login: string, apiKey: string) {
    const path = `/authn/${encodeURIComponent(CONJUR_ACCOUNT)}/${encodeURIComponent(login)}/authenticate`;

    return apiRequestText(path, {
      method: "POST",
      body: apiKey,
    }).then((rawToken) => {
      const token = normalizeConjurToken(rawToken);

      localStorage.setItem("conjur_access_token", token);

      return token;
    });
  },

  oidcLogin(
    serviceId: string,
    code: string,
    nonce: string,
    codeVerifier: string,
  ) {
    const path = `/authn-oidc/${serviceId}/${CONJUR_ACCOUNT}/authenticate`;

    return apiRequestText(path, {
      method: "GET",
      query: {
        code,
        nonce,
        code_verifier: codeVerifier,
      },
    }).then((rawToken) => {
      const token = normalizeConjurToken(rawToken);
      localStorage.setItem("conjur_access_token", token);

      return token;
    });
  },

  login(credentials: ConjurAccessTokenRequest) {
    if (!CONJUR_ACCOUNT) {
      throw new Error("Missing VITE_CONJUR_ACCOUNT. Set it in .env.local.");
    }

    return authService.getAccessToken( credentials.login, credentials.apiKey);
  },

  whoAmI() {
    return apiRequest("/whoami");
  },
};
