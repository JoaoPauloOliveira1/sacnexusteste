# API Documentation

## REST APIs

### Health Check
- **Method**: GET
- **Path**: `/health`
- **Purpose**: Non-sensitive liveness check for the IDP service.
- **Request**: No body.
- **Response**: Health status payload.

### Readiness Check
- **Method**: GET
- **Path**: `/ready`
- **Purpose**: Non-sensitive readiness check including PostgreSQL connectivity.
- **Request**: No body.
- **Response**: Readiness status payload.

### Sign Up With Email
- **Method**: POST
- **Path**: `/api/auth/sign-up/email`
- **Purpose**: Create an email/password identity account and send a verification email.
- **Request**: Email/password signup data.
- **Response**: Sanitized Better Auth response and cookies when applicable.

### Sign In With Email
- **Method**: POST
- **Path**: `/api/auth/sign-in/email`
- **Purpose**: Authenticate an email/password user and set session cookies.
- **Request**: Email/password credentials.
- **Response**: Sanitized auth response and session cookies.

### Send Verification Email
- **Method**: POST
- **Path**: `/api/auth/send-verification-email`
- **Purpose**: Send or resend a verification email without account enumeration.
- **Request**: Email or Better Auth-compatible payload.
- **Response**: Generic success for non-5xx outcomes.

### Verify Email
- **Method**: GET
- **Path**: `/api/auth/verify-email`
- **Purpose**: Consume a verification token and optionally redirect.
- **Request**: Token and callback query parameters.
- **Response**: Better Auth verification response or redirect.

### Request Password Reset
- **Method**: POST
- **Path**: `/api/auth/request-password-reset`
- **Purpose**: Request password reset email without account enumeration.
- **Request**: Email payload.
- **Response**: Generic success for non-5xx outcomes.

### Password Reset Callback
- **Method**: GET
- **Path**: `/api/auth/reset-password/:token`
- **Purpose**: Validate reset token and redirect to frontend reset UX.
- **Request**: Token path parameter.
- **Response**: Redirect or Better Auth response.

### Reset Password
- **Method**: POST
- **Path**: `/api/auth/reset-password`
- **Purpose**: Complete password reset with token and new password.
- **Request**: Reset token and new password.
- **Response**: Sanitized Better Auth response.

### Change Password
- **Method**: POST
- **Path**: `/api/auth/change-password`
- **Purpose**: Change password for authenticated user and revoke other sessions.
- **Request**: Current/new password payload and session cookies.
- **Response**: Sanitized Better Auth response.

### Sign Out
- **Method**: POST
- **Path**: `/api/auth/sign-out`
- **Purpose**: Sign out current session.
- **Request**: Session cookies.
- **Response**: Sanitized Better Auth response.

### Get Session
- **Method**: GET
- **Path**: `/api/auth/session`
- **Purpose**: Return sanitized current session/user payload.
- **Request**: Session cookies.
- **Response**: Authenticated user/session summary or `{ "authenticated": false }`.

### Auth Handler Availability
- **Method**: GET
- **Path**: `/api/auth/ok`
- **Purpose**: Check Better Auth handler availability/status.
- **Request**: No body.
- **Response**: Status payload.

## Internal APIs

### Web Runtime Config Loader
- **Methods**: `loadRuntimeConfig()`.
- **Parameters**: None.
- **Return Types**: Validated public runtime configuration.

### Web HTTP Client Factory
- **Methods**: Shared ky-based HTTP client creation.
- **Parameters**: Runtime API URL.
- **Return Types**: Configured HTTP client.

### IDP App Factory
- **Methods**: `createApp()`.
- **Parameters**: Optional dependency overrides for tests.
- **Return Types**: Fastify application instance.

### Identity Auth Service
- **Methods**: Better Auth wrapper methods for signup, signin, verification, reset, change password, signout, session, ok.
- **Parameters**: Route request context and Better Auth-compatible payloads.
- **Return Types**: Sanitized route responses and propagated cookies/headers.

## Data Models

### `idp_user`
- **Fields**: `id`, `name`, `email`, `email_verified`, `image`, timestamps.
- **Relationships**: Owns sessions and auth accounts.
- **Validation**: Email uniqueness enforced by index.

### `idp_session`
- **Fields**: `id`, `expires_at`, `token`, `ip_address`, `user_agent`, `user_id`, timestamps.
- **Relationships**: Belongs to `idp_user` with cascade delete.
- **Validation**: Token uniqueness enforced by index.

### `idp_account`
- **Fields**: `id`, provider/account IDs, `user_id`, OAuth token columns, `password`, timestamps.
- **Relationships**: Belongs to `idp_user` with cascade delete.
- **Validation**: Managed by Better Auth and Drizzle schema.

### `idp_verification`
- **Fields**: `id`, `identifier`, `value`, `expires_at`, timestamps.
- **Relationships**: Auth verification records used by Better Auth.
- **Validation**: Expiry enforced by auth workflow.
