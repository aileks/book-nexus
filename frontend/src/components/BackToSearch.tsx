import { Link } from "@tanstack/react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLastSearch } from "@/lib/useLastSearch";

type BackToSearchProps = {
  bookId?: string;
};

export function BackToSearch({ bookId }: BackToSearchProps) {
  // If bookId is provided, link back to that book
  if (bookId) {
    return (
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-3 -mt-3 mb-3">
        <Link
          to="/book/$id"
          params={{ id: bookId }}
          className={cn(buttonVariants({ variant: "link" }), "gap-2 px-0")}
        >
          <IconArrowLeft className="w-5 h-5" />
          <span>Back to book</span>
        </Link>
      </div>
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
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-3 -mt-3 mb-3">
      <Link
        to="/search"
        search={searchParams}
        className={cn(buttonVariants({ variant: "link" }), "gap-2 px-0")}
      >
        <IconArrowLeft className="w-5 h-5" />
        <span>{displayText}</span>
      </Link>
    </div>
  );
}
