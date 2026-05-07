/**
 * @typedef {{ quantity: string, unit: string, name: string }} RecipeIngredient
 */

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   tags: string[],
 *   servings: number,
 *   prepTimeMinutes: number|null,
 *   cookTimeMinutes: number|null,
 *   totalTimeMinutes: number|null,
 *   imageUrl: string|null,
 *   updatedAt: string,
 * }} RecipeSummary
 */

/**
 * @typedef {RecipeSummary & {
 *   description: string,
 *   ingredients: RecipeIngredient[],
 *   instructions: string[],
 *   ownerUserId?: string,
 *   createdAt: string,
 * }} Recipe
 */

/**
 * @typedef {{
 *   items: RecipeSummary[],
 *   totalCount: number,
 *   page: number,
 *   pageSize: number,
 * }} PagedRecipes
 */

/**
 * @typedef {{
 *   sourceUrl: string,
 *   title: string,
 *   description?: string,
 *   servings?: number,
 *   prepTimeMinutes?: number|null,
 *   cookTimeMinutes?: number|null,
 *   totalTimeMinutes?: number|null,
 *   ingredients?: RecipeIngredient[],
 *   instructions?: string[],
 *   tags?: string[],
 *   note?: string,
 * }} ImportPreview
 */

export {};
