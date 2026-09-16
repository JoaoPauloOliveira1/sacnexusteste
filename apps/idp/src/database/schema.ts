import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

function createTimestamps() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
}

export const user = pgTable(
  'idp_user',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    ...createTimestamps(),
  },
  (table) => [uniqueIndex('idp_user_email_idx').on(table.email)],
)

export const session = pgTable(
  'idp_session',
  {
    id: uuid('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...createTimestamps(),
  },
  (table) => [
    uniqueIndex('idp_session_token_idx').on(table.token),
    index('idp_session_user_id_idx').on(table.userId),
  ],
)

export const account = pgTable(
  'idp_account',
  {
    id: uuid('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    ...createTimestamps(),
  },
  (table) => [index('idp_account_user_id_idx').on(table.userId)],
)

export const verification = pgTable(
  'idp_verification',
  {
    id: uuid('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...createTimestamps(),
  },
  (table) => [index('idp_verification_identifier_idx').on(table.identifier)],
)

export const organization = pgTable(
  'idp_organization',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logo: text('logo'),
    metadata: text('metadata'),
    ...createTimestamps(),
  },
  (table) => [uniqueIndex('idp_organization_slug_idx').on(table.slug)],
)

export const member = pgTable(
  'idp_member',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idp_member_organization_user_idx').on(table.organizationId, table.userId),
    index('idp_member_organization_id_idx').on(table.organizationId),
    index('idp_member_user_id_idx').on(table.userId),
  ],
)

export const invitation = pgTable(
  'idp_invitation',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role').notNull(),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    inviterId: uuid('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idp_invitation_email_idx').on(table.email),
    index('idp_invitation_organization_id_idx').on(table.organizationId),
    index('idp_invitation_status_idx').on(table.status),
    index('idp_invitation_inviter_id_idx').on(table.inviterId),
  ],
)

export const tenantStatuses = {
  active: 'active',
  disabled: 'disabled',
  pending: 'pending',
} as const

export type TenantStatus = (typeof tenantStatuses)[keyof typeof tenantStatuses]

export const tenantDomainStatuses = tenantStatuses

export type TenantDomainStatus = TenantStatus

export const tenantDomainTypes = {
  alias: 'alias',
  primary: 'primary',
} as const

export type TenantDomainType = (typeof tenantDomainTypes)[keyof typeof tenantDomainTypes]

export const tenant = pgTable(
  'idp_tenant',
  {
    id: uuid('id').primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    status: text('status').$type<TenantStatus>().default(tenantStatuses.pending).notNull(),
    ...createTimestamps(),
  },
  (table) => [uniqueIndex('idp_tenant_organization_id_idx').on(table.organizationId)],
)

export const tenantDomain = pgTable(
  'idp_tenant_domain',
  {
    id: uuid('id').primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenant.id, { onDelete: 'restrict' }),
    normalizedHost: text('normalized_host').notNull(),
    domainType: text('domain_type')
      .$type<TenantDomainType>()
      .default(tenantDomainTypes.alias)
      .notNull(),
    status: text('status').$type<TenantDomainStatus>().default(tenantStatuses.pending).notNull(),
    ...createTimestamps(),
  },
  (table) => [
    uniqueIndex('idp_tenant_domain_normalized_host_idx').on(table.normalizedHost),
    index('idp_tenant_domain_tenant_id_idx').on(table.tenantId),
  ],
)

export const authSchema = {
  account,
  invitation,
  member,
  organization,
  session,
  user,
  verification,
}

// SAC Nexus business domain (Unidade-centric model). Kept in a separate module
// but re-exported here so drizzle-kit and the drizzle client pick up the tables.
export * from '@/database/domain-schema.js'
