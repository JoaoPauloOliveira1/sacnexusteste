import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { organization, user } from '@/database/schema.js'

/**
 * SAC Nexus domain schema (Unidade-centric model, 2026-09-10 client review).
 *
 * Tables are prefixed `sac_` to separate the business domain from the identity
 * (`idp_`) tables. Tenant-owned rows reference `idp_organization`; the CNAE
 * reference table is global (national list, per Decreto 61.082/2026).
 *
 * See the dev vault: 02-architecture/Domain Model, CNAE Risk Classification.
 */

function createTimestamps() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
}

// ---------------------------------------------------------------------------
// Enumerations (text + $type, matching the idp schema convention)
// ---------------------------------------------------------------------------

/** Final/working risk band used across classificação and processo. */
export const riscoBands = {
  i: 'I',
  ii: 'II',
  iii: 'III',
  /** CNAE is non-dispensa ("II ou III") but not yet pinned — questions decide. */
  undetermined: 'undetermined',
} as const
export type RiscoBand = (typeof riscoBands)[keyof typeof riscoBands]

/** CBMPE_nivel column from the decree table. */
export const cbmpeNiveis = { i: 'I', ii: 'II', iii: 'III' } as const
export type CbmpeNivel = (typeof cbmpeNiveis)[keyof typeof cbmpeNiveis]

/** Nivel_de_risco column from the decree table (regulatory bucket). */
export const nivelDeRiscoValues = { i: 'I', iiOuIii: 'II ou III' } as const
export type NivelDeRisco = (typeof nivelDeRiscoValues)[keyof typeof nivelDeRiscoValues]

export const vinculoPapeis = {
  proprietario: 'proprietario',
  socio: 'socio',
  despachante: 'despachante',
  responsavelTecnico: 'responsavel_tecnico',
} as const
export type VinculoPapel = (typeof vinculoPapeis)[keyof typeof vinculoPapeis]

export const vinculoOrigens = { automatico: 'automatico', manual: 'manual' } as const
export type VinculoOrigem = (typeof vinculoOrigens)[keyof typeof vinculoOrigens]

export const vinculoStatuses = {
  pending: 'pending',
  active: 'active',
  rejected: 'rejected',
} as const
export type VinculoStatus = (typeof vinculoStatuses)[keyof typeof vinculoStatuses]

export const conselhosProfissionais = { crea: 'CREA', cau: 'CAU', trt: 'TRT' } as const
export type ConselhoProfissional =
  (typeof conselhosProfissionais)[keyof typeof conselhosProfissionais]

export const tipoSolicitacao = {
  novo: 'novo',
  renovacao: 'renovacao',
  alteracao: 'alteracao',
} as const
export type TipoSolicitacao = (typeof tipoSolicitacao)[keyof typeof tipoSolicitacao]

export const modalidadeProcesso = {
  regular: 'regular',
  eventoTemporario: 'evento_temporario',
} as const
export type ModalidadeProcesso = (typeof modalidadeProcesso)[keyof typeof modalidadeProcesso]

export const pagamentoStatuses = { pending: 'pending', confirmed: 'confirmed' } as const
export type PagamentoStatus = (typeof pagamentoStatuses)[keyof typeof pagamentoStatuses]

/** Payment confirmation source. `simulado` is the current default (payment is simulated for now). */
export const pagamentoFontes = {
  simulado: 'simulado',
  banco: 'banco',
  comprovante: 'comprovante',
} as const
export type PagamentoFonte = (typeof pagamentoFontes)[keyof typeof pagamentoFontes]

export const respostaGrupos = { ocupacao: 'ocupacao', publico: 'publico' } as const
export type RespostaGrupo = (typeof respostaGrupos)[keyof typeof respostaGrupos]

// ---------------------------------------------------------------------------
// Reference data — CNAE risk classification (Decreto 61.082/2026, global)
// ---------------------------------------------------------------------------

