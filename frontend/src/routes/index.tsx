import { createFileRoute } from "@tanstack/react-router";
import { IconBook } from "@tabler/icons-react";
import { SearchBar } from "@/components/search";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBook className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Book Nexus</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold tracking-tight mb-12">
            Discover Your Next Book
          </h1>

          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>
      </main>
    </div>
  );
}
