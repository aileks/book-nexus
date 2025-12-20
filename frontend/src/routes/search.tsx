import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ControlledSearchBar } from "@/components/search/SearchBar";
import { BookCard, BookListItem, ViewToggle, type ViewMode } from "@/components/book";
import { Pagination } from "@/components/search/Pagination";
import { useSearchBooks } from "@/lib/graphql/queries";
import { saveLastSearch } from "@/lib/useLastSearch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBook, IconSearch, IconX } from "@tabler/icons-react";
import type { Book, SortOption } from "@/lib/graphql/types";
import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 20;

const GENRES = [
  "Fantasy",
  "Horror",
  "Mystery",
  "Suspense",
  "Thriller",
];

const SORT_OPTIONS: { value: SortOption | ''; label: string }[] = [
  { value: '', label: 'Relevance' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'author', label: 'Author' },
];

export const Route = createFileRoute("/search")({
  component: SearchResultsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
      page: Number(search.page) || 1,
      genre: (search.genre as string) || "",
      sort: (search.sort as SortOption | '') || "",
    };
  },
});

function SearchResultsPage() {
  const { q, page, genre, sort } = Route.useSearch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [searchQuery, setSearchQuery] = useState(q);

  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Save the search query for "Back to search" links
  useEffect(() => {
    if (q) {
      saveLastSearch(q);
    }
  }, [q]);

  const { data, isLoading, error } = useSearchBooks({
    query: q || undefined,
    genre: genre || undefined,
    sortBy: sort || undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const books = data?.books || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate({ to: "/search", search: { q: query.trim(), page: 1, genre, sort } });
    } else {
      navigate({ to: "/" });
    }
  };

  const handlePageChange = (newPage: number) => {
    navigate({ to: "/search", search: { q, page: newPage, genre, sort } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenreChange = (newGenre: string) => {
    navigate({ to: "/search", search: { q, page: 1, genre: newGenre, sort } });
  };

  const handleSortChange = (newSort: SortOption | '') => {
    navigate({ to: "/search", search: { q, page: 1, genre, sort: newSort } });
  };

  const clearFilters = () => {
    navigate({ to: "/search", search: { q, page: 1, genre: "", sort: "" } });
  };

  const hasActiveFilters = genre || sort;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
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

      <main className="container mx-auto px-4 py-10">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Card className="p-8 text-center">
            <IconSearch className="w-14 h-14 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-semibold mb-2">Search Error</h3>
            <p className="text-muted-foreground text-lg">{(error as Error).message}</p>
          </Card>
        )}

        {books.length > 0 && (
          <section>
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {total} {total === 1 ? "book" : "books"} found
                    {q && ` for "${q}"`}
                    {genre && ` in ${genre}`}
                  </h3>
                  {totalPages > 1 && (
                    <p className="text-muted-foreground mt-1">
                      Page {page} of {totalPages}
                    </p>
                  )}
                </div>
              </div>

              {/* Filter and view controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Genre filter */}
                  <select
                    value={genre}
                    onChange={(e) => handleGenreChange(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Genres</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  {/* Sort filter */}
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value as SortOption | '')}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {/* Clear filters button */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-9 text-muted-foreground hover:text-foreground"
                    >
                      <IconX className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <ViewToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book: Book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="space-y-0">
                {books.map((book: Book) => (
                  <BookListItem key={book.id} book={book} />
                ))}
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </section>
        )}

        {!isLoading && !error && books.length === 0 && (q || genre) && (
          <Card className="p-16 text-center">
            <IconSearch className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">No books found</h3>
            <p className="text-muted-foreground text-lg">
              Try a different search term{genre && " or genre"}
            </p>
          </Card>
        )}

        {!q && !genre && (
          <Card className="p-16 text-center">
            <IconBook className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">Start Searching</h3>
            <p className="text-muted-foreground text-lg">
              Enter a search term above to discover books
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
