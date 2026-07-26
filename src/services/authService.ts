import { apiRequest, apiRequestText } from "./apiClient";
import type {
  AccessTokenResponse,
  ConjurAccessTokenRequest,
  PasswordLoginRequest,
} from "../types";

const viteEnv = (import.meta as { env?: Record<string, string> }).env;
const DEFAULT_CONJUR_ACCOUNT = viteEnv?.VITE_CONJUR_ACCOUNT ?? "";
function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function normalizeConjurToken(rawToken: string): string {
  console.log("Normalizing Conjur token:", rawToken);
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
    }).then((rawToken) => {
      const token = normalizeConjurToken(rawToken);

      localStorage.setItem("conjur_access_token", token);

      return token;
    });
  },

  oidcLogin(
    serviceId: string,
    account: string,
    code: string,
    nonce: string,
    codeVerifier: string,
  ) {
    const path = `/authn-oidc/${serviceId}/${account}/authenticate`;

    console.log("Calling OIDC login with path:", path);

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

  login(credentials: PasswordLoginRequest | ConjurAccessTokenRequest) {
    if ("account" in credentials) {
      return authService.getAccessToken(
        credentials.account,
        credentials.login,
        credentials.apiKey,
      );
    }

    if (!DEFAULT_CONJUR_ACCOUNT) {
      throw new Error("Missing VITE_CONJUR_ACCOUNT. Set it in .env.local.");
    }

    return authService.getAccessToken(
      DEFAULT_CONJUR_ACCOUNT,
      credentials.username,
      credentials.password,
    );
  },

  whoAmI() {
    return apiRequest("/whoami");
  },
};
