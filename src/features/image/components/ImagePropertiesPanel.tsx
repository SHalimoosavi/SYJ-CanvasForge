import { useEffect, useState } from "react";
import type { Canvas, FabricImage, FabricObject } from "fabric";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  CopyPlus,
  ChevronUp,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
} from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import type { ImageFilterValues } from "@/types";
import {
  applyFiltersToImage,
  applySharpen,
  DEFAULT_FILTER_VALUES,
} from "@/features/image/utils/filters";
import { cn } from "@/lib/cn";

interface ImagePropertiesPanelProps {
  canvas: Canvas | null;
  baseImage: FabricImage | null;
  onChange: () => void;
}

function useForceRender(canvas: Canvas | null) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!canvas) return;
    const bump = () => setTick((t) => t + 1);
    canvas.on("selection:created", bump);
    canvas.on("selection:updated", bump);
    canvas.on("selection:cleared", bump);
    canvas.on("object:added", bump);
    canvas.on("object:removed", bump);
    canvas.on("object:modified", bump);
    return () => {
      canvas.off("selection:created", bump);
      canvas.off("selection:updated", bump);
      canvas.off("selection:cleared", bump);
      canvas.off("object:added", bump);
      canvas.off("object:removed", bump);
      canvas.off("object:modified", bump);
    };
  }, [canvas]);
}

const FILTER_CONFIG: {
  key: keyof ImageFilterValues;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "brightness", label: "Brightness", min: -1, max: 1, step: 0.01 },
  { key: "contrast", label: "Contrast", min: -1, max: 1, step: 0.01 },
  { key: "saturation", label: "Saturation", min: -1, max: 1, step: 0.01 },
  { key: "vibrance", label: "Vibrance", min: -1, max: 1, step: 0.01 },
  { key: "hue", label: "Hue", min: -1, max: 1, step: 0.01 },
  { key: "blur", label: "Blur", min: 0, max: 1, step: 0.01 },
  { key: "noise", label: "Noise", min: 0, max: 400, step: 5 },
];

