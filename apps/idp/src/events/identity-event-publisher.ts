import { type IdentityEvent } from '@/events/identity-event.js'

export type IdentityEventPublisher = {
  publish: (event: IdentityEvent) => Promise<void>
}

export const noopIdentityEventPublisher: IdentityEventPublisher = {
  async publish(_event) {
    // Future durable publishers must define explicit failure behavior before replacing no-op.
  },
}
