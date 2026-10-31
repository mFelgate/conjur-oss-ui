import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/apiClient")>(
    "../../src/services/apiClient",
  );

  return {
    ...actual,
    apiRequestText: vi.fn(),
  };
});

import { ApiError, apiRequestText } from "../../src/services/apiClient";
import { CONJUR_ACCOUNT } from "../../src/config";
import { secretsService } from "../../src/services/secretsService";

const apiRequestTextMock = vi.mocked(apiRequestText);
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("secretsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiRequestTextMock.mockResolvedValue("ok");
  });

  it("gets a secret from the account-scoped endpoint", async () => {
    await secretsService.get("variable", "folder/value");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/secrets/${account}/variable/folder%2Fvalue`,
    );
  });

  it("posts a plain-text secret value", async () => {
    apiRequestTextMock.mockResolvedValue("ok");

    await secretsService.set("variable", "folder/value", "new secret");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/secrets/${account}/variable/folder%2Fvalue`,
      { method: "POST", body: "new secret" },
    );
  });

  it("surfaces Conjur secret error messages", async () => {
    apiRequestTextMock.mockRejectedValue(
      new ApiError(
        {
          error: {
            code: "not_found",
            message: "Secret not found",
          },
        },
        404,
      ),
    );

    await expect(secretsService.get("variable", "missing")).rejects.toThrow(
      "Secret not found",
    );
  });
});
