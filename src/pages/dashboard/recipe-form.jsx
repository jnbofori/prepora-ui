import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import MyTextInput from "@/components/MyTextInput";
import { createRecipe, updateRecipe } from "@/api/recipes";

const httpsUrlRegex = /^https:\/\/.+/i;

const ingredientSchema = Yup.object().shape({
  name: Yup.string().trim().max(500, "Max 500 characters").required("Required"),
  quantity: Yup.number()
    .transform((v, orig) => (orig === "" || orig == null ? null : v))
    .nullable()
    .min(0, "Must be 0 or greater"),
  unit: Yup.string().trim().max(100, "Max 100 characters"),
  note: Yup.string().trim().max(500, "Max 500 characters"),
});

const stepSchema = Yup.object().shape({
  instruction: Yup.string().trim().max(4000, "Max 4000 characters").required("Required"),
});

const validationSchema = Yup.object().shape({
  title: Yup.string().trim().max(500, "Max 500 characters").required("Required"),
  description: Yup.string().trim().max(8000, "Max 8000 characters"),
  sourceUrl: Yup.string()
    .trim()
    .nullable()
    .test("https-url", "Must be a valid absolute HTTPS URL", (value) => {
      if (!value) return true;
      return httpsUrlRegex.test(value);
    }),
  servings: Yup.number().moreThan(0, "Must be greater than 0").required("Required"),
  prepMinutes: Yup.number()
    .transform((v, orig) => (orig === "" || orig == null ? null : v))
    .nullable()
    .min(0, "Must be 0 or greater"),
  cookMinutes: Yup.number()
    .transform((v, orig) => (orig === "" || orig == null ? null : v))
    .nullable()
    .min(0, "Must be 0 or greater"),
  totalMinutes: Yup.number()
    .transform((v, orig) => (orig === "" || orig == null ? null : v))
    .nullable()
    .min(0, "Must be 0 or greater"),
  ingredients: Yup.array().of(ingredientSchema).min(1, "Add at least one ingredient"),
  steps: Yup.array().of(stepSchema).min(1, "Add at least one step"),
  tags: Yup.string().test("tag-length", "Each tag must be 100 chars or less", (value) => {
    if (!value) return true;
    return value
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean)
      .every((t) => t.length <= 100);
  }),
});

function buildInitialValues(recipe, importPreview) {
  if (recipe) {
    return {
      title: recipe.title || "",
      description: recipe.description || "",
      sourceUrl: recipe.sourceUrl || "",
      servings: recipe.servings ?? 4,
      prepMinutes: recipe.prepMinutes ?? "",
      cookMinutes: recipe.cookMinutes ?? "",
      totalMinutes: recipe.totalMinutes ?? "",
      ingredients:
        recipe.ingredients?.length > 0
          ? recipe.ingredients.map((i) => ({
              name: i.name ?? "",
              quantity: i.quantity ?? "",
              unit: i.unit ?? "",
              note: i.note ?? "",
            }))
          : [{ name: "", quantity: "", unit: "", note: "" }],
      steps:
        recipe.steps?.length > 0
          ? recipe.steps.map((s) => ({ instruction: s.instruction ?? "" }))
          : [{ instruction: "" }],
      tags: (recipe.tags || []).join(", "),
    };
  }

  if (importPreview) {
    return {
      title: importPreview.title || "",
      description: importPreview.description || "",
      sourceUrl: importPreview.sourceUrl || "",
      servings: importPreview.servings ?? 4,
      prepMinutes: importPreview.prepMinutes ?? "",
      cookMinutes: importPreview.cookMinutes ?? "",
      totalMinutes: importPreview.totalMinutes ?? "",
      ingredients:
        importPreview.ingredients?.length > 0
          ? importPreview.ingredients.map((i) => ({
              name: i.name ?? "",
              quantity: i.quantity ?? "",
              unit: i.unit ?? "",
              note: i.note ?? "",
            }))
          : [{ name: "", quantity: "", unit: "", note: "" }],
      steps:
        importPreview.steps?.length > 0
          ? importPreview.steps.map((s) => ({ instruction: s.instruction ?? "" }))
          : [{ instruction: "" }],
      tags: (importPreview.tags || []).join(", "),
    };
  }

  return {
    title: "",
    description: "",
    sourceUrl: "",
    servings: 4,
    prepMinutes: "",
    cookMinutes: "",
    totalMinutes: "",
    ingredients: [{ name: "", quantity: "", unit: "", note: "" }],
    steps: [{ instruction: "" }],
    tags: "",
  };
}

