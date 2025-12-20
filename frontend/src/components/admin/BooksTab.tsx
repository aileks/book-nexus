import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineError } from "@/components/ErrorDisplay";
import { Pagination } from "@/components/search/Pagination";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { getErrorMessage } from "@/lib/graphql/client";
import {
  useAdminBooks,
  useAdminAuthors,
  useAdminSeries,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from "@/lib/graphql/admin";
import type { Book, NewBook } from "@/lib/graphql/types";
import { ITEMS_PER_PAGE } from "./constants";

export function BooksTab() {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const totalPages = Math.ceil((books?.length || 0) / ITEMS_PER_PAGE);
  const paginatedBooks = books?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    setMutationError(null);
    try {
      await deleteBook.mutateAsync(bookToDelete.id);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
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
      seriesId: book.series?.id ?? undefined,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold">
          Books ({books?.length || 0})
        </h2>
        <Button onClick={startCreate} size="sm" className="w-full sm:w-auto">
          Add Book
        </Button>
      </div>

      {mutationError && (
        <InlineError
          message={mutationError}
          onRetry={() => setMutationError(null)}
        />
      )}

      {(isCreating || editingBook) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isCreating ? "Create Book" : "Edit Book"}
          </h3>
          <form
            onSubmit={isCreating ? handleCreate : handleUpdate}
            className="grid gap-3 sm:gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Author *</Label>
              <Select
                value={(formData.authorId ?? undefined) || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, authorId: value as string })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
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
                value={(formData.seriesId ?? undefined) || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    seriesId: value === "none" ? undefined : (value as string),
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
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
                    seriesPosition: e.target.value
                      ? Number(e.target.value)
                      : undefined,
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
                onChange={(e) =>
                  setFormData({ ...formData, publishedDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={createBook.isPending || updateBook.isPending}
                className="w-full sm:w-auto"
              >
                {createBook.isPending || updateBook.isPending
                  ? "Saving..."
                  : isCreating
                    ? "Create"
                    : "Update"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelForm}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-sm sm:text-base">
            <thead className="border-b">
              <tr>
                <th className="text-left p-2 sm:p-3 font-medium">Title</th>
                <th className="text-left p-2 sm:p-3 font-medium hidden sm:table-cell">
                  Author
                </th>
                <th className="text-left p-2 sm:p-3 font-medium hidden md:table-cell">
                  Series
                </th>
                <th className="text-right p-2 sm:p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks?.map((book) => (
                <tr
                  key={book.id}
                  className="border-b last:border-b-0 hover:bg-muted/50"
                >
                  <td className="p-2 sm:p-3">
                    <div className="font-medium">{book.title}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground sm:hidden mt-1">
                      {book.author?.name}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground hidden sm:table-cell">
                    {book.author?.name}
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground hidden md:table-cell">
                    {book.series
                      ? `${book.series.name} #${book.seriesPosition}`
                      : "-"}
                  </td>
                  <td className="p-2 sm:p-3 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(book)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(book)}
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
                  <td
                    colSpan={4}
                    className="p-6 text-center text-muted-foreground"
                  >
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={bookToDelete}
        itemType="Book"
        onConfirm={handleDeleteConfirm}
        isPending={deleteBook.isPending}
      />
    </div>
  );
}

