/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", () => ({
  apiRequest: vi.fn(),
  apiRequestText: vi.fn(),
}));

import { apiRequest, apiRequestText } from "../../src/services/apiClient";
import { authService } from "../../src/services/authService";

const apiRequestMock = vi.mocked(apiRequest);
const apiRequestTextMock = vi.mocked(apiRequestText);

describe("authService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts an API key and returns a text token unchanged", async () => {
    apiRequestTextMock.mockResolvedValue("token-value");

    await expect(authService.getAccessToken("account", "alice/bob", "api-key")).resolves.toBe(
      "token-value",
    );
    expect(apiRequestTextMock).toHaveBeenCalledWith(
      "/authn/account/alice%2Fbob/authenticate",
      {
        method: "POST",
        body: "api-key",
        suppressUnauthorizedRedirect: true,
      },
    );
  });

  it("base64-encodes JSON authentication tokens", async () => {
    const token = JSON.stringify({ sub: "alice" });
    apiRequestTextMock.mockResolvedValue(token);

    await expect(authService.getAccessToken("account", "alice", "api-key")).resolves.toBe(
      btoa(token),
    );
  });

  it("sends OIDC code, nonce, and PKCE verifier to Conjur", async () => {
    apiRequestTextMock.mockResolvedValue("oidc-token");

    await authService.oidcLogin("ui", "authorization-code", "nonce", "verifier");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      expect.stringContaining("/authn-oidc/ui/"),
      {
        method: "GET",
        query: {
          code: "authorization-code",
          nonce: "nonce",
          code_verifier: "verifier",
        },
        suppressUnauthorizedRedirect: true,
      },
    );
  });

  it("uses the shared API client for whoami", () => {
    authService.whoAmI();
    expect(apiRequestMock).toHaveBeenCalledWith("/whoami");
  });
});
