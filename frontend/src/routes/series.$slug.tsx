import { createFileRoute, Link } from "@tanstack/react-router";
import { useSeriesBySlug } from "@/lib/graphql/queries";
import { BackToSearch } from "@/components/BackToSearch";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getErrorMessage, ApiError } from "@/lib/graphql/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconStack2, IconBook, IconUser } from "@tabler/icons-react";

export const Route = createFileRoute("/series/$slug")({
  component: () => (
    <ErrorBoundary>
      <SeriesPage />
    </ErrorBoundary>
  ),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      bookId: (search.bookId as string) || undefined,
    };
  },
});

function SeriesPage() {
  const { slug } = Route.useParams();
  const { bookId } = Route.useSearch();
  const { data: series, isLoading, error, refetch } = useSeriesBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    const isNotFound = error instanceof ApiError && error.isNotFound;
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <BackToSearch bookId={bookId} />
          <Card className="p-8 sm:p-16 text-center">
            <IconStack2 className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              {isNotFound ? "Series not found" : "Error loading series"}
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 break-words">
              {getErrorMessage(error)}
            </p>
            {!isNotFound && (
              <Button onClick={() => refetch()}>Try Again</Button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <BackToSearch bookId={bookId} />
          <Card className="p-8 sm:p-16 text-center">
            <IconStack2 className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              Series not found
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg">
              The requested series could not be found.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Sort books by series position
  const sortedBooks = [...series.books].sort((a, b) => {
    return (a.seriesPosition || 0) - (b.seriesPosition || 0);
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <BackToSearch />

        {/* Series Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <IconStack2 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">
                {series.name}
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground">
                {series.bookCount} {series.bookCount === 1 ? "book" : "books"}{" "}
                in this series
              </p>
            </div>
          </div>
          {series.description && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl break-words">
              {series.description}
            </p>
          )}
        </div>

        {/* Books */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
            Books in Order
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {sortedBooks.map((book) => (
              <Link
                key={book.id}
                to="/book/$id"
                params={{ id: book.id }}
                className="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                {/* Position Badge */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    {book.seriesPosition || "?"}
                  </span>
                </div>

                {/* Cover */}
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-12 h-18 sm:w-16 sm:h-24 object-cover rounded shadow flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-18 sm:w-16 sm:h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <IconBook className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold group-hover:text-primary line-clamp-2 sm:line-clamp-1 break-words">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-1 break-words">
                      {book.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                    <IconUser className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{book.author.name}</span>
                  </div>
                  {book.publishedDate && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Published {new Date(book.publishedDate).getFullYear()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
