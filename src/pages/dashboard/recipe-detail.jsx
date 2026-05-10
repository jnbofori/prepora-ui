import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Typography, Button, Chip } from "@material-tailwind/react";
import {
  DocumentDuplicateIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import MyTextInput from "@/components/MyTextInput";

function parseQuantity(qty) {
  const s = String(qty ?? "").trim();
  if (!s) return null;
  const frac = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    if (!b) return null;
    return a / b;
  }
  const mixed = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (mixed) {
    const whole = Number(mixed[1]);
    const a = Number(mixed[2]);
    const b = Number(mixed[3]);
    if (!b) return null;
    return whole + a / b;
  }
  const n = parseFloat(s.replace(/,/g, "."));
  return Number.isFinite(n) ? n : null;
}

function formatScaled(n) {
  const rounded = Math.round(n * 1000) / 1000;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return String(Math.round(rounded));
  return String(rounded);
}

export default function RecipeDetail({
  detail,
  loading,
  onBack,
  onDuplicate,
  onEdit,
  onDelete,
}) {
  const [scaledServings, setScaledServings] = useState(null);

  useEffect(() => {
    setScaledServings(detail?.servings ?? null);
  }, [detail]);

  const scaleFactor = useMemo(() => {
    if (!detail || scaledServings == null || !detail.servings) return 1;
    return scaledServings / detail.servings;
  }, [detail, scaledServings]);

  const sortedPhotos = useMemo(() => {
    const list = detail?.photos;
    if (!Array.isArray(list) || list.length === 0) return [];
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [detail?.photos]);

  return (
    <div className="mt-6 mb-8 flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="text" className="flex items-center gap-2" onClick={onBack}>
          ← Back to recipes
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outlined"
            className="flex items-center gap-2"
            onClick={() => detail && onDuplicate(detail.id)}
            disabled={!detail}
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
            Duplicate
          </Button>
          <Button className="flex items-center gap-2" color="gray" onClick={onEdit} disabled={!detail}>
            <PencilSquareIcon className="h-5 w-5" />
            Edit
          </Button>
          <Button
            variant="gradient"
            color="red"
            className="flex items-center gap-2"
            onClick={() => detail && onDelete(detail.id)}
            disabled={!detail}
          >
            <TrashIcon className="h-5 w-5" />
            Delete
          </Button>
        </div>
      </div>

      {loading ? (
        <Typography>Loading…</Typography>
      ) : !detail ? (
        <Typography color="blue-gray">Recipe not found.</Typography>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border border-blue-gray-100 shadow-sm lg:col-span-2">
            <CardBody className="flex flex-col gap-4">
              <Typography variant="h4" color="blue-gray">
                {detail.title}
              </Typography>
              {detail.description ? (
                <Typography className="text-blue-gray-600">{detail.description}</Typography>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {(detail.tags || []).map((t) => (
                  <Chip key={t} variant="gradient" color="blue-gray" value={t} />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Servings (base)", detail.servings],
                  ["Prep (min)", detail.prepMinutes ?? "—"],
                  ["Cook (min)", detail.cookMinutes ?? "—"],
                  ["Total (min)", detail.totalMinutes ?? "—"],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg bg-blue-gray-50/80 p-3">
                    <Typography variant="small" className="font-bold text-blue-gray-400">
                      {label}
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {val}
                    </Typography>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-blue-gray-100 p-4">
                <Typography variant="small" className="mb-2 font-bold text-blue-gray-500">
                  Scale ingredients
                </Typography>
                <div className="flex flex-wrap items-center gap-3">
                  <Typography variant="small" color="blue-gray">
                    Show quantities for
                  </Typography>
                  <MyTextInput
                    type="number"
                    min={1}
                    // className="!w-24"
                    value={scaledServings ?? ""}
                    onChange={(e) => setScaledServings(Math.max(1, Number(e.target.value) || 1))}
                  />
                  <Typography variant="small" color="blue-gray">
                    servings (base {detail.servings})
                  </Typography>
                </div>
                <Typography variant="small" className="mt-2 text-blue-gray-500">
                  Only numeric quantities are scaled; fractions like 1/2 are supported.
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Ingredients
                </Typography>
                <ul className="list-disc space-y-2 pl-5">
                  {(detail.ingredients || []).map((row, i) => {
                    const base = parseQuantity(row.quantity);
                    const qty = base != null ? formatScaled(base * scaleFactor) : row.quantity;
                    return (
                      <li key={i}>
                        <span className="font-semibold text-blue-gray-800">
                          {qty}
                          {row.unit ? ` ${row.unit}` : ""}
                        </span>{" "}
                        {row.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Steps
                </Typography>
                <ol className="list-decimal space-y-3 pl-5">
                  {(detail.steps || []).map((step, i) => (
                    <li key={i} className="text-blue-gray-700">
                      {step?.instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </CardBody>
          </Card>
          <div className="flex flex-col gap-4">
            {sortedPhotos.length > 0 ? (
              sortedPhotos.map((photo, i) => (
                <figure
                  key={photo.id ?? `photo-${i}`}
                  className="relative overflow-hidden rounded-xl shadow-md ring-1 ring-blue-gray-100"
                >
                  {photo.isCover ? (
                    <span className="absolute left-2 top-2 z-10 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
                      Cover
                    </span>
                  ) : null}
                  <img
                    src={photo.url}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                </figure>
              ))
            ) : (
              <Card className="border border-dashed border-blue-gray-200 bg-white">
                <CardBody>
                  <Typography color="blue-gray">No photo for this recipe.</Typography>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
