export type AuthenticatorType =
  | 'jwt'
  | 'oidc'
  | 'k8s'
  | 'azure'
  | 'aws'
  | 'gcp'
  | 'ldap'
  | 'certificate'

export interface AuthenticatorIdentityConfig {
  token_app_property?: string
  enforced_claims?: string[]
  claim_aliases?: Record<string, string>
  identity_path?: string
}

export interface JwtAuthenticatorDataConfig {
  jwks_uri?: string
  audience?: string
  issuer?: string
  public_keys?: unknown
  identity?: AuthenticatorIdentityConfig
  [key: string]: unknown
}

export interface OidcAuthenticatorDataConfig {
  provider_uri?: string
  ca_cert?: string
  token_ttl?: string
  provider_scope?: string
  client_id?: string
  client_secret?: string
  redirect_uri?: string
  claim_mapping?: string
  [key: string]: unknown
}

export interface K8sAuthenticatorDataConfig {
  'ca/key'?: string
  'ca/cert'?: string
  'kubernetes/api_url'?: string
  'kubernetes/ca_cert'?: string
  'kubernetes/service_account_token'?: string
  [key: string]: unknown
}

export interface AzureAuthenticatorDataConfig {
  provider_uri?: string
  [key: string]: unknown
}

export interface LdapAuthenticatorDataConfig {
  bind_password?: string
  tls_ca_cert?: string
  [key: string]: unknown
}

export interface CertificateAuthenticatorDataConfig {
  ca_cert?: string
  crl_url?: string
  [key: string]: unknown
}

export type AuthenticatorDataConfig =
  | JwtAuthenticatorDataConfig
  | OidcAuthenticatorDataConfig
  | K8sAuthenticatorDataConfig
  | AzureAuthenticatorDataConfig
  | LdapAuthenticatorDataConfig
  | CertificateAuthenticatorDataConfig
  | Record<string, unknown>

export interface AuthenticatorAnnotations {
  description?: string
  [key: string]: string | undefined
}

export interface AuthenticatorOwnerResponse {
  id: string
  kind: string
}

export interface CreateAuthenticatorV2Request {
  type: string
  name: string
  enabled: boolean
  data?: AuthenticatorDataConfig
  annotations?: AuthenticatorAnnotations
  owner?: AuthenticatorOwnerResponse
}

export interface ListAuthenticatorsV2QueryRequest {
  filter?: string
  search?: string
  type?: AuthenticatorType
  limit?: number
  offset?: number
}

export interface AuthenticatorV2Response {
  type: string
  branch?: string
  name: string
  enabled: boolean
  owner?: AuthenticatorOwnerResponse
  data?: AuthenticatorDataConfig
  annotations?: AuthenticatorAnnotations
}

export interface AuthenticatorsV2ListEnvelopeResponse {
  authenticators: AuthenticatorV2Response[]
  count: number
}

export interface AuthenticatorsIndexResponse {
  installed: string[]
  configured: string[]
  enabled: string[]
}