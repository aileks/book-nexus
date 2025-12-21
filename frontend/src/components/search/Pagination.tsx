import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-10 flex-wrap">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 sm:h-9 sm:w-9"
      >
        <IconChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-1 sm:px-2 text-muted-foreground"
            >
              ...
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(page as number)}
            className="min-w-8 sm:min-w-10 h-8 sm:h-9"
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 sm:h-9 sm:w-9"
      >
        <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}
