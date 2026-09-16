import { type IssuedDocumentKind } from '@/modules/processes'

export interface IssuedDocumentListItem {
  id: string
  processId: string
  documentKind: IssuedDocumentKind
  documentNumber: string
  documentLabel: string
  companyName: string
  issuedAt: string
  validUntil: string
}