export const cnae = pgTable(
  'sac_cnae',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    decreto: text('decreto').default('61.082/2026').notNull(),
    codigo: text('codigo').notNull(), // e.g. 4731-8/00
    numerico: text('numerico').notNull(), // e.g. 4731800
    secao: text('secao').notNull(),
    secaoDescricao: text('secao_descricao').notNull(),
    atividade: text('atividade').notNull(),
    cbmpeNivel: text('cbmpe_nivel').$type<CbmpeNivel>().notNull(),
    nivelDeRisco: text('nivel_de_risco').$type<NivelDeRisco>().notNull(),
    anexo: text('anexo').notNull(),
    dispensaLicenciamentoPrevio: boolean('dispensa_licenciamento_previo').notNull(),
    /** Derived per the pre-classification rule (see CNAE Risk Classification). */
    preliminaryBand: text('preliminary_band').$type<RiscoBand>().notNull(),
    paginaDoe: text('pagina_doe'),
    alteradoPorErrata: boolean('alterado_por_errata').default(false).notNull(),
    ...createTimestamps(),
  },
  (table) => [
    uniqueIndex('sac_cnae_decreto_codigo_idx').on(table.decreto, table.codigo),
    index('sac_cnae_numerico_idx').on(table.numerico),
    index('sac_cnae_preliminary_band_idx').on(table.preliminaryBand),
  ],
)

// ---------------------------------------------------------------------------
// Cadastro — people, companies, autônomos, professional profiles, vínculos
// ---------------------------------------------------------------------------

export const pessoaFisica = pgTable(
  'sac_pessoa_fisica',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    /** Optional link to the IDP identity that owns this PF. */
    userId: uuid('user_id').references(() => user.id, { onDelete: 'set null' }),
    cpf: text('cpf').notNull(),
    nome: text('nome').notNull(),
    email: text('email'),
    telefone: text('telefone'),
    ...createTimestamps(),
  },
  (table) => [
    uniqueIndex('sac_pessoa_fisica_org_cpf_idx').on(table.organizationId, table.cpf),
    index('sac_pessoa_fisica_user_id_idx').on(table.userId),
  ],
)

export const pessoaJuridica = pgTable(
  'sac_pessoa_juridica',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    cnpj: text('cnpj').notNull(),
    razaoSocial: text('razao_social').notNull(),
    nomeFantasia: text('nome_fantasia'),
    email: text('email'),
    telefone: text('telefone'),
    naturezaJuridica: text('natureza_juridica'),
    porte: text('porte'),
    situacaoCadastral: text('situacao_cadastral'),
    aberturaEm: timestamp('abertura_em', { withTimezone: true }),
    // Endereço pulled from Receita.
    cep: text('cep'),
    logradouro: text('logradouro'),
    numero: text('numero'),
    complemento: text('complemento'),
    bairro: text('bairro'),
    municipio: text('municipio'),
    uf: text('uf'),
    ...createTimestamps(),
  },
  (table) => [uniqueIndex('sac_pessoa_juridica_org_cnpj_idx').on(table.organizationId, table.cnpj)],
)

/** All CNAEs pulled for a company (Receita). The per-unit confirmed subset lives in `unidadeCnae`. */
export const pessoaJuridicaCnae = pgTable(
  'sac_pessoa_juridica_cnae',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pessoaJuridicaId: uuid('pessoa_juridica_id')
      .notNull()
      .references(() => pessoaJuridica.id, { onDelete: 'cascade' }),
    cnaeId: uuid('cnae_id')
      .notNull()
      .references(() => cnae.id, { onDelete: 'restrict' }),
    principal: boolean('principal').default(false).notNull(),
  },
  (table) => [
    uniqueIndex('sac_pj_cnae_pj_cnae_idx').on(table.pessoaJuridicaId, table.cnaeId),
    index('sac_pj_cnae_pj_id_idx').on(table.pessoaJuridicaId),
  ],
)

