import { ApiError, apiRequest, apiRequestText } from "./apiClient";
import type {
  AccessTokenResponse,
  ConjurAccessTokenRequest,
  WhoAmIResponse,
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
  async passwordLogin(account: string, login: string, password: string) {
    const path = `/authn/${encodeURIComponent(account)}/login`;

    const apiKey = await apiRequestText(path, {
      method: "GET",
      headers: {
        Authorization: "Basic " + toBase64(login + ":" + password),
      },
      suppressUnauthorizedRedirect: true,
    });

    return authService.getAccessToken(account, login, apiKey);
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

    return authService.passwordLogin(account, credentials.login, credentials.apiKey);
  },

  rotateUserApiKey(type: string, userId: string) {
    const path = `/authn/${encodeURIComponent(CONJUR_ACCOUNT)}/api_key`;
    return apiRequestText(path, {
      method: "PUT",
      query: {
        role: `${type}:${userId}`,
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error("Role not found for API key rotation.");
        }

        if (error.status === 401) {
          throw new Error("Unauthorized to rotate API key for this role.");
        }
      }

      throw error;
    });
  },

  changePassword(login: string, currentApiKey: string, newPassword: string) {
    const path = `/authn/${encodeURIComponent(CONJUR_ACCOUNT)}/password`;
    return apiRequestText(path, {
      method: "PUT",
      suppressUnauthorizedRedirect: true,
      headers: {
        Authorization: "Basic " + toBase64(`${login}:${currentApiKey}`),
        "Content-Type": "text/plain",
      },
      body: newPassword,
    }).catch((error) => {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Current password/API key is invalid.");
        }

        if (error.status === 404) {
          throw new Error(`User '${login}' not found.`);
        }

        if (error.status === 422) {
          throw new Error("Invalid password update request.");
        }
      }

      throw error;
    });
  },

  whoAmI() {
    return apiRequest<WhoAmIResponse>("/whoami");
  },
};
