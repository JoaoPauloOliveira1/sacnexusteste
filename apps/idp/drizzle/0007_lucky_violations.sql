CREATE TABLE "sac_triagem_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"item_tipo" text NOT NULL,
	"item_chave" text NOT NULL,
	"estado" text NOT NULL,
	"observacao" text,
	"autor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sac_processo" ADD COLUMN "analista_responsavel" text;--> statement-breakpoint
ALTER TABLE "sac_processo" ADD COLUMN "analise_status" text;--> statement-breakpoint
ALTER TABLE "sac_triagem_item" ADD CONSTRAINT "sac_triagem_item_processo_id_sac_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."sac_processo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sac_triagem_item_processo_idx" ON "sac_triagem_item" USING btree ("processo_id");--> statement-breakpoint
CREATE INDEX "sac_triagem_item_lookup_idx" ON "sac_triagem_item" USING btree ("processo_id","item_tipo","item_chave");