/** Quadro societário snapshot, used to validate that a Proprietário is a real sócio. */
export const pessoaJuridicaSocio = pgTable(
  'sac_pessoa_juridica_socio',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pessoaJuridicaId: uuid('pessoa_juridica_id')
      .notNull()
      .references(() => pessoaJuridica.id, { onDelete: 'cascade' }),
    cpf: text('cpf'),
    nome: text('nome').notNull(),
    qualificacao: text('qualificacao'),
  },
  (table) => [index('sac_pj_socio_pj_id_idx').on(table.pessoaJuridicaId)],
)

/** Autônomo — parallel to Empresa; indexed by the PF's CPF; may own several Unidades. */
export const autonomo = pgTable(
  'sac_autonomo',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    pessoaFisicaId: uuid('pessoa_fisica_id')
      .notNull()
      .references(() => pessoaFisica.id, { onDelete: 'restrict' }),
    nomeFantasia: text('nome_fantasia'),
    ...createTimestamps(),
  },
  (table) => [uniqueIndex('sac_autonomo_pf_idx').on(table.pessoaFisicaId)],
)

/** Despachante registry. One despachante per Empresa is enforced at the vínculo level. */
export const despachante = pgTable(
  'sac_despachante',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    pessoaFisicaId: uuid('pessoa_fisica_id')
      .notNull()
      .references(() => pessoaFisica.id, { onDelete: 'restrict' }),
    dadosValidados: boolean('dados_validados').default(false).notNull(),
    ...createTimestamps(),
  },
  (table) => [uniqueIndex('sac_despachante_pf_idx').on(table.pessoaFisicaId)],
)

export const responsavelTecnico = pgTable(
  'sac_responsavel_tecnico',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    pessoaFisicaId: uuid('pessoa_fisica_id')
      .notNull()
      .references(() => pessoaFisica.id, { onDelete: 'restrict' }),
    conselho: text('conselho').$type<ConselhoProfissional>().notNull(),
    registroNumero: text('registro_numero').notNull(),
    ...createTimestamps(),
  },
  (table) => [
    index('sac_rt_pf_id_idx').on(table.pessoaFisicaId),
    uniqueIndex('sac_rt_conselho_registro_idx').on(table.conselho, table.registroNumero),
  ],
)

export const procuracao = pgTable(
  'sac_procuracao',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    outorganteId: uuid('outorgante_id')
      .notNull()
      .references(() => pessoaFisica.id, { onDelete: 'restrict' }),
    outorgadoId: uuid('outorgado_id')
      .notNull()
      .references(() => pessoaFisica.id, { onDelete: 'restrict' }),
    pessoaJuridicaId: uuid('pessoa_juridica_id').references(() => pessoaJuridica.id, {
      onDelete: 'set null',
    }),
    documentoRef: text('documento_ref'),
    /** Assinatura digital gov.br (accepted signature path; replaces SEI). */
    assinaturaGovbr: boolean('assinatura_govbr').default(false).notNull(),
    validade: timestamp('validade', { withTimezone: true }),
    status: text('status').$type<VinculoStatus>().default(vinculoStatuses.pending).notNull(),
    ...createTimestamps(),
  },
  (table) => [index('sac_procuracao_org_id_idx').on(table.organizationId)],
)

export const vinculoPfPj = pgTable(
  'sac_vinculo_pf_pj',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    pessoaFisicaId: uuid('pessoa_fisica_id')
      .notNull()
      .references(() => pessoaFisica.id, { onDelete: 'cascade' }),
    pessoaJuridicaId: uuid('pessoa_juridica_id')
      .notNull()
      .references(() => pessoaJuridica.id, { onDelete: 'cascade' }),
    papel: text('papel').$type<VinculoPapel>().notNull(),
    origem: text('origem').$type<VinculoOrigem>().notNull(),
    status: text('status').$type<VinculoStatus>().default(vinculoStatuses.pending).notNull(),
    /** Required for a manual despachante link (procuração + human review). */
    procuracaoId: uuid('procuracao_id').references(() => procuracao.id, { onDelete: 'set null' }),
    ...createTimestamps(),
  },
  (table) => [
    index('sac_vinculo_pj_id_idx').on(table.pessoaJuridicaId),
    index('sac_vinculo_pf_id_idx').on(table.pessoaFisicaId),
    // One active despachante per empresa — partial uniqueness is enforced at the use-case level;
    // this index supports the check.
    index('sac_vinculo_pj_papel_status_idx').on(table.pessoaJuridicaId, table.papel, table.status),
  ],
)

