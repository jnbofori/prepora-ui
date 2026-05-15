/** Recipe-level macro fields accepted by POST/PUT /recipes */
export const RECIPE_NUTRITION_FIELDS = [
  "calories",
  "proteinGrams",
  "carbsGrams",
  "fatGrams",
  "caloriesPerServing",
  "proteinGramsPerServing",
  "carbsGramsPerServing",
  "fatGramsPerServing",
];

export const INGREDIENT_MACRO_FIELDS = [
  "calories",
  "proteinGrams",
  "carbsGrams",
  "fatGrams",
];

export function formatNutritionDisplay(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return n.toFixed(2);
}

/** True if the recipe object includes stored recipe-level macro totals. */
export function hasRecipeLevelNutrition(detail) {
  if (!detail || typeof detail !== "object") return false;
  return RECIPE_NUTRITION_FIELDS.some((key) => {
    const v = detail[key];
    return v != null && v !== "" && !Number.isNaN(Number(v));
  });
}

/** Pick defined numeric macros from a calculate row or a merged ingredient object. */
export function pickIngredientMacrosFromObject(obj) {
  if (!obj) return null;
  const macros = {};
  for (const k of INGREDIENT_MACRO_FIELDS) {
    const v = obj[k];
    if (v != null && !Number.isNaN(Number(v))) {
      macros[k] = Number(v);
    }
  }
  return Object.keys(macros).length > 0 ? macros : null;
}

/** One ingredient row from Formik values (fingerprint, save body, calculate request). */
export function normalizeIngredientFromForm(i) {
  const name = String(i?.name || "").trim();
  const noteTrim = String(i?.note ?? "").trim();
  const unitTrim = String(i?.unit ?? "").trim();
  return {
    name,
    quantity: i?.quantity === "" || i?.quantity == null ? null : Number(i.quantity),
    unit: unitTrim === "" ? null : unitTrim,
    note: noteTrim === "" ? null : noteTrim,
  };
}

export function canonicalIngredientsFingerprintFromForm(ingredients) {
  return JSON.stringify((ingredients || []).map(normalizeIngredientFromForm));
}

/** Body for POST /recipes/nutrition/calculate */
export function buildNutritionCalculateBody(values) {
  const servings = Number(values.servings);
  const rows = (values.ingredients || []).map(normalizeIngredientFromForm).filter((r) => r.name);
  return {
    servings: Number.isFinite(servings) && servings > 0 ? servings : 1,
    ingredients: rows.map((r, idx) => ({
      sortOrder: idx,
      name: r.name,
      quantity: r.quantity,
      unit: r.unit,
      note: r.note,
    })),
  };
}

function sortNutritionIngredientRows(rows) {
  return [...(rows || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Merge calculate response onto a draft save payload (mutates payload). */
export function applyNutritionToSavePayload(payload, nutritionResult) {
  for (const key of RECIPE_NUTRITION_FIELDS) {
    const v = nutritionResult[key];
    if (v != null && !Number.isNaN(Number(v))) {
      payload[key] = Number(v);
    }
  }

  const sorted = sortNutritionIngredientRows(nutritionResult.ingredients);
  payload.ingredients = payload.ingredients.map((ing, i) => {
    const match =
      sorted[i] ??
      sorted.find((r) => r.sortOrder === i) ??
      sorted.find((r) => r.sortOrder === i + 1);
    const macros = pickIngredientMacrosFromObject(match);
    return macros ? { ...ing, ...macros } : ing;
  });
}

export function pickRecipeNutritionFields(recipe) {
  const out = {};
  for (const key of RECIPE_NUTRITION_FIELDS) {
    const v = recipe[key];
    if (v != null && v !== "" && !Number.isNaN(Number(v))) {
      out[key] = Number(v);
    }
  }
  return out;
}

/** Map one ingredient (form or merged) to the API ingredient shape. */
export function mapIngredientToApiPayload(ingredient, index) {
  const unitRaw = ingredient.unit == null ? "" : String(ingredient.unit).trim();
  const noteRaw = ingredient.note == null ? "" : String(ingredient.note).trim();
  const base = {
    sortOrder: index + 1,
    name: String(ingredient.name ?? "").trim(),
    quantity:
      ingredient.quantity === "" || ingredient.quantity == null
        ? null
        : Number(ingredient.quantity),
    unit: unitRaw === "" ? null : unitRaw,
    note: noteRaw === "" ? null : noteRaw,
  };

  const macros = pickIngredientMacrosFromObject(ingredient);
  return macros ? { ...base, ...macros } : base;
}
