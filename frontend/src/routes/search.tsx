import { createFileRoute } from '@tanstack/react-router';
import { ControlledSearchBar } from "@/components/search/SearchBar";
import { BookCard, BookListItem, ViewToggle, type ViewMode } from "@/components/book";
import { useSearchBooks } from "@/lib/graphql/queries";
import { Card } from "@/components/ui/card";
import { IconBook, IconSearch } from "@tabler/icons-react";
import type { Book } from "@/lib/graphql/types";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  component: SearchResultsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
    };
  },
});

function SearchResultsPage() {
  const { q } = Route.useSearch();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [searchQuery, setSearchQuery] = useState(q);

  const { data, isLoading, error } = useSearchBooks({
    query: q || undefined,
    limit: 20,
  });

  const books = data?.books || [];
  const total = data?.total || 0;

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <ControlledSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Search books, authors, series..."
              autoFocus
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Card className="p-6 text-center">
            <IconSearch className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Search Error</h3>
            <p className="text-muted-foreground">{(error as Error).message}</p>
          </Card>
        )}

        {books.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">
                  {total} {total === 1 ? "book" : "books"} found
                  {q && ` for "${q}"`}
                </h3>
              </div>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book: Book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => console.log("Book clicked:", book.title)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-0">
                {books.map((book: Book) => (
                  <BookListItem
                    key={book.id}
                    book={book}
                    onClick={() => console.log("Book clicked:", book.title)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!isLoading && !error && books.length === 0 && q && (
          <Card className="p-12 text-center">
            <IconSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </Card>
        )}

        {!q && (
          <Card className="p-12 text-center">
            <IconBook className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
            <p className="text-muted-foreground">
              Enter a search term above to discover books
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
