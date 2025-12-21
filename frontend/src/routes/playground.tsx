import { createFileRoute, Link } from "@tanstack/react-router";
import { GraphQLPlayground } from "@/components/docs/GraphQLPlayground";
import { IconCode, IconArrowLeft } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playground")({
  component: PlaygroundPage,
});

function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className={cn(buttonVariants({ variant: "link" }), "gap-2")}
            >
              <IconArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <IconCode className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">GraphQL Playground</h1>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <GraphQLPlayground />
      </main>
    </div>
  );
}
