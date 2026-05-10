import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import RecipeForm from "./recipe-form";
import RecipeDetail from "./recipe-detail";
import MyTextInput from "@/components/MyTextInput";
import {
  deleteRecipe,
  duplicateRecipe,
  fetchRecipeById,
  fetchRecipesPaged,
  importRecipePreview,
} from "@/api/recipes";

export function RecipeManagement() {
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const [formImportPreview, setFormImportPreview] = useState(null);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRecipesPaged({
        pageNumber: pageData.pageNumber,
        pageSize: pageData.pageSize,
        search,
        tag,
      });
      setPageData((prev) => ({
        ...data,
        pageNumber: data.pageNumber ?? data.page ?? prev.pageNumber,
        pageSize: data.pageSize ?? prev.pageSize,
      }));
    } catch (e) {
      console.error(e);
      setPageData((p) => ({ ...p, items: [], totalCount: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pageData.pageNumber, pageData.pageSize, search, tag]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openDetail = async (id) => {
    setView("detail");
    setDetailLoading(true);
    try {
      const r = await fetchRecipeById(id);
      setDetail(r);
    } catch (e) {
      console.error(e);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openNew = () => {
    setDetail(null);
    setFormImportPreview(null);
    setView("form");
  };

  const openEdit = () => {
    if (!detail) return;
    setFormImportPreview(null);
    setView("form");
  };

  const closeForm = () => {
    setFormImportPreview(null);
    setView("list");
    setDetail(null);
    loadList();
  };

  const afterSave = () => {
    setFormImportPreview(null);
    setView("list");
    setDetail(null);
    loadList();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) return;
    try {
      await deleteRecipe(id);
      if (view === "detail" && detail?.id === id) {
        setView("list");
        setDetail(null);
      }
      loadList();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Delete failed.");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateRecipe(id);
      await loadList();
      if (view === "detail" && detail?.id === id) {
        setView("list");
        setDetail(null);
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Duplicate failed.");
    }
  };

  const runImportPreview = async () => {
    const url = importUrl.trim();
    if (!url) return;
    try {
      setImportBusy(true);
      const preview = await importRecipePreview(url);
      setImportPreview(preview);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Import preview failed.");
    } finally {
      setImportBusy(false);
    }
  };

  const applyImportToForm = () => {
    if (!importPreview) return;
    setFormImportPreview(importPreview);
    setImportOpen(false);
    setImportUrl("");
    setImportPreview(null);
    setView("form");
  };

  if (view === "form") {
    return (
      <RecipeForm
        recipe={detail}
        importPreview={formImportPreview}
        onClose={closeForm}
        onSaved={afterSave}
      />
    );
  }

  if (view === "detail") {
    return (
      <RecipeDetail
        detail={detail}
        loading={detailLoading}
        onBack={() => {
          setView("list");
          setDetail(null);
        }}
        onDuplicate={handleDuplicate}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(pageData.totalCount / pageData.pageSize));

  return (
    <div className="mt-6 mb-8 flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography variant="h4" color="blue-gray">
          Recipes
        </Typography>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            className="flex items-center gap-2"
            onClick={() => setImportOpen((v) => !v)}
          >
            <LinkIcon className="h-5 w-5" />
            Import from URL
          </Button>
          <Button className="flex items-center gap-2 bg-secondary" onClick={openNew}>
            <PlusIcon className="h-5 w-5" />
            New recipe
          </Button>
        </div>
      </div>

      {importOpen ? (
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader variant="gradient" color="gray" className="p-6">
            <Typography variant="h6" color="white">
              Import preview (POST /recipes/import)
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Typography variant="small" color="blue-gray">
              Fetches a preview DTO without saving. The quality of imported fields depends on
              your backend extractor for the provided URL.
            </Typography>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <Typography variant="small" className="mb-1 font-medium text-blue-gray-600">
                  Recipe URL
                </Typography>
                <MyTextInput
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://example.com/recipes/jollof-rice"
                  size="lg"
                />
              </div>
              <Button color="gray" onClick={runImportPreview} disabled={importBusy}>
                {importBusy ? "Loading…" : "Preview"}
              </Button>
            </div>
            {importPreview ? (
              <div className="rounded-lg bg-blue-gray-50 p-4">
                <Typography variant="small" className="mb-1 font-bold text-blue-gray-500">
                  Preview
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  {importPreview.title}
                </Typography>
                {importPreview.note ? (
                  <Typography variant="small" className="mt-2 text-blue-gray-600">
                    {importPreview.note}
                  </Typography>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button color="gray" onClick={applyImportToForm}>
                    Start from this preview
                  </Button>
                  <Button variant="outlined" color="blue-gray" onClick={() => setImportPreview(null)}>
                    Clear preview
                  </Button>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader variant="gradient" className="p-6 bg-primary">
          <Typography variant="h6" color="white">
            Library
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-blue-gray-300" />
              <MyTextInput
                className="!pl-10"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPageData((p) => ({ ...p, pageNumber: 1 }));
                }}
                placeholder="Search title, tags, ingredients…"
                size="lg"
              />
            </div>
            <div className="w-full lg:w-56">
              <MyTextInput
                value={tag}
                onChange={(e) => {
                  setTag(e.target.value);
                  setPageData((p) => ({ ...p, pageNumber: 1 }));
                }}
                placeholder="Filter by tag (exact)"
                size="lg"
              />
            </div>
          </div>

          {loading ? (
            <Typography>Loading…</Typography>
          ) : pageData?.items?.length && pageData.items.length === 0 ? (
            <Typography color="blue-gray">
              No recipes yet. Add one manually or use import preview, then refine and save.
            </Typography>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-auto">
                <thead>
                  <tr>
                    {["Recipe", "Time", "Servings", "Tags", ""].map((h) => (
                      <th key={h} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {h}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData?.items && pageData.items.map((row, key) => {
                    const last = key === pageData.items.length - 1;
                    const cls = `py-3 px-4 ${last ? "" : "border-b border-blue-gray-50"}`;
                    const totalMins = row.totalMinutes;
                    const time = totalMins != null ? `${totalMins} min` : "—";
                    return (
                      <tr
                        key={row.id}
                        className="cursor-pointer hover:bg-blue-gray-50/80"
                        onClick={() => openDetail(row.id)}
                      >
                        <td className={cls}>
                          <div className="flex items-center gap-3">
                            {row.coverImageUrl ? (
                              <img
                                src={row.coverImageUrl}
                                alt=""
                                className="h-12 w-12 rounded-lg object-cover ring-1 ring-blue-gray-100"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-gray-100 text-xs text-blue-gray-400">
                                —
                              </div>
                            )}
                            <Typography className="font-semibold text-blue-gray-800">
                              {row.title}
                            </Typography>
                          </div>
                        </td>
                        <td className={cls}>
                          <Typography variant="small" color="blue-gray">
                            {time}
                          </Typography>
                        </td>
                        <td className={cls}>
                          <Typography variant="small" color="blue-gray">
                            {row.servings}
                          </Typography>
                        </td>
                        <td className={cls}>
                          <div className="flex flex-wrap gap-1">
                            {(row.tags || []).slice(0, 4).map((t) => (
                              <Chip
                                key={t}
                                value={t}
                                variant="outlined"
                                color="blue-gray"
                                className="py-0.5 px-2 text-[10px] font-medium"
                              />
                            ))}
                          </div>
                        </td>
                        <td className={cls}>
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <IconTextButton
                              title="Duplicate"
                              onClick={() => handleDuplicate(row.id)}
                            >
                              <DocumentDuplicateIcon className="h-5 w-5" />
                            </IconTextButton>
                            <IconTextButton
                              title="Delete"
                              onClick={() => handleDelete(row.id)}
                            >
                              <TrashIcon className="h-5 w-5 text-red-400" />
                            </IconTextButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pageData.totalCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-gray-50 pt-4">
              <Typography variant="small" color="blue-gray">
                Page {pageData.pageNumber} of {totalPages} · {pageData.totalCount} recipes
              </Typography>
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  disabled={pageData.pageNumber <= 1}
                  onClick={() =>
                    setPageData((p) => ({ ...p, pageNumber: Math.max(1, p.pageNumber - 1) }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  disabled={pageData.pageNumber >= totalPages}
                  onClick={() =>
                    setPageData((p) => ({
                      ...p,
                      pageNumber: Math.min(totalPages, p.pageNumber + 1),
                    }))
                  }
                >
                  Next
                </Button>
                <select
                  className="rounded-md border border-blue-gray-200 bg-white px-2 py-1 text-sm text-blue-gray-700"
                  value={pageData.pageSize}
                  onChange={(e) =>
                    setPageData((p) => ({
                      ...p,
                      pageSize: Number(e.target.value),
                      pageNumber: 1,
                    }))
                  }
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}

function IconTextButton({ children, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      className="rounded-md p-2 text-blue-gray-600 hover:bg-blue-gray-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default RecipeManagement;
