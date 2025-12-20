import { Link } from "@tanstack/react-router";
import { IconArrowLeft } from "@tabler/icons-react";
import { getLastSearch } from "@/lib/useLastSearch";

export function BackToSearch() {
  const lastSearch = getLastSearch();

  return (
    <Link
      to="/search"
      search={lastSearch ? { q: lastSearch, page: 1 } : undefined}
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
    >
      <IconArrowLeft className="w-5 h-5" />
      <span className="text-lg">
        {lastSearch ? `Back to "${lastSearch}"` : "Back to search"}
      </span>
    </Link>
  );
}