function parseApiError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 404) return "Recipe not found.";
  if (status === 401 || status === 403) {
    return "You are not authorized to modify this recipe.";
  }
  if (status === 400) {
    if (typeof data === "string") return data;
    if (data?.errors && typeof data.errors === "object") {
      const all = Object.values(data.errors).flat().filter(Boolean);
      if (all.length > 0) return all.join("\n");
    }
    if (data?.message) return data.message;
    return "Validation failed. Please review your inputs.";
  }

  return error?.message || "Could not save recipe.";
}

function mapServerKeyToFormikPath(key) {
  if (!key) return null;
  const normalized = key.replace(/^recipe\./i, "");
  if (normalized === "title") return "title";
  if (normalized === "description") return "description";
  if (normalized === "sourceUrl") return "sourceUrl";
  if (normalized === "prepMinutes") return "prepMinutes";
  if (normalized === "cookMinutes") return "cookMinutes";
  if (normalized === "totalMinutes") return "totalMinutes";
  if (normalized === "servings") return "servings";
  if (normalized === "tags") return "tags";

  const ing = /^ingredients\[(\d+)\]\.(name|quantity|unit|note|sortOrder)$/i.exec(normalized);
  if (ing) return `ingredients.${ing[1]}.${ing[2]}`;

  const step = /^steps\[(\d+)\]\.(instruction|sortOrder)$/i.exec(normalized);
  if (step) return `steps.${step[1]}.${step[2]}`;

  return null;
}

function mapProblemErrorsToFormik(problem) {
  const output = {};
  if (!problem?.errors || typeof problem.errors !== "object") return output;

  Object.entries(problem.errors).forEach(([key, value]) => {
    const path = mapServerKeyToFormikPath(key);
    if (!path) return;
    const message = Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value || "");
    if (message) output[path] = message;
  });

  return output;
}

