#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.start.yaml"

ACCOUNT=""
CONJUR_URI=""
EXTRA_ARGS=()

usage() {
  cat <<'EOF'
Usage:
  ./start.sh --account <conjur-account> --conjur-uri <conjur-url> [extra docker compose args]

Examples:
  ./start.sh --account cucumber --conjur-uri http://conjur:3000
  ./start.sh --account cucumber --conjur-uri http://conjur:3000 -- -d

Notes:
  - Any args after -- are passed to `docker compose up --build`.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -a|--account)
      ACCOUNT="${2:-}"
      shift 2
      ;;
    -u|--conjur-uri)
      CONJUR_URI="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      EXTRA_ARGS=("$@")
      break
      ;;
    *)
      EXTRA_ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ -z "$ACCOUNT" ]]; then
  echo "Error: missing --account"
  usage
  exit 1
fi

if [[ -z "$CONJUR_URI" ]]; then
  echo "Error: missing --conjur-uri"
  usage
  exit 1
fi

export VITE_CONJUR_ACCOUNT="$ACCOUNT"
export VITE_CONJUR_URL="$CONJUR_URI"

echo "Starting Conjur React UI container"
echo "  account: $VITE_CONJUR_ACCOUNT"
echo "  conjur uri: $VITE_CONJUR_URL"

docker compose -f "$COMPOSE_FILE" up --build "${EXTRA_ARGS[@]}"
