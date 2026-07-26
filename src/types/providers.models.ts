export interface ProviderResponse {
  service_id: string
  type: string
  name: string
  nonce: string
  code_verifier: string
  redirect_uri: string
}


export type ProvidersListResponse = ProviderResponse[]
export type PublicKeysResponse = string