ALTER TABLE "sac_evento_temporario" DROP CONSTRAINT "sac_evento_temporario_solicitante_id_sac_pessoa_fisica_id_fk";
--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ALTER COLUMN "solicitante_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ADD COLUMN "solicitante_nome" text;--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ADD COLUMN "solicitante_cpf" text;--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ADD COLUMN "risco" text;--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ADD CONSTRAINT "sac_evento_temporario_solicitante_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("solicitante_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE set null ON UPDATE no action;