// ---------------------------------------------------------------------------
// Unidade — the central entity (owned by an Empresa OR an Autônomo)
// ---------------------------------------------------------------------------

export const unidade = pgTable(
  'sac_unidade',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    // Exactly one owner (empresa xor autônomo) — enforced at the use-case level.
    pessoaJuridicaId: uuid('pessoa_juridica_id').references(() => pessoaJuridica.id, {
      onDelete: 'restrict',
    }),
    autonomoId: uuid('autonomo_id').references(() => autonomo.id, { onDelete: 'restrict' }),
    nome: text('nome'),
    /** The head office, created automatically with the empresa (born incomplete). */
    isMatriz: boolean('is_matriz').notNull().default(false),
    cep: text('cep'),
    logradouro: text('logradouro'),
    numero: text('numero'),
    complemento: text('complemento'),
    bairro: text('bairro'),
    municipio: text('municipio'),
    uf: text('uf'),
    /** Área construída (chão trabalhado + teto/alvenaria), m². */
    areaConstruida: numeric('area_construida', { precision: 12, scale: 2 }),
    /** Número de pavimentos (térreo = 1). */
    pavimentos: integer('pavimentos'),
    /** Lotação/ocupação de pessoas no pico. */
    ocupacao: integer('ocupacao'),
    /** Tipo de exploração do local (ex.: comércio, serviço, indústria). */
    tipoExploracao: text('tipo_exploracao'),
    caracteristicas: jsonb('caracteristicas'),
    ...createTimestamps(),
  },
  (table) => [
    index('sac_unidade_pj_id_idx').on(table.pessoaJuridicaId),
    index('sac_unidade_autonomo_id_idx').on(table.autonomoId),
    index('sac_unidade_org_id_idx').on(table.organizationId),
  ],
)

/** Confirmed subset of the owner's CNAEs that are actually exercised at this unit. */
export const unidadeCnae = pgTable(
  'sac_unidade_cnae',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    unidadeId: uuid('unidade_id')
      .notNull()
      .references(() => unidade.id, { onDelete: 'cascade' }),
    cnaeId: uuid('cnae_id')
      .notNull()
      .references(() => cnae.id, { onDelete: 'restrict' }),
  },
  (table) => [
    uniqueIndex('sac_unidade_cnae_idx').on(table.unidadeId, table.cnaeId),
    index('sac_unidade_cnae_unidade_id_idx').on(table.unidadeId),
  ],
)

// ---------------------------------------------------------------------------
// Classificação — progressive, contextual, AI-assisted
// ---------------------------------------------------------------------------

export const eventoTemporario = pgTable(
  'sac_evento_temporario',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    // Optional link to a cadastered PF; the demo captures the requester as text.
    solicitanteId: uuid('solicitante_id').references(() => pessoaFisica.id, {
      onDelete: 'set null',
    }),
    solicitanteNome: text('solicitante_nome'),
    solicitanteCpf: text('solicitante_cpf'),
    nome: text('nome'),
    /** Temporary events are always Risco II or III (never dispensa). */
    risco: text('risco').$type<RiscoBand>(),
    // Address only — no Unidade.
    cep: text('cep'),
    logradouro: text('logradouro'),
    numero: text('numero'),
    complemento: text('complemento'),
    bairro: text('bairro'),
    municipio: text('municipio'),
    uf: text('uf'),
    inicioEm: timestamp('inicio_em', { withTimezone: true }).notNull(),
    // Duration ≤ 6 months — enforced at the use-case level.
    terminoEm: timestamp('termino_em', { withTimezone: true }).notNull(),
    ...createTimestamps(),
  },
  (table) => [index('sac_evento_org_id_idx').on(table.organizationId)],
)

