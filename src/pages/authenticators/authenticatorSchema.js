export const authenticatorSchemas = {
  "OIDC (Conjur UI/Conjur CLI)": {
    authType: "oidc",
    forms: [
      {
        key: "provider_uri",
        label: "Provider URI",
        type: "text",
        required: true,
        rows: 1,
      },
      {
        key: "ca_cert",
        label: "CA Certificate",
        type: "textarea",
        required: false,
        rows: 1,
      },
      {
        key: "token_ttl",
        label: "Token TTL",
        type: "text",
        placeholder: "300s",
        required: false,
        helperText: "ISO 8601 duration specifying the token lifetime. Examples: PT60M (60 minutes), PT1H (1 hour), PT30S (30 seconds). PT60M is the default",
        rows: 1,
      },
      {
        key: "provider_scope",
        label: "Provider Scope",
        type: "text",
        placeholder: "openid email profile",
        required: false,
        rows: 1,
      },
      {
        key: "client_id",
        label: "Client ID",
        type: "text",
        required: true,
        rows: 1,
      },
      {
        key: "client_secret",
        label: "Client Secret",
        type: "password",
        required: true,
        rows: 1,
      },
      {
        key: "redirect_uri",
        label: "Redirect URI",
        type: "text",
        required: true,
        rows: 1,
      },
      {
        key: "claim_mapping",
        label: "Claim Mapping",
        type: "json",
        required: true,
        rows: 1,
      },
    ],
  },

  // OIDC: {
  //   authType: "oidc",
  //   forms: [
  //     {
  //       key: "provider_uri",
  //       label: "Provider URI",
  //       type: "text",
  //       required: true,
  //       rows: 1,
  //     },
  //     {
  //       key: "ca_cert",
  //       label: "CA Certificate",
  //       type: "textarea",
  //       required: false,
  //       rows: 1,
  //     },
  //     {
  //       key: "id_token_user_property",
  //       label: "ID Token User Property",
  //       type: "text",
  //       required: true,
  //       rows: 1,
  //     },
  //   ],
  // },

  JWT: {
    authType: "jwt",
    forms: [
      {
        key: "jwks_uri",
        label: "JWKS URI",
        type: "text",
        required: false,
        rows: 1,
        helperText:
          "A JWT authenticator can have a JWKs URI or a public key, but not both. If you provide a JWKs URI, the public key will be ignored.",
      },
      {
        key: "audience",
        label: "Audience",
        type: "text",
        required: false,
        rows: 1,
      },
      {
        key: "public_keys",
        label: "Public Keys",
        type: "textarea",
        format: "json",
        required: false,
        rows: 10,
        helperText:
          "A JWT authenticator can have a JWKs URI or a public key, but not both. If you provide public keys, use this JSON structure: {\"type\":\"jwks\",\"value\":{\"keys\":[{\"kty\":\"RSA\",\"kid\":\"...\",\"alg\":\"RS256\",\"use\":\"sig\",\"n\":\"...\",\"e\":\"AQAB\"}]}}. If public_keys is set, jwks_uri is ignored.",
      },
      {
        key: "issuer",
        label: "Issuer",
        type: "text",
        required: false,
        rows: 1,
        helperText: "Required when the public_keys field is specified.",
      },
      {
        key: "identity.token_app_property",
        label: "Token App Property",
        type: "text",
        required: false,
        rows: 1,
        helperText:
          "a JWT claim name used to map the authenticator with the ID of the authenticating workload. When specified, the authenticating workload's service ID must be the JWT claim's value",
      },
      {
        key: "identity.identity_path",
        label: "Identity Path",
        type: "text",
        required: false,
        rows: 1,
        helperText:
          "The path in Conjur where the identity will be stored. For example, if you want the identity to be stored at 'conjur/authn-jwt/my-app', then the identity_path would be 'my-app'. This field is required if using token_app_property.",
      },
      {
        key: "identity.enforced_claims",
        label: "Enforced Claims",
        type: "textarea",
        required: false,
        rows: 3,
        helperText:
          "Optional JSON array of claim names to enforce. Example: [\"iss\",\"aud\",\"preferred_username\"].",
      },
      {
        key: "identity.claim_aliases",
        label: "Claim Aliases",
        type: "textarea",
        required: false,
        rows: 4,
        helperText:
          "Optional JSON object mapping token claims to Conjur aliases. Example: {\"preferred_username\":\"username\"}.",
      },
    ],
  },

  K8S: {
    authType: "k8s",
    forms: [
      {
        key: "kubernetes/api_url",
        label: "Kubernetes API URL",
        type: "text",
        required: true,
        rows: 1,
      },
      {
        key: "kubernetes/ca_cert",
        label: "Kubernetes CA Certificate",
        type: "textarea",
        required: true,
        rows: 1,
      },
      {
        key: "kubernetes/service_account_token",
        label: "Service Account Token",
        type: "password",
        required: true,
        rows: 1,
      },
      {
        key: "ca/key",
        label: "CA Key",
        type: "password",
        required: true,
        rows: 1,
      },
      {
        key: "ca/cert",
        label: "CA Certificate",
        type: "textarea",
        required: true,
        rows: 1,
      },
    ],
  },

  Azure: {
    authType: "azure",
    forms: [
      {
        key: "provider_uri",
        label: "Provider URI",
        type: "text",
        required: true,
        rows: 1,
      },
    ],
  },

  AWS: {
     authType: "aws",
    forms: [],
  },

  GCP: {
    authType: "gcp",
    forms: [],
  },

  LDAP: {
    authType: "ldap",
    forms: [
      {
        key: "bind_password",
        label: "Bind Password",
        type: "password",
        required: true,
        rows: 1,
      },
      {
        key: "tls_ca_cert",
        label: "TLS CA Certificate",
        type: "textarea",
        required: true,
        rows: 10,
      },
    ],
  },

  Certificate: {
     authType: "certificate",
    forms: [
      {
        key: "ca_cert",
        label: "CA Certificate",
        type: "textarea",
        required: true,
        rows: 1,
      },
      {
        key: "crl",
        label: "CRL",
        type: "textarea",
        required: false,
        rows: 1,
      },
      {
        key: "crl_url",
        label: "CRL URL",
        type: "text",
        required: false,
        rows: 1,
      },
      {
        key: "identity.host_mode",
        label: "Host Mode",
        type: "text",
        required: false,
        rows: 1,
      },
      {
        key: "identity.trust_domain",
        label: "Trust Domain",
        type: "text",
        required: false,
        rows: 1,
      },
      {
        key: "identity.identity_path",
        label: "Identity Path",
        type: "text",
        required: false,
        rows: 1,
      },
      {
        key: "identity.san_uri",
        label: "SAN URI",
        type: "array",
        required: false,
        rows: 1,
      },
      {
        key: "identity.san_dns",
        label: "SAN DNS",
        type: "array",
        required: false,
        rows: 1,
      },
      {
        key: "identity.san_ip",
        label: "SAN IP",
        type: "array",
        required: false,
        rows: 1,
      },
      {
        key: "identity.cn",
        label: "Common Name",
        type: "text",
        required: false,
        rows: 1,
      },
    ],
  },
};
