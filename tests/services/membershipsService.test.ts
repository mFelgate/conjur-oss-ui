import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/apiClient", () => ({ apiRequest: vi.fn() }));

import { apiRequest } from "../../src/services/apiClient";
import { CONJUR_ACCOUNT } from "../../src/config";
import { membershipsService } from "../../src/services/membershipsService";

const apiRequestMock = vi.mocked(apiRequest);
const headers = { accept: "application/json" };
const account = encodeURIComponent(CONJUR_ACCOUNT);

describe("membershipsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("builds a role request", () => {
    membershipsService.getRole("group", "team/a", { limit: 10 });

    expect(apiRequestMock).toHaveBeenCalledWith(`/roles/${account}/group/team%2Fa`, {
      query: { limit: 10 },
      headers,
    });
  });

  it("adds the correct query flag for each membership view", () => {
    membershipsService.listMembers("group", "team", { offset: 5 });
    membershipsService.listMemberships("group", "team");
    membershipsService.listAllMemberships("group", "team");
    membershipsService.getGraph("group", "team");

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

  it("adds and removes a member", () => {
    membershipsService.addMember("group", "team", "conjur:user:alice");
    membershipsService.removeMember("group", "team", "conjur:user:alice");

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
});
