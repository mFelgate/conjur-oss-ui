import { apiRequest } from './apiClient'
import type {
  AuthenticatorType,
  AuthenticatorV2Response,
  CreateAuthenticatorV2Request,
  AuthenticatorsV2ListEnvelopeResponse,
  ListAuthenticatorsV2QueryRequest,
  ProvidersListResponse,
} from '../types'
import { CONJUR_ACCOUNT } from "../config";
const RootPath = `/authenticators/${encodeURIComponent(CONJUR_ACCOUNT)}`;


export const authenticatorsService = {
  providers() {
    const path = `/authn-oidc/cucumber/providers`
    return apiRequest<ProvidersListResponse>(path, {
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },
  list(params: ListAuthenticatorsV2QueryRequest = {}) {
    return apiRequest<AuthenticatorsV2ListEnvelopeResponse>(RootPath, {
      query: params,
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },  
  get(type: AuthenticatorType, service_id: string) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<AuthenticatorV2Response>(path, {
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },
  update(enablement: boolean, type: AuthenticatorType, service_id: string) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<AuthenticatorV2Response>(path , {
			method: 'PATCH',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
   		body: {
      	enabled: enablement
    	},
    },)
	},  
	delete(type: AuthenticatorType, service_id: string) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<void>(path , {
			method: 'DELETE',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    },)
	}, create(authenticator: CreateAuthenticatorV2Request) {
    const path = `${RootPath}`
    return apiRequest<AuthenticatorV2Response>(path , {
			method: 'POST',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      }, body: authenticator
    },)
	},
}
