import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IconBook } from "@tabler/icons-react";
import { SearchBar } from "@/components/search";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const EXAMPLE_SEARCHES = [
  { label: "Fantasy", query: "fantasy" },
  { label: "Mystery", query: "mystery" },
  { label: "Science Fiction", query: "science fiction" },
  { label: "Romance", query: "romance" },
  { label: "Stephen King", query: "Stephen King" },
  { label: "Harry Potter", query: "Harry Potter" },
];

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate({ to: "/search", search: { q: query.trim(), page: 1 } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <IconBook className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">Book Nexus</h1>
          </div>

          <p className="text-xl text-muted-foreground mb-10">
            Discover your next favorite book
          </p>

          <div className="mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_SEARCHES.map((example) => (
                <button
                  key={example.query}
                  onClick={() => handleSearch(example.query)}
                  className="px-4 py-2 text-base rounded-full border border-border hover:bg-card hover:border-primary/50 transition-colors"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Search through thousands of books</p>
      </footer>
    </div>
  );
}
