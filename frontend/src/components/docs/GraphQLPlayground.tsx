import { useState } from "react";
import { graphqlClient } from "@/lib/graphql/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSend, IconCode, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { parse, print } from "graphql";

const DEFAULT_QUERY = `query SearchBooks {
  searchBooks(input: { query: "horror", limit: 5 }) {
    total
    books {
      id
      title
      author {
        name
      }
    }
  }
}`;

export function GraphQLPlayground() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [variables, setVariables] = useState("{}");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    setError(null);
    setResponse(null);
    setIsLoading(true);

    try {
      // Parse variables JSON
      let parsedVariables: Record<string, unknown> = {};
      if (variables.trim()) {
        try {
          parsedVariables = JSON.parse(variables);
        } catch (e) {
          setError(
            `Invalid JSON in variables: ${e instanceof Error ? e.message : "Unknown error"}`,
          );
          setIsLoading(false);
          return;
        }
      }

      // Execute query
      const result = await graphqlClient.request(query, parsedVariables);
      setResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery(DEFAULT_QUERY);
    setVariables("{}");
    setResponse(null);
    setError(null);
  };

  const formatQuery = () => {
    try {
      // Parse and print the GraphQL query using graphql package
      // This will format it properly with correct indentation
      const document = parse(query);
      const formatted = print(document);
      setQuery(formatted);
    } catch (err) {
      // If GraphQL parsing fails, try to format as JSON (for variables)
      try {
        const parsed = JSON.parse(query);
        setQuery(JSON.stringify(parsed, null, 2));
      } catch {
        // Show error if both fail
        setError(
          `Formatting failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        // Clear error after a moment
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interactive Playground</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isLoading}
              >
                <IconRefresh className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                onClick={handleExecute}
                disabled={isLoading || !query.trim()}
                size="sm"
              >
                <IconSend className="w-4 h-4 mr-1" />
                {isLoading ? "Executing..." : "Execute Query"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left side: Query and Variables */}
        <Card>
          <CardHeader>
            <CardDescription className={cn("font-bold")}>
              Modify the query and variables, then click Execute to see the
              results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className=" font-medium text-lg">Query</label>
              <Button
                variant="outline"
                size="xs"
                onClick={formatQuery}
                disabled={!query.trim()}
                type="button"
              >
                <IconCode className="w-3 h-3 mr-1" />
                Format
              </Button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-64 font-mono  p-3 rounded-md border text-sm border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your GraphQL query here..."
            />
            <label className=" font-medium mb-2 block text-lg">
              Variables (JSON)
            </label>
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full h-32 font-mono  p-3 rounded-md text-sm border border-input bg-background  focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder='{"input": {"query": "horror", "limit": 5}}'
            />
          </CardContent>
        </Card>

        {/* Right side: Response/Error */}
        <Card>
          <CardHeader>
            <CardTitle className={error ? "text-destructive" : ""}>
              {error ? "Error" : "Response"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {response || error ? (
              <pre className="w-full h-[calc(64*0.25rem+32*0.25rem+4rem)] text-sm p-4 rounded-md bg-muted  font-mono overflow-auto">
                {error || response}
              </pre>
            ) : (
              <div className="h-[calc(64*0.25rem+32*0.25rem+4rem)] flex items-center justify-center text-muted-foreground text-sm">
                <p>Execute a query to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
