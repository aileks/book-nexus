import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { InlineError } from "@/components/ErrorDisplay";
import { Pagination } from "@/components/search/Pagination";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { getErrorMessage } from "@/lib/graphql/client";
import {
  useAdminAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from "@/lib/graphql/admin";
import type { Author, NewAuthor } from "@/lib/graphql/types";
import { ITEMS_PER_PAGE } from "./constants";

export function AuthorsTab() {
  const { data: authors, isLoading, error, refetch } = useAdminAuthors();
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const deleteAuthor = useDeleteAuthor();

  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<NewAuthor>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);

  const totalPages = Math.ceil((authors?.length || 0) / ITEMS_PER_PAGE);
  const paginatedAuthors = authors?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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

  const handleDeleteClick = (author: Author) => {
    setAuthorToDelete(author);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!authorToDelete) return;
    setMutationError(null);
    try {
      await deleteAuthor.mutateAsync(authorToDelete.id);
      setDeleteDialogOpen(false);
      setAuthorToDelete(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold">
          Authors ({authors?.length || 0})
        </h2>
        <Button onClick={startCreate} size="sm" className="w-full sm:w-auto">
          Add Author
        </Button>
      </div>

      {mutationError && (
        <InlineError
          message={mutationError}
          onRetry={() => setMutationError(null)}
        />
      )}

      {(isCreating || editingAuthor) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isCreating ? "Create Author" : "Edit Author"}
          </h3>
          <form
            onSubmit={isCreating ? handleCreate : handleUpdate}
            className="grid gap-3 sm:gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={createAuthor.isPending || updateAuthor.isPending}
                className="w-full sm:w-auto"
              >
                {createAuthor.isPending || updateAuthor.isPending
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
                <th className="text-left p-2 sm:p-3 font-medium">Name</th>
                <th className="text-left p-2 sm:p-3 font-medium hidden md:table-cell">
                  Slug
                </th>
                <th className="text-left p-2 sm:p-3 font-medium">Books</th>
                <th className="text-right p-2 sm:p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAuthors?.map((author) => (
                <tr
                  key={author.id}
                  className="border-b last:border-b-0 hover:bg-muted/50"
                >
                  <td className="p-2 sm:p-3">
                    <div className="font-medium">{author.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground md:hidden mt-1">
                      {author.slug || "-"}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground hidden md:table-cell">
                    {author.slug || "-"}
                  </td>
                  <td className="p-2 sm:p-3">{author.bookCount}</td>
                  <td className="p-2 sm:p-3 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(author)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(author)}
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
                  <td
                    colSpan={4}
                    className="p-6 text-center text-muted-foreground"
                  >
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={authorToDelete}
        itemType="Author"
        onConfirm={handleDeleteConfirm}
        isPending={deleteAuthor.isPending}
      />
    </div>
  );
}
