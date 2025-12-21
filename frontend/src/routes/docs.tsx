import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IconBook, IconArrowLeft } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function DocsPage() {
  const getApiUrl = (): string => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return `${window.location.origin}/query`;
  };

  const apiUrl = getApiUrl();

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
              <IconBook className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">API Documentation</h1>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* API Overview */}
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                Book Nexus provides a GraphQL API for querying book data,
                authors, publishers, and series.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Endpoint</h3>
                <code className="block p-3 rounded-md bg-muted  font-mono">
                  {apiUrl}
                </code>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-muted-foreground">
                  The public API does not require authentication. All queries
                  documented here are publicly accessible. Mutations (create,
                  update, delete operations) require admin authentication and
                  are not documented here.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Request Format</h3>
                <p className="text-muted-foreground mb-2">
                  Send POST requests with JSON body containing{" "}
                  <code className="bg-muted px-1 rounded">query</code> and
                  optional{" "}
                  <code className="bg-muted px-1 rounded">variables</code>:
                </p>
                <pre className="p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                  {`{
  "query": "query { books(limit: 5) { id title } }",
  "variables": {}
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Available Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Available Queries</CardTitle>
              <CardDescription>
                All publicly available GraphQL queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Books Queries */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Books</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">books</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a paginated list of books.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>limit</code> (Int, optional): Maximum number
                            of books to return
                          </li>
                          <li>
                            <code>offset</code> (Int, optional): Number of books
                            to skip
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  books(limit: 10, offset: 0) {
    id
    title
    subtitle
    author {
      name
    }
    publishedDate
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">book</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single book by ID.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>id</code> (ID!, required): The book ID
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  book(id: "1") {
    id
    title
    subtitle
    description
    author {
      name
      bio
    }
    publisher {
      name
    }
    series {
      name
    }
    publishedDate
    isbn10
    isbn13
    pages
    genres
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">searchBooks</h4>
                    <p className=" text-muted-foreground mb-3">
                      Search books with filters and sorting options.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">
                          Parameters (SearchBooksInput):
                        </span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>query</code> (String, optional): Search term
                            for title, author, etc.
                          </li>
                          <li>
                            <code>authorId</code> (ID, optional): Filter by
                            author ID
                          </li>
                          <li>
                            <code>publisherId</code> (ID, optional): Filter by
                            publisher ID
                          </li>
                          <li>
                            <code>seriesId</code> (ID, optional): Filter by
                            series ID
                          </li>
                          <li>
                            <code>authorName</code> (String, optional): Filter
                            by author name
                          </li>
                          <li>
                            <code>genre</code> (String, optional): Filter by
                            genre
                          </li>
                          <li>
                            <code>sortBy</code> (String, optional): Sort option
                            (title_asc, title_desc, date_asc, date_desc, author)
                          </li>
                          <li>
                            <code>limit</code> (Int, default: 20): Maximum
                            number of results
                          </li>
                          <li>
                            <code>offset</code> (Int, default: 0): Number of
                            results to skip
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  searchBooks(input: {
    query: "fantasy"
    genre: "Fantasy"
    sortBy: "title_asc"
    limit: 20
    offset: 0
  }) {
    total
    books {
      id
      title
      author {
        name
      }
      publishedDate
      genres
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Authors Queries */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Authors</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">authors</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a paginated list of authors.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>search</code> (String, optional): Search term
                            for author name
                          </li>
                          <li>
                            <code>limit</code> (Int, optional): Maximum number
                            of authors to return
                          </li>
                          <li>
                            <code>offset</code> (Int, optional): Number of
                            authors to skip
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  authors(search: "Tolkien", limit: 10) {
    id
    name
    slug
    bookCount
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">author</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single author by ID.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>id</code> (ID!, required): The author ID
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  author(id: "1") {
    id
    name
    slug
    bio
    bookCount
    books {
      id
      title
      publishedDate
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">authorBySlug</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single author by slug.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>slug</code> (String!, required): The author
                            slug
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  authorBySlug(slug: "j-r-r-tolkien") {
    id
    name
    slug
    bio
    bookCount
    books {
      id
      title
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Publishers Queries */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Publishers</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">publishers</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a paginated list of publishers.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>search</code> (String, optional): Search term
                            for publisher name
                          </li>
                          <li>
                            <code>limit</code> (Int, optional): Maximum number
                            of publishers to return
                          </li>
                          <li>
                            <code>offset</code> (Int, optional): Number of
                            publishers to skip
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  publishers(search: "Harper", limit: 10) {
    id
    name
    slug
    bookCount
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">publisher</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single publisher by ID.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>id</code> (ID!, required): The publisher ID
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  publisher(id: "1") {
    id
    name
    slug
    website
    bookCount
    books {
      id
      title
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">publisherBySlug</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single publisher by slug.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>slug</code> (String!, required): The publisher
                            slug
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  publisherBySlug(slug: "harper-collins") {
    id
    name
    slug
    website
    bookCount
    books {
      id
      title
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Series Queries */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Series</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">seriesList</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a paginated list of series.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>search</code> (String, optional): Search term
                            for series name
                          </li>
                          <li>
                            <code>limit</code> (Int, optional): Maximum number
                            of series to return
                          </li>
                          <li>
                            <code>offset</code> (Int, optional): Number of
                            series to skip
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  seriesList(search: "Lord", limit: 10) {
    id
    name
    slug
    bookCount
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">series</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single series by ID.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>id</code> (ID!, required): The series ID
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  series(id: "1") {
    id
    name
    slug
    description
    bookCount
    books {
      id
      title
      seriesPosition
      author {
        name
      }
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">seriesBySlug</h4>
                    <p className=" text-muted-foreground mb-3">
                      Get a single series by slug.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className=" font-medium">Parameters:</span>
                        <ul className=" text-muted-foreground ml-4 list-disc">
                          <li>
                            <code>slug</code> (String!, required): The series
                            slug
                          </li>
                        </ul>
                      </div>
                      <div>
                        <span className=" font-medium">Example:</span>
                        <pre className="mt-2 p-3 rounded-md bg-muted  font-mono overflow-x-auto">
                          {`query {
  seriesBySlug(slug: "lord-of-the-rings") {
    id
    name
    slug
    description
    bookCount
    books {
      id
      title
      seriesPosition
      author {
        name
      }
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
