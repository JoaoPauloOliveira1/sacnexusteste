CREATE TABLE "idp_account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp_session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idp_verification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idp_account" ADD CONSTRAINT "idp_account_user_id_idp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."idp_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idp_session" ADD CONSTRAINT "idp_session_user_id_idp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."idp_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idp_account_user_id_idx" ON "idp_account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idp_session_token_idx" ON "idp_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idp_session_user_id_idx" ON "idp_session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idp_user_email_idx" ON "idp_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idp_verification_identifier_idx" ON "idp_verification" USING btree ("identifier");