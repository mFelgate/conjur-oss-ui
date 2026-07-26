#!/bin/bash

# Keycloak Setup Script for Local OIDC Testing
# This script initializes a Keycloak realm and client for testing the Angular app

set -e

KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin123"
REALM_NAME="conjur-test"
CLIENT_ID="conjur-app"
CLIENT_SECRET="conjur-secret"
REDIRECT_URI="http://localhost:5173/login/callback"
WEBORIGINS="http://localhost:5173"
LOGOUT_URI="http://localhost:5173/login"

echo "⏳ Waiting for Keycloak to be ready..."
for i in {1..60}; do
  if curl -s "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; then
    echo "✅ Keycloak is ready"
    break
  fi
  echo "⏳ Waiting... ($i/60)"
  sleep 1
done

# Get access token
echo "🔐 Authenticating with Keycloak..."
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER&password=$ADMIN_PASSWORD&grant_type=password&client_id=admin-cli")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to authenticate. Check Keycloak is running."
  exit 1
fi

echo "✅ Authenticated"

# Create realm
echo "📋 Creating realm '$REALM_NAME'..."
REALM_EXISTS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | grep -c '"realm"' || true)

if [ "$REALM_EXISTS" -eq 0 ]; then
  curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"realm\": \"$REALM_NAME\",
      \"enabled\": true,
      \"displayName\": \"Conjur Test Realm\"
    }"
  echo "✅ Realm created"
else
  echo "✅ Realm already exists"
fi

# Create client
echo "🔧 Creating OIDC client..."
CLIENT_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"name\": \"Conjur UI\",
    \"enabled\": true,
    \"publicClient\": false,
    \"redirectUris\": [
      \"$REDIRECT_URI\"
    ],
    \"webOrigins\": [
      \"$WEBORIGINS\"
    ],
    \"attributes\": {
      \"post.logout.redirect.uris\": \"$LOGOUT_URI\"
    }
  }")

CLIENT_UUID=$(echo "$CLIENT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CLIENT_UUID" ]; then
  # Client might already exist, fetch it
  echo "  Client may already exist, fetching..."
  CLIENT_UUID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$CLIENT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

echo "✅ Client created/found (ID: $CLIENT_UUID)"

# Set client secret
echo "🔐 Configuring client credentials..."
curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"secret\": \"$CLIENT_SECRET\"
  }" > /dev/null

echo "✅ Client secret set"

# Create test user
echo "👤 Creating test user..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser\",
    \"email\": \"testuser@example.com\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"enabled\": true,
    \"emailVerified\": true
  }" 2>/dev/null || echo "  (User may already exist)"

# Set password for test user
TEST_USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=testuser" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$TEST_USER_ID" ]; then
  curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$TEST_USER_ID/reset-password" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"password\",
      \"value\": \"testpass123\",
      \"temporary\": false
    }" > /dev/null
  echo "✅ Test user created (username: testuser, password: testpass123)"
fi

echo ""
echo "🎉 Keycloak setup complete!"
echo ""
echo "📍 Keycloak Admin Console: $KEYCLOAK_URL/admin"
echo "   Username: $ADMIN_USER"
echo "   Password: $ADMIN_PASSWORD"
echo ""
echo "🔍 Client Configuration:"
echo "   Realm: $REALM_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: $CLIENT_SECRET"
echo "   Redirect URI: $REDIRECT_URI"
echo ""
echo "👤 Test User:"
echo "   Username: testuser"
echo "   Password: testpass123"
echo ""
