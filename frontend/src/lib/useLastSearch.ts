const LAST_SEARCH_KEY = "book-nexus-last-search";

export type LastSearchParams = {
  q?: string;
  page?: number;
  genre?: string;
  sort?: string;
};

export function saveLastSearch(params: LastSearchParams) {
  if (params.q?.trim() || params.genre) {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(params));
  }
}

export function getLastSearch(): LastSearchParams | null {
  const stored = sessionStorage.getItem(LAST_SEARCH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
