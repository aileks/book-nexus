const LAST_SEARCH_KEY = "book-nexus-last-search";

export function saveLastSearch(query: string) {
  if (query.trim()) {
    sessionStorage.setItem(LAST_SEARCH_KEY, query);
  }
}

export function getLastSearch(): string {
  return sessionStorage.getItem(LAST_SEARCH_KEY) || "";
}
