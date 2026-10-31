import { ApiError, apiRequest, getConjurErrorMessage } from './apiClient'
import type {
  ConjurErrorResponse,
  RoleGraphResponse,
  RoleMembersResponse,
  RoleResponse,
  ShowRoleQueryRequest,
} from '../types'

import { CONJUR_ACCOUNT } from "../config";

function rolePath(kind: string, identifier: string) {
  return `/roles/${CONJUR_ACCOUNT}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`
}

export const membershipsService = {
  getRole(kind: string, identifier: string, params: ShowRoleQueryRequest = {}) {
    return apiRequest<RoleResponse>(rolePath(kind, identifier), {
      query: params,
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }
      }

      throw error instanceof Error ? error : new Error("Failed to load role.");
    })
  },

  listMembers(kind: string, identifier: string, params: Omit<ShowRoleQueryRequest, 'members'> = {}) {
    return apiRequest<RoleMembersResponse>(rolePath(kind, identifier), {
      query: {
        ...params,
        members: 'true',
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }
      }

      throw error instanceof Error ? error : new Error("Failed to load members.");
    })
  },

  listMemberships(kind: string, identifier: string, params: Omit<ShowRoleQueryRequest, 'memberships'> = {}) {
    return apiRequest<string[]>(rolePath(kind, identifier), {
      query: {
        ...params,
        memberships: 'true',
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }
      }

      throw error instanceof Error ? error : new Error("Failed to load memberships.");
    })
  },

  listAllMemberships(kind: string, identifier: string, params: Omit<ShowRoleQueryRequest, 'all'> = {}) {
    return apiRequest<string[]>(rolePath(kind, identifier), {
      query: {
        ...params,
        all: 'true',
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }
      }

      throw error instanceof Error ? error : new Error("Failed to load memberships.");
    })
  },

  getGraph(kind: string, identifier: string, params: Omit<ShowRoleQueryRequest, 'graph'> = {}) {
    return apiRequest<RoleGraphResponse>(rolePath(kind, identifier), {
      query: {
        ...params,
        graph: 'true',
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }
      }

      throw error instanceof Error ? error : new Error("Failed to load membership graph.");
    })
  },

  addMember(kind: string, identifier: string, member: string) {
    return apiRequest<void>(rolePath(kind, identifier), {
      method: 'POST',
      query: {
        members: 'true',
        member: member
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }

        if (error.status === 403) {
          throw new Error("You are not authorized to modify this group membership.");
        }

        if (error.status === 404) {
          throw new Error("Group or member not found.");
        }

        if (error.status === 409) {
          throw new Error("Membership conflict: member already exists or state is invalid.");
        }
      }

      throw error instanceof Error ? error : new Error("Failed to add member.");
    })
  },

  removeMember(kind: string, identifier: string, member: string) {
    return apiRequest<void>(rolePath(kind, identifier), {
      method: 'DELETE',
      query: {
        members: 'true',
        member,
      },
      headers: {
        accept: 'application/json',
      },
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);
        if (message) {
          throw new Error(message);
        }

        if (error.status === 403) {
          throw new Error("You are not authorized to modify this group membership.");
        }

        if (error.status === 404) {
          throw new Error("Group or member not found.");
        }

        if (error.status === 409) {
          throw new Error("Membership conflict: member already exists or state is invalid.");
        }
      }

      throw error instanceof Error ? error : new Error("Failed to remove member.");
    })
  },
}
