#!/bin/sh
set -eu

CONFIG_PATH="/tmp/sac-nexus-config.json"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

api_url="$(json_escape "${WEB_API_URL:-/api}")"
auth_url="$(json_escape "${WEB_AUTH_URL:-/api/auth}")"
app_name="$(json_escape "${WEB_APP_NAME:-SAC Nexus}")"
app_env="$(json_escape "${WEB_APP_ENV:-production}")"
google_maps_api_key="$(json_escape "${WEB_GOOGLE_MAPS_API_KEY:-}")"
enable_msw="${WEB_ENABLE_MSW:-false}"

case "$enable_msw" in
  true | false) ;;
  *) enable_msw="false" ;;
esac

cat > "$CONFIG_PATH" <<EOF
{
  "apiUrl": "$api_url",
  "authUrl": "$auth_url",
  "appName": "$app_name",
  "appEnv": "$app_env",
  "enableMsw": $enable_msw,
  "googleMapsApiKey": "$google_maps_api_key"
}
EOF
