import api from "@/api/axios";

function mapRecipeToApiPayload(recipe) {
  const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const stepsInput = Array.isArray(recipe.steps) ? recipe.steps : [];
  const steps = stepsInput.map((step, index) => ({
    sortOrder: index + 1,
    instruction: typeof step === "string" ? step : step?.instruction || "",
  }));

  return {
    title: recipe.title,
    description: recipe.description || "",
    sourceUrl: recipe.sourceUrl || null,
    prepMinutes: recipe.prepMinutes ?? null,
    cookMinutes: recipe.cookMinutes ?? null,
    totalMinutes: recipe.totalMinutes ?? null,
    servings: recipe.servings,
    ingredients: ingredients.map((ingredient, index) => ({
      sortOrder: index + 1,
      name: ingredient.name,
      quantity:
        ingredient.quantity === "" || ingredient.quantity == null
          ? null
          : Number(ingredient.quantity),
      unit: ingredient.unit || "",
      note: ingredient.note || "",
    })),
    steps,
    tags,
  };
}

/**
 * GET /recipes?page&pageSize&search&tag
 * @param {{ page?: number, pageSize?: number, search?: string, tag?: string }} params
 */
export async function fetchRecipesPaged(params) {
  const response = await api.get("/recipes", { params });
  const { data, headers } = response;

  // Backend returns a plain array and paging metadata in the Pagination header.
  if (Array.isArray(data)) {
    let page = Math.max(1, Number(params?.pageNumber) || 1);
    let pageSize = Math.max(1, Number(params?.pageSize) || 10);
    let totalCount = data.length;

    const paginationHeader = headers?.pagination || headers?.Pagination;
    if (paginationHeader) {
      try {
        const parsed =
          typeof paginationHeader === "string"
            ? JSON.parse(paginationHeader)
            : paginationHeader;
        page = Number(parsed.currentPage) || page;
        pageSize = Number(parsed.itemsPerPage) || pageSize;
        totalCount = Number(parsed.totalItems) || totalCount;
      } catch {
        // Fall back to defaults when header is malformed.
      }
    }

    // Filtering/paging are backend-driven. We only normalize response shape.
    return { items: data, totalCount, pageNumber: page, pageSize };
  }

  return data;
}

/** GET /recipes/{id} */
export async function fetchRecipeById(id) {
  const { data } = await api.get(`/recipes/${id}`);
  return data;
}

/** POST /recipes */
export async function createRecipe(body) {
  const { data } = await api.post("/recipes", mapRecipeToApiPayload(body));
  return data;
}

/** PUT /recipes/{id} */
export async function updateRecipe(id, body) {
  const { data } = await api.put(`/recipes/${id}`, mapRecipeToApiPayload(body));
  return data;
}

/** DELETE /recipes/{id} */
export async function deleteRecipe(id) {
  await api.delete(`/recipes/${id}`);
}

/** POST /recipes/{id}/duplicate */
export async function duplicateRecipe(id) {
  const { data } = await api.post(`/recipes/${id}/duplicate`);
  return data;
}

/** POST /recipes/import  Body: { url } → preview (no DB write) */
export async function importRecipePreview(url) {
  const { data } = await api.post("/recipes/import", { url });
  return data;
}
