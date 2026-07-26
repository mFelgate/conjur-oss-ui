import { apiRequest } from './apiClient'
import type {
  AuthenticatorV2Response,
  AuthenticatorsV2ListResponse,
  ListAuthenticatorsV2QueryRequest,
} from '../types'
const ACCOUNT = 'conjur.account'


export const authenticatorsService = {
  providers() {
    const account = localStorage.getItem(ACCOUNT)?.trim()
    const path = `/authn-oidc/cucumber/providers`
    return apiRequest<ProviderResponse>(path, {
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },
  list(params: ListAuthenticatorsV2QueryRequest = {}) {
    const account = localStorage.getItem(ACCOUNT)?.trim()
    const path = `/authenticators/${account}`
    return apiRequest<AuthenticatorsV2ListEnvelopeResponse>(path, {
      query: params,
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },  
  get(type, service_id) {
    const account = localStorage.getItem(ACCOUNT)?.trim()
    const path = `/authenticators/${account}/${type}/${service_id}`
    return apiRequest<AuthenticatorV2Response>(path, {
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    })
  },
  update(enablement, type, service_id) {
    const account = localStorage.getItem(ACCOUNT)?.trim()
    const path = `/authenticators/${account}/${type}/${service_id}`
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
    const account = localStorage.getItem(ACCOUNT)?.trim()
    const path = `/authenticators/${account}/${type}/${service_id}`
    return apiRequest<void>(path , {
			method: 'DELETE',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      },
    },)
	}, create(authenticator) {
    const account = localStorage.getItem(ACCOUNT)?.trim()
    const path = `/authenticators/${account}`
    return apiRequest<AuthenticatorV2Response>(path , {
			method: 'POST',
      headers: {
        accept: 'application/x.secretsmgr.v2beta+json',
      }, body: authenticator
    },)
	},
}
