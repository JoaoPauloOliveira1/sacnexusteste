export type SignInEmailBody = {
  email: string
  password: string
}

export type SignUpEmailBody = {
  callbackURL?: string
  email: string
  name: string
  password: string
}

export type SendVerificationEmailBody = {
  callbackURL?: string
  email: string
}

export type RequestPasswordResetBody = {
  email: string
  redirectTo?: string
}

export type RequestPasswordResetCallbackParams = {
  token: string
}

export type RequestPasswordResetCallbackQuery = {
  callbackURL: string
}

export type ResetPasswordBody = {
  newPassword: string
  token: string
}

export type VerifyEmailQuery = {
  callbackURL?: string
  token: string
}

export type ChangePasswordBody = {
  currentPassword: string
  newPassword: string
  revokeOtherSessions?: boolean
}

export type IdentityAuthService = {
  changePassword: (body: ChangePasswordBody, headers: Headers) => Promise<Response>
  getSession: (headers: Headers) => Promise<Response>
  ok: () => Promise<Response>
  requestPasswordResetCallback: (
    params: RequestPasswordResetCallbackParams,
    query: RequestPasswordResetCallbackQuery,
    headers: Headers,
  ) => Promise<Response>
  requestPasswordReset: (body: RequestPasswordResetBody, headers: Headers) => Promise<Response>
  resetPassword: (body: ResetPasswordBody, headers: Headers) => Promise<Response>
  sendVerificationEmail: (body: SendVerificationEmailBody, headers: Headers) => Promise<Response>
  signInEmail: (body: SignInEmailBody, headers: Headers) => Promise<Response>
  signOut: (headers: Headers) => Promise<Response>
  signUpEmail: (body: SignUpEmailBody, headers: Headers) => Promise<Response>
  verifyEmail: (query: VerifyEmailQuery, headers: Headers) => Promise<Response>
}
