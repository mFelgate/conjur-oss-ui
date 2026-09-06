export type ApiKeyRequest = string
export type ChangePasswordRequest = string
export type AwsSignatureHeaderRequest = string
export type K8sInjectClientCertRequest = string

export interface ConjurAccessTokenRequest {
  login: string
  apiKey: string
}

export interface AzureIdentityTokenRequest {
  jwt: string
}

export interface GoogleIdentityTokenRequest {
  jwt: string
}

export interface JwtTokenRequest {
  jwt: string
}

export interface OidcTokenRequest {
  id_token: string
}

export interface WhoAmIResponse {
  account: string
  client_ip: string
  token_issued_at: string
  user_agent: string
  username: string
}

export type AccessTokenResponse = string
export type ApiKeyResponse = string