export const classificacao = pgTable(
  'sac_classificacao',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    // Attached to a Unidade (regular) OR an Evento Temporário.
    unidadeId: uuid('unidade_id').references(() => unidade.id, { onDelete: 'cascade' }),
    eventoTemporarioId: uuid('evento_temporario_id').references(() => eventoTemporario.id, {
      onDelete: 'cascade',
    }),
    risco: text('risco').$type<RiscoBand>().notNull(),
    /** How the band was reached: cnae-shortcut | questionario | manual. */
    origem: text('origem').notNull(),
    concluidaEm: timestamp('concluida_em', { withTimezone: true }),
    ...createTimestamps(),
  },
  (table) => [
    index('sac_classificacao_unidade_id_idx').on(table.unidadeId),
    index('sac_classificacao_evento_id_idx').on(table.eventoTemporarioId),
  ],
)

export const resposta = pgTable(
  'sac_resposta',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classificacaoId: uuid('classificacao_id')
      .notNull()
      .references(() => classificacao.id, { onDelete: 'cascade' }),
    perguntaId: text('pergunta_id').notNull(),
    grupo: text('grupo').$type<RespostaGrupo>(),
    valor: jsonb('valor'),
    ...createTimestamps(),
  },
  (table) => [
    uniqueIndex('sac_resposta_classificacao_pergunta_idx').on(
      table.classificacaoId,
      table.perguntaId,
    ),
  ],
)

/** Traceable context used to classify — factors, source, confidence (AI is assistive only). */
export const contextoClassificacao = pgTable(
  'sac_contexto_classificacao',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classificacaoId: uuid('classificacao_id')
      .notNull()
      .references(() => classificacao.id, { onDelete: 'cascade' }),
    fatores: jsonb('fatores'),
    fonte: text('fonte'),
    confianca: numeric('confianca', { precision: 5, scale: 4 }),
    ...createTimestamps(),
  },
  (table) => [index('sac_contexto_classificacao_id_idx').on(table.classificacaoId)],
)

export const iaConversa = pgTable(
  'sac_ia_conversa',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classificacaoId: uuid('classificacao_id')
      .notNull()
      .references(() => classificacao.id, { onDelete: 'cascade' }),
    mensagens: jsonb('mensagens'),
    ...createTimestamps(),
  },
  (table) => [index('sac_ia_conversa_classificacao_id_idx').on(table.classificacaoId)],
)

// ---------------------------------------------------------------------------
// Processo — issuance, documents, payment
// ---------------------------------------------------------------------------

export const processo = pgTable(
  'sac_processo',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    unidadeId: uuid('unidade_id').references(() => unidade.id, { onDelete: 'set null' }),
    eventoTemporarioId: uuid('evento_temporario_id').references(() => eventoTemporario.id, {
      onDelete: 'set null',
    }),
    classificacaoId: uuid('classificacao_id').references(() => classificacao.id, {
      onDelete: 'set null',
    }),
    tipoSolicitacao: text('tipo_solicitacao').$type<TipoSolicitacao>().notNull(),
    modalidade: text('modalidade')
      .$type<ModalidadeProcesso>()
      .default(modalidadeProcesso.regular)
      .notNull(),
    risco: text('risco').$type<RiscoBand>().notNull(),
    fase: text('fase').notNull(),
    /** Triager who took the process ("assumir atividade"). */
    triadorResponsavel: text('triador_responsavel'),
    /** Review lifecycle: null/`rascunho` (only the triager sees) | `enviada` (contribuinte sees). */
    analiseStatus: text('analise_status'),
    /** N1-01 complementary info (TPEI, ponto de referência, horário do vistoriador, memorial, veracidade). */
    dadosComplementares: jsonb('dados_complementares'),
    /** Protocol exists only after confirmed payment for Risco II/III. */
    protocoloNumero: text('protocolo_numero'),
    protocoladoEm: timestamp('protocolado_em', { withTimezone: true }),
    ...createTimestamps(),
  },
  (table) => [
    index('sac_processo_unidade_id_idx').on(table.unidadeId),
    index('sac_processo_org_id_idx').on(table.organizationId),
    uniqueIndex('sac_processo_protocolo_idx').on(table.protocoloNumero),
  ],
)

