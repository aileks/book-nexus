import { Link } from "@tanstack/react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { getLastSearch } from "@/lib/useLastSearch";

type BackToSearchProps = {
  bookId?: string;
};

export function BackToSearch({ bookId }: BackToSearchProps) {
  // If bookId is provided, link back to that book
  if (bookId) {
    return (
      <Link
        to="/book/$id"
        params={{ id: bookId }}
        className="inline-flex items-center gap-2 text-base hover:underline mb-4"
      >
        <IconArrowLeft className="w-5 h-5" />
        <span>Back to book</span>
      </Link>
    );
  }

  // Otherwise, link back to search
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
