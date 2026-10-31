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
import { policyService } from "../../src/services/policyService";

const apiRequestTextMock = vi.mocked(apiRequestText);
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("policyService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gets the effective policy as plain text", async () => {
    apiRequestTextMock.mockResolvedValue("policy");

    await policyService.getEffectivePolicy("root/team");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/policies/${account}/policy/root%2Fteam`,
      { headers: { accept: "text/plain" } },
    );
  });

  it("loads policy content and parses the server response", async () => {
    apiRequestTextMock.mockResolvedValue(
      JSON.stringify({ status: "ok", created: {}, updated: {}, deleted: {} }),
    );

    await expect(
      policyService.loadPolicy("- !user alice", "root/team", "POST", true),
    ).resolves.toEqual({ status: "ok", created: {}, updated: {}, deleted: {} });
    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/policies/${account}/policy/root%2Fteam`,
      {
        method: "POST",
        query: { dryRun: true },
        headers: { accept: "text/plain" },
        body: "- !user alice",
      },
    );
  });

  it("maps dry-run 422 payload into structured policy errors", async () => {
    apiRequestTextMock.mockRejectedValue(
      new ApiError(
        {
          status: "Invalid YAML",
          errors: [
            {
              line: 3,
              column: 4,
              message: "unexpected token",
              context: {
                policy_id: "root",
                offending_lines: [3],
              },
            },
          ],
        },
        422,
      ),
    );

    await expect(
      policyService.loadPolicy("- !bad", "root", "POST", true),
    ).rejects.toMatchObject({
      status: 422,
      response: {
        status: "Invalid YAML",
        errors: [
          expect.objectContaining({
            line: 3,
            message: "unexpected token",
          }),
        ],
      },
      message: "Dry run validation failed.",
    });
  });

  it("surfaces dry-run message-only validation errors", async () => {
    apiRequestTextMock.mockRejectedValue(
      new ApiError(
        {
          error: {
            code: "validation_failed",
            message: "Policy validation failed.",
          },
        },
        422,
      ),
    );

    await expect(
      policyService.loadPolicy("- !bad", "root", "POST", true),
    ).rejects.toMatchObject({
      status: 422,
      message: "Policy validation failed.",
      response: {
        error: {
          code: "validation_failed",
        },
      },
    });
  });

  it("returns apply-path specific message when non-dry-run load fails", async () => {
    apiRequestTextMock.mockRejectedValue(
      new ApiError(
        {
          error: {
            code: "policy_invalid",
            message: "Error at line 1, column 0 in policy : Unexpected scalar",
            innererror: {
              code: "policy_invalid",
              filename: "policy",
              line: 1,
              column: 0,
            },
          },
        },
        403,
      ),
    );

    await expect(
      policyService.loadPolicy("- !user alice", "root", "POST", false),
    ).rejects.toThrow("Error at line 1, column 0 in policy : Unexpected scalar");

    expect(apiRequestTextMock).toHaveBeenCalledWith(
      `/policies/${account}/policy/root`,
      expect.objectContaining({
        query: { dryRun: false },
      }),
    );
  });
});
