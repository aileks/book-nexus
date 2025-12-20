import type { Book } from "@/lib/graphql/types";
import { IconBook, IconUser, IconChevronRight } from "@tabler/icons-react";

interface BookListItemProps {
  book: Book;
  onClick?: () => void;
}

export function BookListItem({ book, onClick }: BookListItemProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {book.imageUrl ? (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-16 h-20 object-cover rounded bg-muted flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-20 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <IconBook className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base line-clamp-1">{book.title}</h3>
        {book.subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.subtitle}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <IconUser className="w-3 h-3" />
          <span className="line-clamp-1">{book.author.name}</span>
        </div>

        {(book.publisher || book.seriesName) && (
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {book.publisher && <span>{book.publisher}</span>}
            {book.seriesName && (
              <SeriesBadge
                seriesName={book.seriesName}
                position={book.seriesPosition}
              />
            )}
          </div>
        )}

        {book.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.tags
              .split(",")
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                >
                  {tag.trim()}
                </span>
              ))}
          </div>
        )}
      </div>

      <IconChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

interface SeriesBadgeProps {
  seriesName: string;
  position?: number | null;
}

function SeriesBadge({ seriesName, position }: SeriesBadgeProps) {
  return (
    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
      {position ? `${seriesName} #${position}` : seriesName}
    </span>
  );
}
