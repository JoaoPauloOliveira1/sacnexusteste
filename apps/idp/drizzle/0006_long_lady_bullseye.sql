ALTER TABLE "sac_unidade" ADD COLUMN "is_matriz" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sac_unidade" ADD COLUMN "pavimentos" integer;--> statement-breakpoint
ALTER TABLE "sac_unidade" ADD COLUMN "ocupacao" integer;--> statement-breakpoint
ALTER TABLE "sac_unidade" ADD COLUMN "tipo_exploracao" text;