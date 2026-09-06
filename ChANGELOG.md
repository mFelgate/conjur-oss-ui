# Changelog

All notable changes to this project will be documented in this file.


## [1.1.0] - 2026-09-06

### Added

- Policy load response viewing, including the policy version and users created with their API keys.

- Password changing for the current user, requiring the API key or password to be re-entered.

- API key rotation in in resource details for hosts and users

## [1.0.0] - 2026-08-17

### Added

- Initial stable release of the Conjur OSS React UI.

- Modern React-based administration interface for Conjur OSS.

- Password authentication support.

- Secret browsing, creation, and updates.

- Resource and group management.

- Authenticator management.

- Policy YAML editor.

- Effective policy view.

- Policy history with version selection.

- Policy dry-run validation.

- Docker-based development environment.

- Support for interacting with Conjur through its REST API.

### Authentication

- Added password-based Conjur authentication.

- Added OIDC authentication support for local development and testing.

### Developer Experience

- Added automated service tests with Vitest.

- Added Docker configuration for running the application with Conjur OSS.

- Added development configuration and examples for local OIDC testing.


[1.1.0]: https://github.com/mFelgate/conjur-oss-ui/releases/tag/v1.1.0
[1.0.0]: https://github.com/mFelgate/conjur-oss-ui/releases/tag/v1.0.0