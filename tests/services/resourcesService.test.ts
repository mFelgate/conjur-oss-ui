import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/apiClient")>(
    "../../src/services/apiClient",
  );

  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

import { ApiError, apiRequest } from "../../src/services/apiClient";
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

  it("encodes a resource identifier when retrieving details", async () => {
    apiRequestMock.mockResolvedValue({} as never);

    await resourcesService.get("variable", "folder/credential name");

    expect(apiRequestMock).toHaveBeenCalledWith(
      `/resources/${account}/variable/folder%2Fcredential%20name`,
      { headers: { accept: "application/json" } },
    );
  });

  it("surfaces Conjur resource error message for missing resources", async () => {
    apiRequestMock.mockRejectedValue(
      new ApiError(
        {
          error: {
            code: "not_found",
            message: "User 'testuser' not found in account 'cucumber'",
            target: "user",
            details: {
              code: "not_found",
              target: "id",
              message: "cucumber:user:testuser",
            },
          },
        },
        404,
      ),
    );

    await expect(resourcesService.get("user", "testuser")).rejects.toThrow(
      "User 'testuser' not found in account 'cucumber'",
    );
  });
});
