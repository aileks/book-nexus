import { useState } from "react"
import { useQuery } from "urql"
import { SearchBar } from "@/components/search/SearchBar"
import { BookCard, BookListItem, ViewToggle, type ViewMode } from "@/components/book"
import { SEARCH_BOOKS } from "@/lib/graphql/queries"
import { Card } from "@/components/ui/card"
import { IconBook, IconSearch } from "@tabler/icons-react"
import type { SearchBooksInput, Book } from "@/lib/graphql/types"

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")

  const [result] = useQuery({
    query: SEARCH_BOOKS,
    variables: {
      input: {
        query: query || undefined,
        limit: 20,
      } as SearchBooksInput,
    },
    pause: !query, // Don't run query if query is empty
  })

  const { data, fetching, error } = result

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const books = data?.searchBooks.books || []
  const total = data?.searchBooks.total || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBook className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Book Nexus</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="text-center py-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Discover Your Next Book
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Search through our collection of books by title, author, series, or keywords
          </p>
          
          <div className="flex justify-center mb-6">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>

        {fetching && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <Card className="p-6 text-center">
            <IconSearch className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Search Error</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </Card>
        )}

        {books.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">
                  {total} {total === 1 ? 'book' : 'books'} found
                  {query && ` for "${query}"`}
                </h3>
              </div>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book: Book) => (
                  <BookCard key={book.id} book={book} onClick={() => console.log("Book clicked:", book.title)} />
                ))}
              </div>
            ) : (
              <div className="space-y-0">
                {books.map((book: Book) => (
                  <BookListItem key={book.id} book={book} onClick={() => console.log("Book clicked:", book.title)} />
                ))}
              </div>
            )}
          </section>
        )}

        {!fetching && !error && books.length === 0 && query && (
          <Card className="p-12 text-center">
            <IconSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </Card>
        )}

        {!query && !fetching && (
          <Card className="p-12 text-center">
            <IconBook className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
            <p className="text-muted-foreground">Enter a search term above to discover books</p>
          </Card>
        )}
      </main>
    </div>
  )
}