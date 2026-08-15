import { apiRequest, apiRequestText } from "./apiClient";
import type {
  AccessTokenResponse,
  ConjurAccessTokenRequest,
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
  getAccessToken(account: string, login: string, apiKey: string) {
    const path = `/authn/${encodeURIComponent(account)}/${encodeURIComponent(login)}/authenticate`;

    return apiRequestText(path, {
      method: "POST",
      body: apiKey,
      suppressUnauthorizedRedirect: true,
    }).then((rawToken) => normalizeConjurToken(rawToken));
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
      suppressUnauthorizedRedirect: true,
    }).then((rawToken) => normalizeConjurToken(rawToken));
  },

  login(credentials: ConjurAccessTokenRequest) {
    const account = CONJUR_ACCOUNT;

    if (!account) {
      throw new Error("Missing VITE_CONJUR_ACCOUNT. Set it in .env.local.");
    }

    return authService.getAccessToken(account, credentials.login, credentials.apiKey);
  },

  whoAmI() {
    return apiRequest("/whoami");
  },
};
