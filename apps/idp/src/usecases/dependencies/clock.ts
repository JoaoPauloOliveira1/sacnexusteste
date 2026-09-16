export type Clock = () => Date

export const clock: Clock = () => new Date()
