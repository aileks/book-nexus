import { createFileRoute, Link } from "@tanstack/react-router";
import { useSeriesBySlug } from "@/lib/graphql/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconStack2,
  IconBook,
  IconArrowLeft,
  IconUser,
} from "@tabler/icons-react";

export const Route = createFileRoute("/series/$slug")({
  component: SeriesPage,
});

function SeriesPage() {
  const { slug } = Route.useParams();
  const { data: series, isLoading, error } = useSeriesBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <IconArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to search</span>
          </Link>
          <Card className="p-16 text-center">
            <IconStack2 className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">Series not found</h3>
            <p className="text-muted-foreground text-lg">
              {error ? (error as Error).message : "The requested series could not be found."}
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <IconArrowLeft className="w-5 h-5" />
          <span className="text-lg">Back to search</span>
        </Link>

        {/* Series Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
              <IconStack2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{series.name}</h1>
              <p className="text-xl text-muted-foreground">
                {series.bookCount} {series.bookCount === 1 ? "book" : "books"} in this series
              </p>
            </div>
          </div>
          {series.description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {series.description}
            </p>
          )}
        </div>

        {/* Books */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Books in Order</h2>
          <div className="space-y-4">
            {sortedBooks.map((book) => (
              <Link
                key={book.id}
                to="/book/$id"
                params={{ id: book.id }}
                className="flex items-center gap-6 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                {/* Position Badge */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {book.seriesPosition || "?"}
                  </span>
                </div>

                {/* Cover */}
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded shadow flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <IconBook className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold group-hover:text-primary line-clamp-1">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-base text-muted-foreground line-clamp-1">
                      {book.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-base text-muted-foreground">
                    <IconUser className="w-4 h-4" />
                    <span>{book.author.name}</span>
                  </div>
                  {book.publishedDate && (
                    <p className="text-sm text-muted-foreground mt-1">
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
