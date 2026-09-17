CREATE TABLE "sac_processo_mensagem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"processo_id" uuid NOT NULL,
	"autor_papel" text NOT NULL,
	"autor_nome" text NOT NULL,
	"conteudo" text NOT NULL,
	"lida_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sac_processo_mensagem" ADD CONSTRAINT "sac_processo_mensagem_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_processo_mensagem" ADD CONSTRAINT "sac_processo_mensagem_processo_id_sac_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."sac_processo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sac_processo_mensagem_processo_idx" ON "sac_processo_mensagem" USING btree ("processo_id","created_at");--> statement-breakpoint
CREATE INDEX "sac_processo_mensagem_leitura_idx" ON "sac_processo_mensagem" USING btree ("processo_id","autor_papel");
