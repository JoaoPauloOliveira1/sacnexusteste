import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { type Env } from '@/config/env.js'

export type PutObjectInput = {
  key: string
  body: Buffer
  contentType: string
}

export interface ObjectStorage {
  /** Whether Tigris credentials + bucket are configured. Upload routes 503 if not. */
  isConfigured: () => boolean
  putObject: (input: PutObjectInput) => Promise<void>
  /** Short-lived presigned URL to view/download the object. */
  getSignedDownloadUrl: (key: string, expiresInSeconds?: number) => Promise<string>
  /** Reads the whole object into memory (for zipping a small set of documents). */
  getObjectBytes: (key: string) => Promise<Buffer>
}

/**
 * Tigris object storage (S3-compatible). Credentials are optional so the service
 * still boots without them; callers check {@link ObjectStorage.isConfigured}.
 */
export function createTigrisObjectStorage(config: Env): ObjectStorage {
  const bucket = config.TIGRIS_BUCKET
  const accessKeyId = config.TIGRIS_ACCESS_KEY_ID
  const secretAccessKey = config.TIGRIS_SECRET_ACCESS_KEY
  const configured = Boolean(bucket && accessKeyId && secretAccessKey)

  let client: S3Client | undefined
  function getClient(): { client: S3Client; bucket: string } {
    if (!configured || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error('Object storage (Tigris) is not configured.')
    }
    client ??= new S3Client({
      region: config.TIGRIS_REGION,
      endpoint: config.TIGRIS_ENDPOINT,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: false,
    })
    return { client, bucket }
  }

  return {
    isConfigured: () => configured,

    putObject: async ({ key, body, contentType }) => {
      const { client: s3, bucket: b } = getClient()
      await s3.send(
        new PutObjectCommand({ Bucket: b, Key: key, Body: body, ContentType: contentType }),
      )
    },

    getSignedDownloadUrl: async (key, expiresInSeconds = 300) => {
      const { client: s3, bucket: b } = getClient()
      return getSignedUrl(s3, new GetObjectCommand({ Bucket: b, Key: key }), {
        expiresIn: expiresInSeconds,
      })
    },

    getObjectBytes: async (key) => {
      const { client: s3, bucket: b } = getClient()
      const result = await s3.send(new GetObjectCommand({ Bucket: b, Key: key }))
      const bytes = await result.Body?.transformToByteArray()
      if (!bytes) throw new Error(`Empty object body for ${key}`)
      return Buffer.from(bytes)
    },
  }
}
