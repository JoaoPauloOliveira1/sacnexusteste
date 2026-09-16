CREATE TABLE "idp_invitation" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone,
	"inviter_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp_member" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp_organization" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idp_invitation" ADD CONSTRAINT "idp_invitation_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idp_invitation" ADD CONSTRAINT "idp_invitation_inviter_id_idp_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."idp_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idp_member" ADD CONSTRAINT "idp_member_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idp_member" ADD CONSTRAINT "idp_member_user_id_idp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."idp_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idp_invitation_email_idx" ON "idp_invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idp_invitation_organization_id_idx" ON "idp_invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idp_invitation_status_idx" ON "idp_invitation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idp_invitation_inviter_id_idx" ON "idp_invitation" USING btree ("inviter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idp_member_organization_user_idx" ON "idp_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "idp_member_organization_id_idx" ON "idp_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idp_member_user_id_idx" ON "idp_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idp_organization_slug_idx" ON "idp_organization" USING btree ("slug");