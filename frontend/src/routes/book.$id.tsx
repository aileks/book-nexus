import { createFileRoute, Link } from "@tanstack/react-router";
import { useBook } from "@/lib/graphql/queries";
import { BackToSearch } from "@/components/BackToSearch";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getErrorMessage, ApiError } from "@/lib/graphql/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  IconBook,
  IconUser,
  IconBuilding,
  IconStack2,
  IconCalendar,
  IconLanguage,
  IconFileText,
  IconExternalLink,
} from "@tabler/icons-react";

export const Route = createFileRoute("/book/$id")({
  component: () => (
    <ErrorBoundary>
      <BookDetailPage />
    </ErrorBoundary>
  ),
});

function BookDetailPage() {
  const { id } = Route.useParams();
  const { data: book, isLoading, error, refetch } = useBook(id);

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
            <IconBook className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              {isNotFound ? "Book not found" : "Error loading book"}
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

  if (!book) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <BackToSearch />
          <Card className="p-8 sm:p-16 text-center">
            <IconBook className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
              Book not found
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg">
              The requested book could not be found.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <BackToSearch />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 lg:top-8">
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full max-w-xs sm:max-w-sm mx-auto rounded-md shadow-lg"
                />
              ) : (
                <div className="w-full max-w-xs sm:max-w-sm mx-auto aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                  <IconBook className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Title and Author */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4 break-words">
                  {book.subtitle}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/author/$slug"
                  params={{ slug: book.author.slug || book.author.id }}
                  className="inline-flex items-center gap-2 text-lg sm:text-xl text-primary hover:underline"
                >
                  <IconUser className="w-4 h-4 sm:w-5 sm:h-5" />
                  {book.author.name}
                </Link>
                {book.author.bookCount > 1 && (
                  <span className="text-muted-foreground text-base sm:text-lg">
                    ({book.author.bookCount} books)
                  </span>
                )}
              </div>
            </div>

            {/* Series Info */}
            {book.series && (
              <Card className="p-4 sm:p-5">
                <Link
                  to="/series/$slug"
                  params={{ slug: book.series.slug || book.series.id }}
                  search={{ bookId: id }}
                  className="flex flex-wrap items-center gap-2 sm:gap-3 text-base sm:text-lg hover:text-primary"
                >
                  <IconStack2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="break-words">
                    <span className="font-semibold">{book.series.name}</span>
                    {book.seriesPosition && (
                      <span className="text-muted-foreground">
                        {" "}
                        - Book {book.seriesPosition}
                      </span>
                    )}
                  </span>
                  {book.series.bookCount > 1 && (
                    <Badge variant="secondary">
                      {book.series.bookCount} books
                    </Badge>
                  )}
                </Link>
              </Card>
            )}

            {/* Description */}
            {book.description && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                  Description
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                  {book.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {book.publisher && (
                <MetadataItem
                  icon={<IconBuilding className="w-5 h-5" />}
                  label="Publisher"
                  value={book.publisher.name}
                  link={book.publisher.website}
                />
              )}
              {book.publishedDate && (
                <MetadataItem
                  icon={<IconCalendar className="w-5 h-5" />}
                  label="Published"
                  value={formatDate(book.publishedDate)}
                />
              )}
              {book.pages && (
                <MetadataItem
                  icon={<IconFileText className="w-5 h-5" />}
                  label="Pages"
                  value={book.pages.toString()}
                />
              )}
              {book.language && (
                <MetadataItem
                  icon={<IconLanguage className="w-5 h-5" />}
                  label="Language"
                  value={book.language}
                />
              )}
              {book.isbn13 && (
                <MetadataItem
                  icon={<IconBook className="w-5 h-5" />}
                  label="ISBN-13"
                  value={book.isbn13}
                />
              )}
              {book.isbn10 && (
                <MetadataItem
                  icon={<IconBook className="w-5 h-5" />}
                  label="ISBN-10"
                  value={book.isbn10}
                />
              )}
            </div>

            {/* Genres and Tags */}
            {(book.genres || book.tags) && (
              <>
                <Separator />
                <div className="space-y-4">
                  {book.genres && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                        Genres
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {book.genres.split(",").map((genre) => (
                          <Link
                            key={genre}
                            to="/search"
                            search={{ genre: genre.trim(), q: "", page: 1 }}
                          >
                            <Badge
                              variant="default"
                              className="px-2 sm:px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {genre.trim()}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {book.tags && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {book.tags.split(",").map((tag) => (
                          <Link
                            key={tag}
                            to="/search"
                            search={{ q: tag.trim(), genre: "", page: 1 }}
                          >
                            <Badge
                              variant="secondary"
                              className="px-2 sm:px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              {tag.trim()}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Recommendations */}
            {(() => {
              // Filter out current book and deduplicate by ID
              const uniqueRecommendations = Array.from(
                new Map(
                  book.recommendations
                    .filter((rec) => rec.id !== book.id)
                    .map((rec) => [rec.id, rec]),
                ).values(),
              );

              return uniqueRecommendations.length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                      You might also like
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {uniqueRecommendations.map((rec) => (
                        <Link
                          key={rec.id}
                          to="/book/$id"
                          params={{ id: rec.id }}
                          className="group"
                        >
                          {rec.imageUrl ? (
                            <img
                              src={rec.imageUrl}
                              alt={rec.title}
                              className="w-full aspect-[2/3] object-cover rounded-md shadow group-hover:shadow-lg transition-shadow"
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] bg-muted rounded-md flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                              <IconBook className="w-10 h-10 text-muted-foreground" />
                            </div>
                          )}
                          <p className="mt-2 font-medium line-clamp-2 group-hover:text-primary">
                            {rec.title}
                          </p>
                          <p className="text-muted-foreground">
                            {rec.author.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

type MetadataItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string | null;
};

function MetadataItem({ icon, label, value, link }: MetadataItemProps) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="text-lg font-medium flex items-center gap-1">
          {value}
          {link && <IconExternalLink className="w-4 h-4" />}
        </p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary"
      >
        {content}
      </a>
    );
  }

  return content;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
