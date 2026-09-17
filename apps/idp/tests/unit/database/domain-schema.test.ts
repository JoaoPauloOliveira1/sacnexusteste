import { getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import {
  autonomo,
  classificacao,
  cnae,
  despachante,
  domainSchema,
  eventoTemporario,
  pagamento,
  pessoaFisica,
  pessoaJuridica,
  processo,
  processoMensagem,
  riscoBands,
  unidade,
  unidadeCnae,
  vinculoPfPj,
} from '@/database/schema.js'

describe('SAC domain schema', () => {
  it('uses sac-prefixed table names', () => {
    expect(getTableName(cnae)).toBe('sac_cnae')
    expect(getTableName(pessoaFisica)).toBe('sac_pessoa_fisica')
    expect(getTableName(pessoaJuridica)).toBe('sac_pessoa_juridica')
    expect(getTableName(autonomo)).toBe('sac_autonomo')
    expect(getTableName(despachante)).toBe('sac_despachante')
    expect(getTableName(vinculoPfPj)).toBe('sac_vinculo_pf_pj')
    expect(getTableName(unidade)).toBe('sac_unidade')
    expect(getTableName(unidadeCnae)).toBe('sac_unidade_cnae')
    expect(getTableName(classificacao)).toBe('sac_classificacao')
    expect(getTableName(eventoTemporario)).toBe('sac_evento_temporario')
    expect(getTableName(processo)).toBe('sac_processo')
    expect(getTableName(pagamento)).toBe('sac_pagamento')
    expect(getTableName(processoMensagem)).toBe('sac_processo_mensagem')
  })

  it('defines the four risk bands, including the undetermined II/III bucket', () => {
    expect(riscoBands).toEqual({ i: 'I', ii: 'II', iii: 'III', undetermined: 'undetermined' })
  })

  it('groups every domain table in domainSchema and keeps them out of the identity prefix', () => {
    expect(Object.keys(domainSchema)).toHaveLength(23)
    for (const table of Object.values(domainSchema)) {
      expect(getTableName(table)).toMatch(/^sac_/)
    }
  })
})
