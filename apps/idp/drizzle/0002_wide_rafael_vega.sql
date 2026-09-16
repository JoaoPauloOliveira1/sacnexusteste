CREATE TABLE "idp_tenant" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp_tenant_domain" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"normalized_host" text NOT NULL,
	"domain_type" text DEFAULT 'alias' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idp_tenant" ADD CONSTRAINT "idp_tenant_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idp_tenant_domain" ADD CONSTRAINT "idp_tenant_domain_tenant_id_idp_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."idp_tenant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idp_tenant_organization_id_idx" ON "idp_tenant" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idp_tenant_domain_normalized_host_idx" ON "idp_tenant_domain" USING btree ("normalized_host");--> statement-breakpoint
CREATE INDEX "idp_tenant_domain_tenant_id_idx" ON "idp_tenant_domain" USING btree ("tenant_id");