export default function RecipeForm({ recipe, importPreview, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isEdit = Boolean(recipe?.id);

  const initialValues = buildInitialValues(recipe, importPreview);

  const handleSubmit = async (values, { setErrors }) => {
    try {
      setSubmitting(true);
      setSubmitError("");
      const tags = String(values.tags || "")
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        sourceUrl: values.sourceUrl.trim() || null,
        prepMinutes: values.prepMinutes === "" ? null : Number(values.prepMinutes),
        cookMinutes: values.cookMinutes === "" ? null : Number(values.cookMinutes),
        totalMinutes: values.totalMinutes === "" ? null : Number(values.totalMinutes),
        servings: Number(values.servings),
        ingredients: values.ingredients.map((i, index) => ({
          sortOrder: index + 1,
          name: String(i.name || "").trim(),
          quantity: i.quantity === "" || i.quantity == null ? null : Number(i.quantity),
          unit: String(i.unit || "").trim(),
          note: String(i.note || "").trim(),
        })),
        steps: values.steps.map((s, index) => ({
          sortOrder: index + 1,
          instruction: String(s.instruction || "").trim(),
        })),
        tags,
      };

      if (isEdit) {
        await updateRecipe(recipe.id, payload);
      } else {
        await createRecipe(payload);
      }
      onSaved();
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 400 && data?.errors) {
        const formErrors = mapProblemErrorsToFormik(data);
        if (Object.keys(formErrors).length > 0) {
          setErrors(formErrors);
          setSubmitError("Please fix the highlighted fields.");
          return;
        }
      }

      setSubmitError(parseApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 mb-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Button variant="text" className="flex items-center gap-2" onClick={onClose}>
          <ArrowLeftIcon className="h-5 w-5" />
          Back
        </Button>
        <Typography variant="h4" color="blue-gray">
          {isEdit ? "Edit recipe" : "New recipe"}
        </Typography>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form>
            {submitError ? (
              <div className="mb-4 rounded-md border border-red-100 bg-red-50 p-3">
                <Typography variant="small" color="red">
                  {submitError}
                </Typography>
              </div>
            ) : null}
            <Card className="mb-6 border border-blue-gray-100 shadow-sm">
              <CardHeader variant="gradient" color="gray" className="mb-2 p-6">
                <Typography variant="h6" color="white">
                  Basics
                </Typography>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <MyTextInput name="title" label="Title" placeholder="Recipe name" size="lg" />
                <MyTextInput
                  name="description"
                  label="Description"
                  placeholder="Short description"
                  size="lg"
                />
                <MyTextInput
                  name="sourceUrl"
                  label="Source URL"
                  placeholder="https://example.com/recipe"
                  size="lg"
                />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <MyTextInput name="servings" label="Servings" type="number" min={1} size="lg" />
                  <MyTextInput
                    name="prepMinutes"
                    label="Prep (min)"
                    type="number"
                    min={0}
                    size="lg"
                  />
                  <MyTextInput
                    name="cookMinutes"
                    label="Cook (min)"
                    type="number"
                    min={0}
                    size="lg"
                  />
                  <MyTextInput
                    name="totalMinutes"
                    label="Total (min)"
                    type="number"
                    min={0}
                    size="lg"
                  />
                </div>
                <MyTextInput
                  name="tags"
                  label="Tags"
                  placeholder="dessert, cookies"
                  size="lg"
                />
              </CardBody>
            </Card>

            <Card className="mb-6 mt-12 border border-blue-gray-100 shadow-sm">
              <CardHeader variant="gradient" color="gray" className="mb-2 p-6">
                <Typography variant="h6" color="white">
                  Ingredients
                </Typography>
              </CardHeader>
              <CardBody>
                <FieldArray name="ingredients">
                  {({ push, remove }) => (
                    <div className="flex flex-col gap-3">
                      {values.ingredients.map((_, idx) => (
                        <div key={idx} className="grid grid-cols-1 items-end gap-3 md:grid-cols-10">
                          <div className="md:col-span-2">
                            <MyTextInput
                              name={`ingredients.${idx}.name`}
                              label="Ingredient"
                              placeholder="Flour"
                              size="lg"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <MyTextInput
                              name={`ingredients.${idx}.quantity`}
                              label="Quantity"
                              placeholder="2.25"
                              type="number"
                              min={0}
                              step="any"
                              size="lg"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <MyTextInput
                              name={`ingredients.${idx}.unit`}
                              label="Unit"
                              placeholder="cups"
                              size="lg"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <MyTextInput
                              name={`ingredients.${idx}.note`}
                              label="Note"
                              placeholder="all-purpose"
                              size="lg"
                            />
                          </div>
                          <div className="md:col-span-1 flex justify-start pb-2">
                            <Button
                              type="button"
                              variant="text"
                              color="red"
                              className="p-2"
                              disabled={values.ingredients.length <= 1}
                              onClick={() => remove(idx)}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outlined"
                        className="flex w-fit items-center gap-2"
                        onClick={() => push({ name: "", quantity: "", unit: "", note: "" })}
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add ingredient
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </CardBody>
            </Card>

            <Card className="mb-6 mt-12 border border-blue-gray-100 shadow-sm">
              <CardHeader variant="gradient" color="gray" className="mb-2 p-6">
                <Typography variant="h6" color="white">
                  Steps
                </Typography>
              </CardHeader>
              <CardBody>
                <FieldArray name="steps">
                  {({ push, remove }) => (
                    <div className="flex flex-col gap-3">
                      {values.steps.map((_, idx) => (
                        <div key={idx} className="flex gap-2">
                          <div className="mt-2 w-8 shrink-0 text-sm font-bold text-blue-gray-400">
                            {idx + 1}.
                          </div>
                          <div className="flex-1">
                            <MyTextInput
                              name={`steps.${idx}.instruction`}
                              label={`Step ${idx + 1}`}
                              placeholder="Describe this step"
                              size="lg"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="text"
                            color="red"
                            className="mt-6 shrink-0 p-2"
                            disabled={values.steps.length <= 1}
                            onClick={() => remove(idx)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outlined"
                        className="flex w-fit items-center gap-2"
                        onClick={() => push({ instruction: "" })}
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add step
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </CardBody>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting} color="gray">
                {submitting ? "Saving..." : "Save recipe"}
              </Button>
              <Button type="button" variant="outlined" color="blue-gray" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
