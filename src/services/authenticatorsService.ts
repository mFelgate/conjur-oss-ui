import { apiRequest } from './apiClient'
import type {
  AuthenticatorV2Response,
  AuthenticatorsV2ListResponse,
  ListAuthenticatorsV2QueryRequest,
} from '../types'
import { CONJUR_ACCOUNT } from "../config";
const RootPath = `/authenticators/${encodeURIComponent(CONJUR_ACCOUNT)}`;


export const authenticatorsService = {
  providers() {
    const path = `/authn-oidc/cucumber/providers`
    return apiRequest<ProviderResponse>(path, {
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
  get(type, service_id) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<AuthenticatorV2Response>(path, {
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },
  update(enablement, type, service_id) {
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
	delete(type, service_id) {
    const path = `${RootPath}/${encodeURIComponent(type)}/${encodeURIComponent(service_id)}`
    return apiRequest<void>(path , {
			method: 'DELETE',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    },)
	}, create(authenticator) {
    const path = `${RootPath}`
    return apiRequest<AuthenticatorV2Response>(path , {
			method: 'POST',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      }, body: authenticator
    },)
	},
}
