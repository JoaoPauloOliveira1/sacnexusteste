CREATE TABLE "sac_autonomo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"pessoa_fisica_id" uuid NOT NULL,
	"nome_fantasia" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_classificacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"unidade_id" uuid,
	"evento_temporario_id" uuid,
	"risco" text NOT NULL,
	"origem" text NOT NULL,
	"concluida_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_cnae" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decreto" text DEFAULT '61.082/2026' NOT NULL,
	"codigo" text NOT NULL,
	"numerico" text NOT NULL,
	"secao" text NOT NULL,
	"secao_descricao" text NOT NULL,
	"atividade" text NOT NULL,
	"cbmpe_nivel" text NOT NULL,
	"nivel_de_risco" text NOT NULL,
	"anexo" text NOT NULL,
	"dispensa_licenciamento_previo" boolean NOT NULL,
	"preliminary_band" text NOT NULL,
	"pagina_doe" text,
	"alterado_por_errata" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_contexto_classificacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classificacao_id" uuid NOT NULL,
	"fatores" jsonb,
	"fonte" text,
	"confianca" numeric(5, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_despachante" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"pessoa_fisica_id" uuid NOT NULL,
	"dados_validados" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"arquivo_ref" text,
	"assinatura_govbr" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_evento_temporario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"solicitante_id" uuid NOT NULL,
	"nome" text,
	"cep" text,
	"logradouro" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"municipio" text,
	"uf" text,
	"inicio_em" timestamp with time zone NOT NULL,
	"termino_em" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_historico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"entidade" text NOT NULL,
	"entidade_id" uuid NOT NULL,
	"acao" text NOT NULL,
	"responsavel_user_id" uuid,
	"antes" jsonb,
	"depois" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_ia_conversa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classificacao_id" uuid NOT NULL,
	"mensagens" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"valor" numeric(12, 2),
	"metodo" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"fonte_confirmacao" text DEFAULT 'simulado' NOT NULL,
	"confirmado_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_pessoa_fisica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"cpf" text NOT NULL,
	"nome" text NOT NULL,
	"email" text,
	"telefone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_pessoa_juridica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"cnpj" text NOT NULL,
	"razao_social" text NOT NULL,
	"nome_fantasia" text,
	"email" text,
	"telefone" text,
	"natureza_juridica" text,
	"porte" text,
	"situacao_cadastral" text,
	"abertura_em" timestamp with time zone,
	"cep" text,
	"logradouro" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"municipio" text,
	"uf" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_pessoa_juridica_cnae" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_juridica_id" uuid NOT NULL,
	"cnae_id" uuid NOT NULL,
	"principal" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_pessoa_juridica_socio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_juridica_id" uuid NOT NULL,
	"cpf" text,
	"nome" text NOT NULL,
	"qualificacao" text
);
--> statement-breakpoint
CREATE TABLE "sac_processo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"unidade_id" uuid,
	"evento_temporario_id" uuid,
	"classificacao_id" uuid,
	"tipo_solicitacao" text NOT NULL,
	"modalidade" text DEFAULT 'regular' NOT NULL,
	"risco" text NOT NULL,
	"fase" text NOT NULL,
	"protocolo_numero" text,
	"protocolado_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_procuracao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"outorgante_id" uuid NOT NULL,
	"outorgado_id" uuid NOT NULL,
	"pessoa_juridica_id" uuid,
	"documento_ref" text,
	"assinatura_govbr" boolean DEFAULT false NOT NULL,
	"validade" timestamp with time zone,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_responsavel_tecnico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"pessoa_fisica_id" uuid NOT NULL,
	"conselho" text NOT NULL,
	"registro_numero" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_resposta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classificacao_id" uuid NOT NULL,
	"pergunta_id" text NOT NULL,
	"grupo" text,
	"valor" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_unidade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"pessoa_juridica_id" uuid,
	"autonomo_id" uuid,
	"nome" text,
	"cep" text,
	"logradouro" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"municipio" text,
	"uf" text,
	"area_construida" numeric(12, 2),
	"caracteristicas" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_unidade_cnae" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unidade_id" uuid NOT NULL,
	"cnae_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sac_vinculo_pf_pj" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"pessoa_fisica_id" uuid NOT NULL,
	"pessoa_juridica_id" uuid NOT NULL,
	"papel" text NOT NULL,
	"origem" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"procuracao_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sac_autonomo" ADD CONSTRAINT "sac_autonomo_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_autonomo" ADD CONSTRAINT "sac_autonomo_pessoa_fisica_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("pessoa_fisica_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_classificacao" ADD CONSTRAINT "sac_classificacao_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_classificacao" ADD CONSTRAINT "sac_classificacao_unidade_id_sac_unidade_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."sac_unidade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_classificacao" ADD CONSTRAINT "sac_classificacao_evento_temporario_id_sac_evento_temporario_id_fk" FOREIGN KEY ("evento_temporario_id") REFERENCES "public"."sac_evento_temporario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_contexto_classificacao" ADD CONSTRAINT "sac_contexto_classificacao_classificacao_id_sac_classificacao_id_fk" FOREIGN KEY ("classificacao_id") REFERENCES "public"."sac_classificacao"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_despachante" ADD CONSTRAINT "sac_despachante_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_despachante" ADD CONSTRAINT "sac_despachante_pessoa_fisica_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("pessoa_fisica_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_documento" ADD CONSTRAINT "sac_documento_processo_id_sac_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."sac_processo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ADD CONSTRAINT "sac_evento_temporario_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_evento_temporario" ADD CONSTRAINT "sac_evento_temporario_solicitante_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("solicitante_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_historico" ADD CONSTRAINT "sac_historico_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_historico" ADD CONSTRAINT "sac_historico_responsavel_user_id_idp_user_id_fk" FOREIGN KEY ("responsavel_user_id") REFERENCES "public"."idp_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_ia_conversa" ADD CONSTRAINT "sac_ia_conversa_classificacao_id_sac_classificacao_id_fk" FOREIGN KEY ("classificacao_id") REFERENCES "public"."sac_classificacao"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pagamento" ADD CONSTRAINT "sac_pagamento_processo_id_sac_processo_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."sac_processo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pessoa_fisica" ADD CONSTRAINT "sac_pessoa_fisica_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pessoa_fisica" ADD CONSTRAINT "sac_pessoa_fisica_user_id_idp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."idp_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pessoa_juridica" ADD CONSTRAINT "sac_pessoa_juridica_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pessoa_juridica_cnae" ADD CONSTRAINT "sac_pessoa_juridica_cnae_pessoa_juridica_id_sac_pessoa_juridica_id_fk" FOREIGN KEY ("pessoa_juridica_id") REFERENCES "public"."sac_pessoa_juridica"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pessoa_juridica_cnae" ADD CONSTRAINT "sac_pessoa_juridica_cnae_cnae_id_sac_cnae_id_fk" FOREIGN KEY ("cnae_id") REFERENCES "public"."sac_cnae"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_pessoa_juridica_socio" ADD CONSTRAINT "sac_pessoa_juridica_socio_pessoa_juridica_id_sac_pessoa_juridica_id_fk" FOREIGN KEY ("pessoa_juridica_id") REFERENCES "public"."sac_pessoa_juridica"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_processo" ADD CONSTRAINT "sac_processo_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_processo" ADD CONSTRAINT "sac_processo_unidade_id_sac_unidade_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."sac_unidade"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_processo" ADD CONSTRAINT "sac_processo_evento_temporario_id_sac_evento_temporario_id_fk" FOREIGN KEY ("evento_temporario_id") REFERENCES "public"."sac_evento_temporario"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_processo" ADD CONSTRAINT "sac_processo_classificacao_id_sac_classificacao_id_fk" FOREIGN KEY ("classificacao_id") REFERENCES "public"."sac_classificacao"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_procuracao" ADD CONSTRAINT "sac_procuracao_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_procuracao" ADD CONSTRAINT "sac_procuracao_outorgante_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("outorgante_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_procuracao" ADD CONSTRAINT "sac_procuracao_outorgado_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("outorgado_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_procuracao" ADD CONSTRAINT "sac_procuracao_pessoa_juridica_id_sac_pessoa_juridica_id_fk" FOREIGN KEY ("pessoa_juridica_id") REFERENCES "public"."sac_pessoa_juridica"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_responsavel_tecnico" ADD CONSTRAINT "sac_responsavel_tecnico_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_responsavel_tecnico" ADD CONSTRAINT "sac_responsavel_tecnico_pessoa_fisica_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("pessoa_fisica_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_resposta" ADD CONSTRAINT "sac_resposta_classificacao_id_sac_classificacao_id_fk" FOREIGN KEY ("classificacao_id") REFERENCES "public"."sac_classificacao"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_unidade" ADD CONSTRAINT "sac_unidade_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_unidade" ADD CONSTRAINT "sac_unidade_pessoa_juridica_id_sac_pessoa_juridica_id_fk" FOREIGN KEY ("pessoa_juridica_id") REFERENCES "public"."sac_pessoa_juridica"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_unidade" ADD CONSTRAINT "sac_unidade_autonomo_id_sac_autonomo_id_fk" FOREIGN KEY ("autonomo_id") REFERENCES "public"."sac_autonomo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_unidade_cnae" ADD CONSTRAINT "sac_unidade_cnae_unidade_id_sac_unidade_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."sac_unidade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_unidade_cnae" ADD CONSTRAINT "sac_unidade_cnae_cnae_id_sac_cnae_id_fk" FOREIGN KEY ("cnae_id") REFERENCES "public"."sac_cnae"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_vinculo_pf_pj" ADD CONSTRAINT "sac_vinculo_pf_pj_organization_id_idp_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."idp_organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_vinculo_pf_pj" ADD CONSTRAINT "sac_vinculo_pf_pj_pessoa_fisica_id_sac_pessoa_fisica_id_fk" FOREIGN KEY ("pessoa_fisica_id") REFERENCES "public"."sac_pessoa_fisica"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_vinculo_pf_pj" ADD CONSTRAINT "sac_vinculo_pf_pj_pessoa_juridica_id_sac_pessoa_juridica_id_fk" FOREIGN KEY ("pessoa_juridica_id") REFERENCES "public"."sac_pessoa_juridica"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sac_vinculo_pf_pj" ADD CONSTRAINT "sac_vinculo_pf_pj_procuracao_id_sac_procuracao_id_fk" FOREIGN KEY ("procuracao_id") REFERENCES "public"."sac_procuracao"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sac_autonomo_pf_idx" ON "sac_autonomo" USING btree ("pessoa_fisica_id");--> statement-breakpoint
CREATE INDEX "sac_classificacao_unidade_id_idx" ON "sac_classificacao" USING btree ("unidade_id");--> statement-breakpoint
CREATE INDEX "sac_classificacao_evento_id_idx" ON "sac_classificacao" USING btree ("evento_temporario_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_cnae_decreto_codigo_idx" ON "sac_cnae" USING btree ("decreto","codigo");--> statement-breakpoint
CREATE INDEX "sac_cnae_numerico_idx" ON "sac_cnae" USING btree ("numerico");--> statement-breakpoint
CREATE INDEX "sac_cnae_preliminary_band_idx" ON "sac_cnae" USING btree ("preliminary_band");--> statement-breakpoint
CREATE INDEX "sac_contexto_classificacao_id_idx" ON "sac_contexto_classificacao" USING btree ("classificacao_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_despachante_pf_idx" ON "sac_despachante" USING btree ("pessoa_fisica_id");--> statement-breakpoint
CREATE INDEX "sac_documento_processo_id_idx" ON "sac_documento" USING btree ("processo_id");--> statement-breakpoint
CREATE INDEX "sac_evento_org_id_idx" ON "sac_evento_temporario" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sac_historico_entidade_idx" ON "sac_historico" USING btree ("entidade","entidade_id");--> statement-breakpoint
CREATE INDEX "sac_historico_org_id_idx" ON "sac_historico" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sac_ia_conversa_classificacao_id_idx" ON "sac_ia_conversa" USING btree ("classificacao_id");--> statement-breakpoint
CREATE INDEX "sac_pagamento_processo_id_idx" ON "sac_pagamento" USING btree ("processo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_pessoa_fisica_org_cpf_idx" ON "sac_pessoa_fisica" USING btree ("organization_id","cpf");--> statement-breakpoint
CREATE INDEX "sac_pessoa_fisica_user_id_idx" ON "sac_pessoa_fisica" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_pessoa_juridica_org_cnpj_idx" ON "sac_pessoa_juridica" USING btree ("organization_id","cnpj");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_pj_cnae_pj_cnae_idx" ON "sac_pessoa_juridica_cnae" USING btree ("pessoa_juridica_id","cnae_id");--> statement-breakpoint
CREATE INDEX "sac_pj_cnae_pj_id_idx" ON "sac_pessoa_juridica_cnae" USING btree ("pessoa_juridica_id");--> statement-breakpoint
CREATE INDEX "sac_pj_socio_pj_id_idx" ON "sac_pessoa_juridica_socio" USING btree ("pessoa_juridica_id");--> statement-breakpoint
CREATE INDEX "sac_processo_unidade_id_idx" ON "sac_processo" USING btree ("unidade_id");--> statement-breakpoint
CREATE INDEX "sac_processo_org_id_idx" ON "sac_processo" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_processo_protocolo_idx" ON "sac_processo" USING btree ("protocolo_numero");--> statement-breakpoint
CREATE INDEX "sac_procuracao_org_id_idx" ON "sac_procuracao" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sac_rt_pf_id_idx" ON "sac_responsavel_tecnico" USING btree ("pessoa_fisica_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_rt_conselho_registro_idx" ON "sac_responsavel_tecnico" USING btree ("conselho","registro_numero");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_resposta_classificacao_pergunta_idx" ON "sac_resposta" USING btree ("classificacao_id","pergunta_id");--> statement-breakpoint
CREATE INDEX "sac_unidade_pj_id_idx" ON "sac_unidade" USING btree ("pessoa_juridica_id");--> statement-breakpoint
CREATE INDEX "sac_unidade_autonomo_id_idx" ON "sac_unidade" USING btree ("autonomo_id");--> statement-breakpoint
CREATE INDEX "sac_unidade_org_id_idx" ON "sac_unidade" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sac_unidade_cnae_idx" ON "sac_unidade_cnae" USING btree ("unidade_id","cnae_id");--> statement-breakpoint
CREATE INDEX "sac_unidade_cnae_unidade_id_idx" ON "sac_unidade_cnae" USING btree ("unidade_id");--> statement-breakpoint
CREATE INDEX "sac_vinculo_pj_id_idx" ON "sac_vinculo_pf_pj" USING btree ("pessoa_juridica_id");--> statement-breakpoint
CREATE INDEX "sac_vinculo_pf_id_idx" ON "sac_vinculo_pf_pj" USING btree ("pessoa_fisica_id");--> statement-breakpoint
CREATE INDEX "sac_vinculo_pj_papel_status_idx" ON "sac_vinculo_pf_pj" USING btree ("pessoa_juridica_id","papel","status");