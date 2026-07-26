# Conjur React Development Environment

This directory contains the Docker development environment for the Conjur React UI.

The React application is designed to run **alongside the Conjur development environment**. It does not create or manage its own Conjur instance. Instead, it connects to an existing Conjur dev stack and uses the services already provided by that environment.

For information about setting up the Conjur development environment itself, see:

https://github.com/cyberark/conjur/blob/master/CONTRIBUTING.md

---

## Architecture

The development setup consists of:

- Conjur server (managed by the Conjur repository)
- Supporting services (Postgres, Keycloak, etc.)
- React UI (this repository)

The React container joins the existing Conjur Docker network and communicates with Conjur through the Vite development proxy.

## Connecting to Conjur

By default, the UI is configured to work with the Conjur OSS development environment.

To connect the UI to another Conjur instance:

1. Update the Conjur API URL in the environment configuration.
2. If running with Docker Compose, ensure the UI container is attached to the same Docker network as the Conjur instance.

Example:

```yaml
environment:
  VITE_API_BASE_URL: http://conjur:3000
networks:
  - conjur_default
```

## Keycloak OIDC Development

The development environment supports local OIDC testing using Keycloak as the identity provider.

Keycloak is started as part of the Conjur development environment when the OIDC profile is enabled.

Start the Conjur development environment with OIDC support:

```bash
./start
```

After the Conjur services are running, initialize the Keycloak realm, client, and test user:

```bash
./keycloak_setup.sh
```

The setup script configures the Keycloak environment required for local OIDC testing, including:

- Keycloak realm
- OIDC client configuration
- Test user credentials
- React callback redirect URI

The OIDC authentication flow is:

1. The React UI redirects the user to Keycloak.
2. Keycloak authenticates the user and returns an authorization code.
3. The React UI sends the authorization code to Conjur's OIDC authenticator.
4. Conjur validates the identity with Keycloak.
5. Conjur returns an access token to the React UI.
6. The React UI uses the access token for API requests.
