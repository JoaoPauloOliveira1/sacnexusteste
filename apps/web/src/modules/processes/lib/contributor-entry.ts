/**
 * Contributor process state is intentionally ephemeral. Authentication enters
 * the in-memory dashboard and a browser refresh resets the demonstration
 * instead of hydrating business data from browser storage.
 */
export function getContributorPresentationEntryRoute(): '/dashboard' {
  return '/dashboard'
}
