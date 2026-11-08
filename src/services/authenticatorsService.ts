import { ApiError, apiRequest } from './apiClient'
import type {
  AuthenticatorType,
  AuthenticatorV2Response,
  ConjurV2ErrorResponse,
  CreateAuthenticatorV2Request,
  AuthenticatorsV2ListEnvelopeResponse,
  ListAuthenticatorsV2QueryRequest,
  ProvidersListResponse,
  AuthenticatorsIndexResponse,
} from '../types'
import { CONJUR_ACCOUNT } from "../config";
const RootPath = `/authenticators/${encodeURIComponent(CONJUR_ACCOUNT)}`;
const V2Headers = { accept: 'application/x.secretsmgr.v2beta+json' };

function getConjurV2ErrorMessage(
  response: ConjurV2ErrorResponse | null | undefined,
): string | null {
  const topLevelMessage = response?.message;
  if (typeof topLevelMessage === "string") {
    const message = topLevelMessage.trim();
    if (message) {
      return message;
    }
  }

  return null;
}

function throwAuthenticatorError(error: unknown): never {
  if (error instanceof ApiError) {
    const response = (error as ApiError<ConjurV2ErrorResponse>).response;
    const message = getConjurV2ErrorMessage(response);
    if (message) {
      throw new Error(message);
    }
  }

  throw error instanceof Error ? error : new Error("Authenticator request failed.");
}


export const authenticatorsService = {
  providers() {
    const path = `/authn-oidc/${encodeURIComponent(CONJUR_ACCOUNT)}/providers`
    return apiRequest<ProvidersListResponse>(path, {
      headers: V2Headers,
    }).catch(throwAuthenticatorError)
  },
  // This v1 endpoint reports Conjur's effective state, including authenticators
  // enabled through CONJUR_AUTHENTICATORS or conjur.yml.
  index() {
    return apiRequest<AuthenticatorsIndexResponse>("/authenticators")
  },
  list(params: ListAuthenticatorsV2QueryRequest = {}) {
    return apiRequest<AuthenticatorsV2ListEnvelopeResponse>(RootPath, {
      query: params,
      headers: V2Headers,
    }).catch(throwAuthenticatorError)
  },  
  get(type: AuthenticatorType, service_id: string) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<AuthenticatorV2Response>(path, {
      headers: V2Headers,
    }).catch(throwAuthenticatorError)
  },
  update(enablement: boolean, type: AuthenticatorType, service_id: string) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<AuthenticatorV2Response>(path , {
			method: 'PATCH',
			headers: V2Headers,
   		body: {
      	enabled: enablement
    	},
    }).catch(throwAuthenticatorError)
	},  
	delete(type: AuthenticatorType, service_id: string) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<void>(path , {
			method: 'DELETE',
			headers: V2Headers,
    }).catch(throwAuthenticatorError)
	}, create(authenticator: CreateAuthenticatorV2Request) {
    const path = `${RootPath}`
    return apiRequest<AuthenticatorV2Response>(path , {
			method: 'POST',
			headers: V2Headers, body: authenticator
    }).catch(throwAuthenticatorError)
	},
}
