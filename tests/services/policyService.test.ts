import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", () => ({
  apiRequestText: vi.fn(),
  apiRequestTextFullResponse: vi.fn(),
}));

import {
  apiRequestText,
  apiRequestTextFullResponse,
} from "../../src/services/apiClient";
import { CONJUR_ACCOUNT } from "../../src/config";
import { policyService } from "../../src/services/policyService";

const apiRequestTextMock = vi.mocked(apiRequestText);
const apiRequestTextFullResponseMock = vi.mocked(apiRequestTextFullResponse);
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("policyService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gets the effective policy as plain text", () => {
    policyService.getEffectivePolicy("root/team");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/policies/${account}/policy/root%2Fteam`,
      { headers: { accept: "text/plain" } },
    );
  });

  it("loads policy content and parses the server response", async () => {
    apiRequestTextFullResponseMock.mockResolvedValue({
      status: 200,
      data: JSON.stringify({ status: "ok", created: {}, updated: {}, deleted: {} }),
    });

    await expect(
      policyService.loadPolicy("- !user alice", "root/team", "POST", true),
    ).resolves.toEqual({
      status: 200,
      data: { status: "ok", created: {}, updated: {}, deleted: {} },
    });
    expect(apiRequestTextFullResponseMock).toHaveBeenCalledWith(
      `/policies/${account}/policy/root%2Fteam`,
      {
        method: "POST",
        query: { dryRun: true },
        headers: { accept: "text/plain" },
        body: "- !user alice",
      },
    );
  });
});
