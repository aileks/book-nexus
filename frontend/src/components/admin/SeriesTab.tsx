import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { InlineError } from "@/components/ErrorDisplay";
import { Pagination } from "@/components/search/Pagination";
import { SearchBar } from "@/components/search/SearchBar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { getErrorMessage } from "@/lib/graphql/client";
import {
  useAdminSeries,
  useCreateSeries,
  useUpdateSeries,
  useDeleteSeries,
} from "@/lib/graphql/admin";
import type { Series, NewSeries } from "@/lib/graphql/types";
import { ITEMS_PER_PAGE } from "./constants";

export function SeriesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: seriesList,
    isLoading,
    error,
    refetch,
  } = useAdminSeries(searchQuery);
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();

  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<NewSeries>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((seriesList?.length || 0) / ITEMS_PER_PAGE);
  const paginatedSeries = seriesList?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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

  const handleDeleteClick = (series: Series) => {
    setSeriesToDelete(series);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!seriesToDelete) return;
    setMutationError(null);
    try {
      await deleteSeries.mutateAsync(seriesToDelete.id);
      setDeleteDialogOpen(false);
      setSeriesToDelete(null);
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
          message={
            getErrorMessage(error) ||
            "Error loading series. Check your admin password."
          }
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-base sm:text-lg font-semibold">
          Series ({seriesList?.length || 0})
        </h2>
        <Button onClick={startCreate} size="sm" className="w-full sm:w-auto">
          Add Series
        </Button>
      </div>

      <div className="w-full max-w-md">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search series by name..."
          debounceMs={300}
        />
      </div>

      {mutationError && (
        <InlineError
          message={mutationError}
          onRetry={() => setMutationError(null)}
        />
      )}

      {(isCreating || editingSeries) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">
            {isCreating ? "Create Series" : "Edit Series"}
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={createSeries.isPending || updateSeries.isPending}
                className="w-full sm:w-auto"
              >
                {createSeries.isPending || updateSeries.isPending
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
              {paginatedSeries?.map((series) => (
                <tr
                  key={series.id}
                  className="border-b last:border-b-0 hover:bg-muted/50"
                >
                  <td className="p-2 sm:p-3">
                    <div className="font-medium">{series.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground md:hidden mt-1">
                      {series.slug || "-"}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-muted-foreground hidden md:table-cell">
                    {series.slug || "-"}
                  </td>
                  <td className="p-2 sm:p-3">{series.bookCount}</td>
                  <td className="p-2 sm:p-3 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(series)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(series)}
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
                  <td
                    colSpan={4}
                    className="p-6 text-center text-muted-foreground"
                  >
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={seriesToDelete}
        itemType="Series"
        onConfirm={handleDeleteConfirm}
        isPending={deleteSeries.isPending}
      />
    </div>
  );
}
