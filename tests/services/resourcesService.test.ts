import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "../../src/services/apiClient";
import { CONJUR_ACCOUNT } from "../../src/config";
import { resourcesService } from "../../src/services/resourcesService";

const apiRequestMock = vi.mocked(apiRequest);
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("resourcesService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses paging for a normal resource list", () => {
    resourcesService.list({ kind: "variable", offset: 50, limit: 25 });

    expect(apiRequestMock).toHaveBeenCalledWith(`/resources/${account}`, {
      query: { offset: 50, limit: 25, kind: "variable" },
    });
  });

  it("omits paging for a count request", () => {
    resourcesService.list({ kind: "variable", count: true });

    expect(apiRequestMock).toHaveBeenCalledWith(`/resources/${account}`, {
      query: { kind: "variable", count: true },
    });
  });

  it("encodes a resource identifier when retrieving details", () => {
    resourcesService.get("variable", "folder/credential name");

    expect(apiRequestMock).toHaveBeenCalledWith(
      `/resources/${account}/variable/folder%2Fcredential%20name`,
      { headers: { accept: "application/json" } },
    );
  });
});
