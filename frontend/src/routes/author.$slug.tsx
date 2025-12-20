import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthorBySlug } from "@/lib/graphql/queries";
import { BackToSearch } from "@/components/BackToSearch";
import { Card } from "@/components/ui/card";
import {
  IconUser,
  IconBook,
  IconStack2,
} from "@tabler/icons-react";

export const Route = createFileRoute("/author/$slug")({
  component: AuthorPage,
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const { data: author, isLoading, error } = useAuthorBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <BackToSearch />
          <Card className="p-16 text-center">
            <IconUser className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">Author not found</h3>
            <p className="text-muted-foreground text-lg">
              {error ? (error as Error).message : "The requested author could not be found."}
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
      <div className="container mx-auto px-4 py-10">
        <BackToSearch />

        {/* Author Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <IconUser className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{author.name}</h1>
              <p className="text-xl text-muted-foreground">
                {author.bookCount} {author.bookCount === 1 ? "book" : "books"}
              </p>
            </div>
          </div>
          {author.bio && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {author.bio}
            </p>
          )}
        </div>

        {/* Books */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Books</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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
