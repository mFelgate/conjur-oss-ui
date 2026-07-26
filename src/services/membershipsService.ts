import { apiRequest } from './apiClient'
import type {
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
    })
  },
}
