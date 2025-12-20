import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthorBySlug } from "@/lib/graphql/queries";
import { BackToSearch } from "@/components/BackToSearch";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getErrorMessage, ApiError } from "@/lib/graphql/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconUser, IconBook, IconStack2 } from "@tabler/icons-react";

export const Route = createFileRoute("/author/$slug")({
  component: () => (
    <ErrorBoundary>
      <AuthorPage />
    </ErrorBoundary>
  ),
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const { data: author, isLoading, error, refetch } = useAuthorBySlug(slug);

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
          <BackToSearch />
          <Card className="p-8 sm:p-16 text-center">
            <IconUser className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              {isNotFound ? "Author not found" : "Error loading author"}
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

  if (!author) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <BackToSearch />
          <Card className="p-8 sm:p-16 text-center">
            <IconUser className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              Author not found
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg">
              The requested author could not be found.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Sort books by series and position
  const sortedBooks = [...author.books].sort((a, b) => {
    if (a.series && b.series) {
      if (a.series.name !== b.series.name) {
        return a.series.name.localeCompare(b.series.name);
      }
      return (a.seriesPosition || 0) - (b.seriesPosition || 0);
    }
    if (a.series) return -1;
    if (b.series) return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <BackToSearch />

        {/* Author Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <IconUser className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words">
                {author.name}
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground">
                {author.bookCount} {author.bookCount === 1 ? "book" : "books"}
              </p>
            </div>
          </div>
          {author.bio && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl break-words">
              {author.bio}
            </p>
          )}
        </div>

        {/* Books */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Books</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {sortedBooks.map((book) => (
              <Link
                key={book.id}
                to="/book/$id"
                params={{ id: book.id }}
                className="group"
              >
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full aspect-[2/3] object-cover rounded-lg shadow group-hover:shadow-lg transition-shadow"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <IconBook className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="mt-3">
                  <p className="text-base font-medium line-clamp-2 group-hover:text-primary">
                    {book.title}
                  </p>
                  {book.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {book.subtitle}
                    </p>
                  )}
                  {book.series && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <IconStack2 className="w-4 h-4" />
                      <span>
                        {book.series.name}
                        {book.seriesPosition && ` #${book.seriesPosition}`}
                      </span>
                    </div>
                  )}
                  {book.publishedDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(book.publishedDate).getFullYear()}
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
