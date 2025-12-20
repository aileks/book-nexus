import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IconBook } from "@tabler/icons-react";
import { SearchBar } from "@/components/search";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const GENRES = [
  { label: "Fantasy", genre: "Fantasy" },
  { label: "Horror", genre: "Horror" },
  { label: "Mystery", genre: "Mystery" },
  { label: "Suspense", genre: "Suspense" },
  { label: "Thriller", genre: "Thriller" },
];

const EXAMPLE_SEARCHES = [
  { label: "Stephen King", query: "Stephen King" },
  { label: "Harry Potter", query: "Harry Potter" },
  { label: "Brandon Sanderson", query: "Brandon Sanderson" },
];

function HomePage() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate({
        to: "/search",
        search: { q: query.trim(), page: 1, genre: "", sort: "" },
      });
    }
  };

  const handleGenreClick = (genre: string) => {
    navigate({ to: "/search", search: { q: "", page: 1, genre, sort: "" } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <IconBook className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Book Nexus
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-10">
            Discover your next favorite book
          </p>

          <div className="mb-6 sm:mb-10">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Browse by Genre */}
          <div className="mb-8 space-y-3">
            <p className="text-sm text-muted-foreground">Browse by genre:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {GENRES.map((item) => (
                <button
                  key={item.genre}
                  onClick={() => handleGenreClick(item.genre)}
                  className="px-4 py-2 text-base rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Example searches */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Or try searching for:
            </p>
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
