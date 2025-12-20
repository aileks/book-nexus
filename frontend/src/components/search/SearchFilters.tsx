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
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconFilter className="w-5 h-5" />
        <span className="text-base">Filters:</span>
      </div>

      {authorName && (
        <Badge variant="secondary" className="text-base px-3 py-1 gap-2">
          Author: {authorName}
          {onAuthorClear && (
            <button onClick={onAuthorClear} className="hover:text-destructive">
              <IconX className="w-4 h-4" />
            </button>
          )}
        </Badge>
      )}

      {seriesName && (
        <Badge variant="secondary" className="text-base px-3 py-1 gap-2">
          Series: {seriesName}
          {onSeriesClear && (
            <button onClick={onSeriesClear} className="hover:text-destructive">
              <IconX className="w-4 h-4" />
            </button>
          )}
        </Badge>
      )}

      <span className="text-muted-foreground ml-auto">
        {totalResults} {totalResults === 1 ? "result" : "results"}
      </span>
    </div>
  );
}
