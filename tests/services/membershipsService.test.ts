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
import { membershipsService } from "../../src/services/membershipsService";

const apiRequestMock = vi.mocked(apiRequest);
const headers = { accept: "application/json" };
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("membershipsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiRequestMock.mockResolvedValue(undefined as never);
  });

  it("builds a role request", async () => {
    await membershipsService.getRole("group", "team/a", { limit: 10 });

    expect(apiRequestMock).toHaveBeenCalledWith(`/roles/${account}/group/team%2Fa`, {
      query: { limit: 10 },
      headers,
    });
  });

  it("adds the correct query flag for each membership view", async () => {
    await membershipsService.listMembers("group", "team", { offset: 5 });
    await membershipsService.listMemberships("group", "team");
    await membershipsService.listAllMemberships("group", "team");
    await membershipsService.getGraph("group", "team");

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, `/roles/${account}/group/team`, {
      query: { offset: 5, members: "true" },
      headers,
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, `/roles/${account}/group/team`, {
      query: { memberships: "true" },
      headers,
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(3, `/roles/${account}/group/team`, {
      query: { all: "true" },
      headers,
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(4, `/roles/${account}/group/team`, {
      query: { graph: "true" },
      headers,
    });
  });

  it("adds and removes a member", async () => {
    await membershipsService.addMember("group", "team", "conjur:user:alice");
    await membershipsService.removeMember("group", "team", "conjur:user:alice");

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, `/roles/${account}/group/team`, {
      method: "POST",
      query: { members: "true", member: "conjur:user:alice" },
      headers,
    });
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, `/roles/${account}/group/team`, {
      method: "DELETE",
      query: { members: "true", member: "conjur:user:alice" },
      headers,
    });
  });

  it("surfaces Conjur membership error messages", async () => {
    apiRequestMock.mockRejectedValue(
      new ApiError(
        {
          error: {
            code: "conflict",
            message: "Role is already a member",
          },
        },
        409,
      ),
    );

    await expect(
      membershipsService.addMember("group", "team", "conjur:user:alice"),
    ).rejects.toThrow("Role is already a member");
  });
});
