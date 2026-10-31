import { ApiError, apiRequest, getConjurErrorMessage } from './apiClient'
import type {
  ConjurErrorResponse,
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
    }).catch((error) => {
      if (error instanceof ApiError) {
        const response = (error as ApiError<ConjurErrorResponse>).response;
        const message = getConjurErrorMessage(response);

        if (message) {
          throw new Error(message);
        }
      }

      throw error;
    })
  }
}
