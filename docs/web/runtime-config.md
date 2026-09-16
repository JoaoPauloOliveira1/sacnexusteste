# Web Runtime Config

`apps/web` uses runtime public configuration for deployed containers.

## Why Runtime Config

Vite replaces `import.meta.env` values at build time. To promote one Docker image between preview, staging, and production, deploy-specific public values must be loaded at runtime instead of baked into the bundle.

## Config File

The deployed app loads:

```txt
/config.json
```

The container generates this file at startup from public environment variables.

Example:

```json
{
  "apiUrl": "/api",
  "authUrl": "/api/auth",
  "appName": "SAC Nexus",
  "appEnv": "production",
  "enableMsw": false,
  "googleMapsApiKey": ""
}
```

## Schema

The schema lives in:

```txt
apps/web/src/modules/shared/config/env.ts
```

The async loader lives in:

```txt
apps/web/src/modules/shared/config/runtime-config.ts
```

## Local Development

During Vite development, the app falls back to the validated `VITE_*` values when `/config.json` is not available.

This keeps local development simple while deployed containers still use runtime config.

## Security Rules

- Runtime config is public browser-readable configuration.
- Do not place secrets, tokens, private keys, or privileged internal URLs in `/config.json`.
- Keep real secrets in backend services, GitHub Environment secrets, or Dokploy secrets.
- Use `WEB_*` container env vars for public web configuration.
- Avoid using deploy-specific `VITE_*` values for Docker images that should be promoted across environments.
- `WEB_GOOGLE_MAPS_API_KEY` is public browser-readable configuration for Street View imagery. Restrict it by allowed HTTP referrers in Google Cloud.
