export function upsertProjection<T extends { id: string }>(
  records: readonly T[],
  projection: T,
): T[] {
  return [projection, ...records.filter((record) => record.id !== projection.id)]
}
