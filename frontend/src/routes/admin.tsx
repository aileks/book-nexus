import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InlineError } from "@/components/ErrorDisplay";
import { Pagination } from "@/components/search/Pagination";
import { getErrorMessage } from "@/lib/graphql/client";
import { cn } from "@/lib/utils";
import {
  getAdminPassword,
  setAdminPassword,
  clearAdminPassword,
  useAdminBooks,
  useAdminAuthors,
  useAdminSeries,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
  useCreateSeries,
  useUpdateSeries,
  useDeleteSeries,
} from "@/lib/graphql/admin";
import type { Author, Series, Book, NewBook, NewAuthor, NewSeries } from "@/lib/graphql/types";

type Tab = "books" | "authors" | "series";

const ITEMS_PER_PAGE = 10;

export const Route = createFileRoute("/admin")({
  component: () => (
    <ErrorBoundary>
      <AdminPage />
    </ErrorBoundary>
  ),
});

function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("books");

  useEffect(() => {
    const stored = getAdminPassword();
    if (stored) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      setAdminPassword(password);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    clearAdminPassword();
    setIsAuthenticated(false);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6">
          <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Book Nexus Admin</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          {(["books", "authors", "series"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {activeTab === "books" && <BooksTab />}
        {activeTab === "authors" && <AuthorsTab />}
        {activeTab === "series" && <SeriesTab />}
      </div>
    </div>
  );
}

function BooksTab() {
  const { data: books, isLoading, error, refetch } = useAdminBooks();
  const { data: authors } = useAdminAuthors();
  const { data: seriesList } = useAdminSeries();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<NewBook>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((books?.length || 0) / ITEMS_PER_PAGE);
  const paginatedBooks = books?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.authorId) return;
    setMutationError(null);

    try {
      await createBook.mutateAsync(formData as NewBook);
      setIsCreating(false);
      setFormData({});
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !formData.title || !formData.authorId) return;
    setMutationError(null);

    try {
      await updateBook.mutateAsync({
        id: editingBook.id,
        input: formData as NewBook,
      });
      setEditingBook(null);
      setFormData({});
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    setMutationError(null);
    try {
      await deleteBook.mutateAsync(id);
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      subtitle: book.subtitle,
      authorId: book.author.id,
      seriesId: book.series?.id,
      seriesPosition: book.seriesPosition,
      publishedDate: book.publishedDate,
      imageUrl: book.imageUrl,
    });
    setIsCreating(false);
    setMutationError(null);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingBook(null);
    setFormData({});
    setMutationError(null);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingBook(null);
    setFormData({});
    setMutationError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <InlineError
          message="Error loading books. Check your admin password."
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Books ({books?.length || 0})</h2>
        <Button onClick={startCreate}>Add Book</Button>
      </div>

      {mutationError && (
        <InlineError message={mutationError} onRetry={() => setMutationError(null)} />
      )}

      {(isCreating || editingBook) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isCreating ? "Create Book" : "Edit Book"}
          </h3>
          <form
            onSubmit={isCreating ? handleCreate : handleUpdate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Author *</Label>
              <Select
                value={formData.authorId || ""}
                onValueChange={(value) => setFormData({ ...formData, authorId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {authors?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Series</Label>
              <Select
                value={formData.seriesId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, seriesId: value === "none" ? undefined : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No series</SelectItem>
                  {seriesList?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seriesPosition">Series Position</Label>
              <Input
                id="seriesPosition"
                type="number"
                value={formData.seriesPosition || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seriesPosition: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishedDate">Published Date</Label>
              <Input
                id="publishedDate"
                type="date"
                value={formData.publishedDate || ""}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={createBook.isPending || updateBook.isPending}>
                {createBook.isPending || updateBook.isPending ? "Saving..." : isCreating ? "Create" : "Update"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Author</th>
                <th className="text-left p-3 font-medium">Series</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks?.map((book) => (
                <tr key={book.id} className="border-b last:border-b-0 hover:bg-muted/50">
                  <td className="p-3">{book.title}</td>
                  <td className="p-3 text-muted-foreground">{book.author?.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {book.series ? `${book.series.name} #${book.seriesPosition}` : "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(book)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                        disabled={deleteBook.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!paginatedBooks || paginatedBooks.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

function AuthorsTab() {
  const { data: authors, isLoading, error, refetch } = useAdminAuthors();
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();

  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<NewAuthor>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((authors?.length || 0) / ITEMS_PER_PAGE);
  const paginatedAuthors = authors?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setMutationError(null);

    try {
      await createAuthor.mutateAsync(formData as NewAuthor);
      setIsCreating(false);
      setFormData({});
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor || !formData.name) return;
    setMutationError(null);

    try {
      await updateAuthor.mutateAsync({
        id: editingAuthor.id,
        input: formData as NewAuthor,
      });
      setEditingAuthor(null);
      setFormData({});
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;
    setMutationError(null);
    try {
      await deleteAuthor.mutateAsync(id);
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const startEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      slug: author.slug,
      bio: author.bio,
    });
    setIsCreating(false);
    setMutationError(null);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingAuthor(null);
    setFormData({});
    setMutationError(null);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingAuthor(null);
    setFormData({});
    setMutationError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <InlineError
          message="Error loading authors. Check your admin password."
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Authors ({authors?.length || 0})</h2>
        <Button onClick={startCreate}>Add Author</Button>
      </div>

      {mutationError && (
        <InlineError message={mutationError} onRetry={() => setMutationError(null)} />
      )}

      {(isCreating || editingAuthor) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isCreating ? "Create Author" : "Edit Author"}
          </h3>
          <form
            onSubmit={isCreating ? handleCreate : handleUpdate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={createAuthor.isPending || updateAuthor.isPending}>
                {createAuthor.isPending || updateAuthor.isPending ? "Saving..." : isCreating ? "Create" : "Update"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Books</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAuthors?.map((author) => (
                <tr key={author.id} className="border-b last:border-b-0 hover:bg-muted/50">
                  <td className="p-3">{author.name}</td>
                  <td className="p-3 text-muted-foreground">{author.slug || "-"}</td>
                  <td className="p-3">{author.bookCount}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(author)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(author.id)}
                        disabled={deleteAuthor.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!paginatedAuthors || paginatedAuthors.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No authors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

function SeriesTab() {
  const { data: seriesList, isLoading, error, refetch } = useAdminSeries();
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();

  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<NewSeries>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((seriesList?.length || 0) / ITEMS_PER_PAGE);
  const paginatedSeries = seriesList?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setMutationError(null);

    try {
      await createSeries.mutateAsync(formData as NewSeries);
      setIsCreating(false);
      setFormData({});
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries || !formData.name) return;
    setMutationError(null);

    try {
      await updateSeries.mutateAsync({
        id: editingSeries.id,
        input: formData as NewSeries,
      });
      setEditingSeries(null);
      setFormData({});
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series?")) return;
    setMutationError(null);
    try {
      await deleteSeries.mutateAsync(id);
    } catch (err) {
      setMutationError(getErrorMessage(err));
    }
  };

  const startEdit = (series: Series) => {
    setEditingSeries(series);
    setFormData({
      name: series.name,
      slug: series.slug,
      description: series.description,
    });
    setIsCreating(false);
    setMutationError(null);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingSeries(null);
    setFormData({});
    setMutationError(null);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingSeries(null);
    setFormData({});
    setMutationError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <InlineError
          message="Error loading series. Check your admin password."
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Series ({seriesList?.length || 0})</h2>
        <Button onClick={startCreate}>Add Series</Button>
      </div>

      {mutationError && (
        <InlineError message={mutationError} onRetry={() => setMutationError(null)} />
      )}

      {(isCreating || editingSeries) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isCreating ? "Create Series" : "Edit Series"}
          </h3>
          <form
            onSubmit={isCreating ? handleCreate : handleUpdate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={createSeries.isPending || updateSeries.isPending}>
                {createSeries.isPending || updateSeries.isPending ? "Saving..." : isCreating ? "Create" : "Update"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Books</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSeries?.map((series) => (
                <tr key={series.id} className="border-b last:border-b-0 hover:bg-muted/50">
                  <td className="p-3">{series.name}</td>
                  <td className="p-3 text-muted-foreground">{series.slug || "-"}</td>
                  <td className="p-3">{series.bookCount}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(series)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(series.id)}
                        disabled={deleteSeries.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!paginatedSeries || paginatedSeries.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    No series found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
