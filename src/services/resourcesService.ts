import { apiRequest } from './apiClient'
import type {
  ResourceResponse,
  ResourcesQueryRequest,
  ResourcesResponse,
} from '../types'
import { CONJUR_ACCOUNT } from "../config";
const RootPath = `/resources/${encodeURIComponent(CONJUR_ACCOUNT)}`;

export const resourcesService = {
  list(params: ResourcesQueryRequest = {}) {
    return apiRequest<ResourcesResponse>(RootPath, {
      // Conjur applies pagination before calculating `count`. Count-only
      // requests must therefore omit offset and limit to report the total.
      query: params.count
        ? { ...params }
        : {
            offset: 0,
            limit: 100,
            ...params,
          }
    })
  }, get (kind: string, identifier: string) {
    const path = `${RootPath}/${encodeURIComponent(kind)}/${encodeURIComponent(identifier)}`
    return apiRequest<ResourceResponse>(path, {
      headers: {
        accept: 'application/json',
      },
    })
  }
}
