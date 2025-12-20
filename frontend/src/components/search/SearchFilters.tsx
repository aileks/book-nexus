import { Badge } from "@/components/ui/badge";
import { IconFilter, IconX } from "@tabler/icons-react";

type SearchFiltersProps = {
  authorName?: string;
  onAuthorClear?: () => void;
  seriesName?: string;
  onSeriesClear?: () => void;
  totalResults: number;
};

export function SearchFilters({
  authorName,
  onAuthorClear,
  seriesName,
  onSeriesClear,
  totalResults,
}: SearchFiltersProps) {
  const hasFilters = authorName || seriesName;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconFilter className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {authorName && (
          <Badge
            variant="secondary"
            className="text-sm sm:text-base px-2 sm:px-3 py-1 gap-1 sm:gap-2"
          >
            <span className="hidden sm:inline">Author: </span>
            <span>{authorName}</span>
            {onAuthorClear && (
              <button
                onClick={onAuthorClear}
                className="hover:text-destructive ml-1"
                aria-label="Clear author filter"
              >
                <IconX className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </Badge>
        )}

        {seriesName && (
          <Badge
            variant="secondary"
            className="text-sm sm:text-base px-2 sm:px-3 py-1 gap-1 sm:gap-2"
          >
            <span className="hidden sm:inline">Series: </span>
            <span>{seriesName}</span>
            {onSeriesClear && (
              <button
                onClick={onSeriesClear}
                className="hover:text-destructive ml-1"
                aria-label="Clear series filter"
              >
                <IconX className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </Badge>
        )}
      </div>

      <span className="text-sm sm:text-base text-muted-foreground sm:ml-auto">
        {totalResults} {totalResults === 1 ? "result" : "results"}
      </span>
    </div>
  );
}
