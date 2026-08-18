import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "../../src/services/apiClient";
import { CONJUR_ACCOUNT } from "../../src/config";
import { authenticatorsService } from "../../src/services/authenticatorsService";

const apiRequestMock = vi.mocked(apiRequest);
const v2Headers = { accept: "application/x.secretsmgr.v2beta+json" };
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("authenticatorsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retrieves OIDC providers for the configured account", () => {
    authenticatorsService.providers();

    expect(apiRequestMock).toHaveBeenCalledWith(`/authn-oidc/${account}/providers`, {
      headers: v2Headers,
    });
  });

  it("retrieves the effective v1 authenticator state", () => {
    authenticatorsService.index();
    expect(apiRequestMock).toHaveBeenCalledWith("/authenticators");
  });

  it("lists and retrieves v2 authenticators", () => {
    authenticatorsService.list({ type: "oidc", offset: 10, limit: 25 });
    authenticatorsService.get("oidc", "ui/service");

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, `/authenticators/${account}`, {
      query: { type: "oidc", offset: 10, limit: 25 },
      headers: v2Headers,
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      `/authenticators/${account}/oidc/ui%2Fservice`,
      { headers: v2Headers },
    );
  });

  it("creates, updates, and deletes authenticators", () => {
    authenticatorsService.create({ type: "oidc", name: "ui", enabled: true });
    authenticatorsService.update(false, "oidc", "ui/service");
    authenticatorsService.delete("oidc", "ui/service");

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, `/authenticators/${account}`, {
      method: "POST",
      headers: v2Headers,
      body: { type: "oidc", name: "ui", enabled: true },
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      `/authenticators/${account}/oidc/ui%2Fservice`,
      { method: "PATCH", headers: v2Headers, body: { enabled: false } },
    );
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      3,
      `/authenticators/${account}/oidc/ui%2Fservice`,
      { method: "DELETE", headers: v2Headers },
    );
  });
});
