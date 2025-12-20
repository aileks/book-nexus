import { createFileRoute, Link } from "@tanstack/react-router";
import { useBook } from "@/lib/graphql/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  IconBook,
  IconUser,
  IconBuilding,
  IconStack2,
  IconCalendar,
  IconLanguage,
  IconFileText,
  IconArrowLeft,
  IconExternalLink,
} from "@tabler/icons-react";

export const Route = createFileRoute("/book/$id")({
  component: BookDetailPage,
});

function BookDetailPage() {
  const { id } = Route.useParams();
  const { data: book, isLoading, error } = useBook(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <IconArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to search</span>
          </Link>
          <Card className="p-16 text-center">
            <IconBook className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">Book not found</h3>
            <p className="text-muted-foreground text-lg">
              {error ? (error as Error).message : "The requested book could not be found."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <IconArrowLeft className="w-5 h-5" />
          <span className="text-lg">Back to search</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full max-w-sm mx-auto aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                  <IconBook className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Author */}
            <div>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              {book.subtitle && (
                <p className="text-xl text-muted-foreground mb-4">{book.subtitle}</p>
              )}
              <Link
                to="/author/$slug"
                params={{ slug: book.author.slug || book.author.id }}
                className="inline-flex items-center gap-2 text-xl text-primary hover:underline"
              >
                <IconUser className="w-5 h-5" />
                {book.author.name}
              </Link>
              {book.author.bookCount > 1 && (
                <span className="text-muted-foreground ml-2">
                  ({book.author.bookCount} books)
                </span>
              )}
            </div>

            {/* Series Info */}
            {book.series && (
              <Card className="p-5">
                <Link
                  to="/series/$slug"
                  params={{ slug: book.series.slug || book.series.id }}
                  className="flex items-center gap-3 text-lg hover:text-primary"
                >
                  <IconStack2 className="w-6 h-6" />
                  <span>
                    <span className="font-semibold">{book.series.name}</span>
                    {book.seriesPosition && (
                      <span className="text-muted-foreground"> - Book {book.seriesPosition}</span>
                    )}
                  </span>
                  {book.series.bookCount > 1 && (
                    <Badge variant="secondary">{book.series.bookCount} books</Badge>
                  )}
                </Link>
              </Card>
            )}

            {/* Description */}
            {book.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      <h3 className="text-lg font-semibold mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.genres.split(",").map((genre) => (
                          <Badge key={genre} variant="default" className="text-base px-3 py-1">
                            {genre.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {book.tags && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.tags.split(",").map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-base px-3 py-1">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Recommendations */}
            {book.recommendations && book.recommendations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">You might also like</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {book.recommendations.map((rec) => (
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
                            className="w-full aspect-[2/3] object-cover rounded-lg shadow group-hover:shadow-lg transition-shadow"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                            <IconBook className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary">
                          {rec.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{rec.author.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
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
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-medium flex items-center gap-1">
          {value}
          {link && <IconExternalLink className="w-4 h-4" />}
        </p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
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
