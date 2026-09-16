import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface UploadedDocumento {
  key: string
  fileName: string
  size: number
  contentType: string
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

/** Uploads a single PDF (≤ 5 MB) and returns its storage key + metadata. */
export async function uploadDocumento(file: File): Promise<UploadedDocumento> {
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${apiBase()}/uploads`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? 'Não foi possível enviar o arquivo.')
  }
  return response.json() as Promise<UploadedDocumento>
}

/** Resolves a short-lived URL to view/download an uploaded document by its key. */
export async function getUploadSignedUrl(key: string): Promise<string> {
  const response = await fetch(`${apiBase()}/uploads/signed-url?key=${encodeURIComponent(key)}`, {
    credentials: 'include',
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? 'Não foi possível abrir o arquivo.')
  }
  const data = (await response.json()) as { url: string }
  return data.url
}