export const documento = pgTable(
  'sac_documento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => processo.id, { onDelete: 'cascade' }),
    tipo: text('tipo').notNull(),
    arquivoRef: text('arquivo_ref'),
    /** PDF ≤ 5 MB — enforced at the use-case level (per N1-01). */
    assinaturaGovbr: boolean('assinatura_govbr').default(false).notNull(),
    ...createTimestamps(),
  },
  (table) => [index('sac_documento_processo_id_idx').on(table.processoId)],
)

export const pagamento = pgTable(
  'sac_pagamento',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => processo.id, { onDelete: 'cascade' }),
    valor: numeric('valor', { precision: 12, scale: 2 }),
    metodo: text('metodo'),
    status: text('status').$type<PagamentoStatus>().default(pagamentoStatuses.pending).notNull(),
    /** Confirmation source; defaults to `simulado` while payment is simulated. */
    fonteConfirmacao: text('fonte_confirmacao')
      .$type<PagamentoFonte>()
      .default(pagamentoFontes.simulado)
      .notNull(),
    confirmadoEm: timestamp('confirmado_em', { withTimezone: true }),
    ...createTimestamps(),
  },
  (table) => [index('sac_pagamento_processo_id_idx').on(table.processoId)],
)

// ---------------------------------------------------------------------------
// Histórico — cross-cutting audit trail
// ---------------------------------------------------------------------------

export const historico = pgTable(
  'sac_historico',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    entidade: text('entidade').notNull(),
    entidadeId: uuid('entidade_id').notNull(),
    acao: text('acao').notNull(),
    responsavelUserId: uuid('responsavel_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    antes: jsonb('antes'),
    depois: jsonb('depois'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sac_historico_entidade_idx').on(table.entidade, table.entidadeId),
    index('sac_historico_org_id_idx').on(table.organizationId),
  ],
)

/**
 * Triagem item review — append-only. Each triager decision on one information
 * field or one document is a NEW row (nothing is overwritten/deleted). The
 * current state of an item is its most recent row.
 */
export const triagemItem = pgTable(
  'sac_triagem_item',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => processo.id, { onDelete: 'cascade' }),
    /** `informacao` (a classifier/N1-01 field) or `documento`. */
    itemTipo: text('item_tipo').notNull(),
    /** Field key (e.g. `area`, `tpei`) or document `tipo` (e.g. `contrato_social`). */
    itemChave: text('item_chave').notNull(),
    /** `aprovado` | `reprovado` | `em_exigencia`. */
    estado: text('estado').notNull(),
    /** Justificativa (reprovado) or pendência (em exigência). */
    observacao: text('observacao'),
    autor: text('autor'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sac_triagem_item_processo_idx').on(table.processoId),
    index('sac_triagem_item_lookup_idx').on(table.processoId, table.itemTipo, table.itemChave),
  ],
)

/** Grouping of all domain tables (mirrors `authSchema` in the identity schema). */
export const domainSchema = {
  cnae,
  pessoaFisica,
  pessoaJuridica,
  pessoaJuridicaCnae,
  pessoaJuridicaSocio,
  autonomo,
  despachante,
  responsavelTecnico,
  procuracao,
  vinculoPfPj,
  unidade,
  unidadeCnae,
  eventoTemporario,
  classificacao,
  resposta,
  contextoClassificacao,
  iaConversa,
  processo,
  documento,
  pagamento,
  historico,
  triagemItem,
}
