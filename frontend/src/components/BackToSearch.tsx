import { Link } from "@tanstack/react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { getLastSearch } from "@/lib/useLastSearch";

export function BackToSearch() {
  const lastSearch = getLastSearch();

  const searchParams = lastSearch
    ? {
        q: lastSearch.q || "",
        page: lastSearch.page || 1,
        genre: lastSearch.genre || "",
        sort: lastSearch.sort || "",
      }
    : undefined;

  const displayText = lastSearch?.q
    ? `Back to "${lastSearch.q}"`
    : lastSearch?.genre
      ? `Back to ${lastSearch.genre}`
      : "Back to search";

  return (
    <Link
      to="/search"
      search={searchParams}
      className="inline-flex items-center gap-2 text-base hover:underline mb-4"
    >
      <IconArrowLeft className="w-5 h-5" />
      <span>{displayText}</span>
    </Link>
  );
}
