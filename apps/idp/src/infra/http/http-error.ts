/** Minimal HTTP-aware domain error; routes map `statusCode` to the response. */
export class HttpError extends Error {
  readonly statusCode: number
  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}