export function ImagePropertiesPanel({
  canvas,
  baseImage,
  onChange,
}: ImagePropertiesPanelProps) {
  useForceRender(canvas);
  const [filters, setFilters] = useState<ImageFilterValues>(DEFAULT_FILTER_VALUES);
  const [sharpen, setSharpen] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [invert, setInvert] = useState(false);

  useEffect(() => {
    setFilters(DEFAULT_FILTER_VALUES);
    setSharpen(0);
    setGrayscale(false);
    setSepia(false);
    setInvert(false);
  }, [baseImage]);

  function commitFilters(
    next: ImageFilterValues,
    opts?: { grayscale?: boolean; sepia?: boolean; invert?: boolean },
  ) {
    if (!baseImage || !canvas) return;
    const merged = {
      ...next,
      grayscale: (opts?.grayscale ?? grayscale) ? 1 : 0,
      sepia: (opts?.sepia ?? sepia) ? 1 : 0,
      invert: (opts?.invert ?? invert) ? 1 : 0,
    };
    if (sharpen > 0) {
      applySharpen(baseImage, sharpen, merged);
    } else {
      applyFiltersToImage(baseImage, merged);
    }
    canvas.renderAll();
  }

  const activeObject = canvas?.getActiveObject() ?? null;
  const objects = canvas ? canvas.getObjects().filter((obj) => obj !== baseImage) : [];

  function moveLayer(obj: FabricObject, direction: "up" | "down") {
    if (!canvas) return;
    if (direction === "up") canvas.bringObjectForward(obj);
    else canvas.sendObjectBackwards(obj);
    canvas.renderAll();
    onChange();
  }

  function toggleVisible(obj: FabricObject) {
    obj.set("visible", !obj.visible);
    canvas?.renderAll();
    onChange();
  }

  function toggleLock(obj: FabricObject) {
    const locked = !obj.selectable;
    obj.set({
      selectable: locked,
      evented: locked,
      lockMovementX: !locked,
      lockMovementY: !locked,
    });
    canvas?.renderAll();
    onChange();
  }

  function duplicateLayer(obj: FabricObject) {
    if (!canvas) return;
    obj.clone().then((clone: FabricObject) => {
      clone.set({ left: (obj.left ?? 0) + 12, top: (obj.top ?? 0) + 12 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.renderAll();
      onChange();
    });
  }

  function deleteLayer(obj: FabricObject) {
    canvas?.remove(obj);
    canvas?.renderAll();
    onChange();
  }

  return (
    <div className="flex h-full w-72 flex-col overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--surface-0)]">
      <section className="border-b border-[var(--border-subtle)] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Filters
        </h3>
        <div className="space-y-3">
          {FILTER_CONFIG.map(({ key, label, min, max, step }) => (
            <Slider
              key={key}
              label={label}
              min={min}
              max={max}
              step={step}
              value={filters[key]}
              onChange={(value) => {
                const next = { ...filters, [key]: value };
                setFilters(next);
                commitFilters(next);
              }}
            />
          ))}
          <Slider
            label="Sharpen"
            min={0}
            max={1}
            step={0.05}
            value={sharpen}
            onChange={(value) => {
              setSharpen(value);
              commitFilters(filters);
            }}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              {
                label: "Grayscale",
                value: grayscale,
                setValue: setGrayscale,
                key: "grayscale" as const,
              },
              { label: "Sepia", value: sepia, setValue: setSepia, key: "sepia" as const },
              { label: "Invert", value: invert, setValue: setInvert, key: "invert" as const },
            ].map(({ label, value, setValue, key }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const nextValue = !value;
                  setValue(nextValue);
                  commitFilters(filters, { [key]: nextValue });
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  value
                    ? "border-brand-500 bg-brand-600/10 text-brand-600"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters(DEFAULT_FILTER_VALUES);
              setSharpen(0);
              setGrayscale(false);
              setSepia(false);
              setInvert(false);
              if (baseImage && canvas) {
                baseImage.filters = [];
                baseImage.applyFilters();
                canvas.renderAll();
              }
            }}
          >
            Reset filters
          </Button>
        </div>
      </section>

      {activeObject && activeObject.type === "i-text" && (
        <section className="border-b border-[var(--border-subtle)] p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Text
          </h3>
          <div className="space-y-2">
            <Slider
              label="Font size"
              min={8}
              max={160}
              step={1}
              value={Number(activeObject.get("fontSize")) || 24}
              onChange={(value) => {
                activeObject.set("fontSize", value);
                canvas?.renderAll();
                onChange();
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const isBold = activeObject.get("fontWeight") === "bold";
                  activeObject.set("fontWeight", isBold ? "normal" : "bold");
                  canvas?.renderAll();
                  onChange();
                }}
                className="rounded-md border border-[var(--border-subtle)] px-3 py-1 text-sm font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => {
                  const isItalic = activeObject.get("fontStyle") === "italic";
                  activeObject.set("fontStyle", isItalic ? "normal" : "italic");
                  canvas?.renderAll();
                  onChange();
                }}
                className="rounded-md border border-[var(--border-subtle)] px-3 py-1 text-sm italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => {
                  const underline = Boolean(activeObject.get("underline"));
                  activeObject.set("underline", !underline);
                  canvas?.renderAll();
                  onChange();
                }}
                className="rounded-md border border-[var(--border-subtle)] px-3 py-1 text-sm underline"
              >
                U
              </button>
              <input
                type="color"
                aria-label="Text color"
                value={String(activeObject.get("fill") ?? "#000000")}
                onChange={(event) => {
                  activeObject.set("fill", event.target.value);
                  canvas?.renderAll();
                  onChange();
                }}
                className="h-8 w-8 cursor-pointer rounded border border-[var(--border-subtle)] bg-transparent"
              />
            </div>
          </div>
        </section>
      )}

      {activeObject && (
        <section className="border-b border-[var(--border-subtle)] p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Selection
          </h3>
          <div className="space-y-3">
            <Slider
              label="Rotation"
              min={0}
              max={360}
              step={1}
              value={Math.round(activeObject.angle ?? 0)}
              onChange={(value) => {
                activeObject.rotate(value);
                canvas?.renderAll();
                onChange();
              }}
            />
            <div className="flex gap-2">
              <IconButton
                icon={<FlipHorizontal size={16} />}
                label="Flip horizontal"
                onClick={() => {
                  activeObject.set("flipX", !activeObject.flipX);
                  canvas?.renderAll();
                  onChange();
                }}
              />
              <IconButton
                icon={<FlipVertical size={16} />}
                label="Flip vertical"
                onClick={() => {
                  activeObject.set("flipY", !activeObject.flipY);
                  canvas?.renderAll();
                  onChange();
                }}
              />
              <IconButton
                icon={<RotateCw size={16} />}
                label="Rotate 90°"
                onClick={() => {
                  activeObject.rotate(((activeObject.angle ?? 0) + 90) % 360);
                  canvas?.renderAll();
                  onChange();
                }}
              />
            </div>
          </div>
        </section>
      )}

      <section className="flex-1 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Layers ({objects.length})
        </h3>
        {objects.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Shapes, text, and drawings you add will appear here.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {[...objects].reverse().map((obj, i) => {
              const isActive = activeObject === obj;
              const isLocked = obj.selectable === false;
              const label =
                obj.type === "i-text"
                  ? `Text: ${String(obj.get("text")).slice(0, 16)}`
                  : `${obj.type} ${objects.length - i}`;
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-1 rounded-md border p-1.5 text-xs",
                    isActive
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30"
                      : "border-[var(--border-subtle)]",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left"
                    onClick={() => {
                      canvas?.setActiveObject(obj);
                      canvas?.renderAll();
                      onChange();
                    }}
                  >
                    {label}
                  </button>
                  <IconButton
                    size="sm"
                    icon={obj.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                    label="Toggle visibility"
                    onClick={() => toggleVisible(obj)}
                  />
                  <IconButton
                    size="sm"
                    icon={isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                    label="Toggle lock"
                    onClick={() => toggleLock(obj)}
                  />
                  <IconButton
                    size="sm"
                    icon={<ChevronUp size={13} />}
                    label="Bring forward"
                    onClick={() => moveLayer(obj, "up")}
                  />
                  <IconButton
                    size="sm"
                    icon={<ChevronDown size={13} />}
                    label="Send backward"
                    onClick={() => moveLayer(obj, "down")}
                  />
                  <IconButton
                    size="sm"
                    icon={<CopyPlus size={13} />}
                    label="Duplicate"
                    onClick={() => duplicateLayer(obj)}
                  />
                  <IconButton
                    size="sm"
                    icon={<Trash2 size={13} />}
                    label="Delete"
                    onClick={() => deleteLayer(obj)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
