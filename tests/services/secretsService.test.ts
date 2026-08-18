import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", () => ({ apiRequestText: vi.fn() }));

import { apiRequestText } from "../../src/services/apiClient";
import { CONJUR_ACCOUNT } from "../../src/config";
import { secretsService } from "../../src/services/secretsService";

const apiRequestTextMock = vi.mocked(apiRequestText);
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("secretsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gets a secret from the account-scoped endpoint", () => {
    secretsService.get("variable", "folder/value");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/secrets/${account}/variable/folder%2Fvalue`,
    );
  });

  it("posts a plain-text secret value", () => {
    secretsService.set("variable", "folder/value", "new secret");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/secrets/${account}/variable/folder%2Fvalue`,
      { method: "POST", body: "new secret" },
    );
  });
});
