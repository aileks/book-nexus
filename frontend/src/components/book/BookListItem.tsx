import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/graphql/types";
import { IconBook, IconUser, IconChevronRight } from "@tabler/icons-react";

type BookListItemProps = {
  book: Book;
  onClick?: () => void;
};

export function BookListItem({ book, onClick }: BookListItemProps) {
  const content = (
    <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors">
      {book.imageUrl ? (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded bg-muted flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-16 sm:w-16 sm:h-20 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <IconBook className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base sm:text-lg line-clamp-2 sm:line-clamp-1">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
            {book.subtitle}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground mt-1">
          <IconUser className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="line-clamp-1">{book.author.name}</span>
        </div>

        {(book.publisher || book.series) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
            {book.publisher && <span>{book.publisher.name}</span>}
            {book.series && (
              <SeriesBadge
                seriesName={book.series.name}
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
                  className="text-xs sm:text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                >
                  {tag.trim()}
                </span>
              ))}
          </div>
        )}
      </div>

      <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return (
    <Link to="/book/$id" params={{ id: book.id }} className="block">
      {content}
    </Link>
  );
}

type SeriesBadgeProps = {
  seriesName: string;
  position?: number | null;
};

function SeriesBadge({ seriesName, position }: SeriesBadgeProps) {
  return (
    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
      {position ? `${seriesName} #${position}` : seriesName}
    </span>
  );
}
