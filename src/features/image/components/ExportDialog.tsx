import { useState } from "react";
import type { Canvas } from "fabric";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import type { ExportImageFormat } from "@/types";
import { downloadCanvasImage } from "@/features/image/utils/exportImage";
import { withoutExtension } from "@/lib/download";
import { toast } from "@/store/toastStore";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  canvas: Canvas | null;
  fileName: string;
}

const FORMATS: ExportImageFormat[] = ["png", "jpeg", "webp"];

export function ExportDialog({ open, onClose, canvas, fileName }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportImageFormat>("png");
  const [quality, setQuality] = useState(0.92);
  const [multiplier, setMultiplier] = useState(1);
  const [transparent, setTransparent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!canvas) return;
    setIsExporting(true);
    try {
      await downloadCanvasImage(canvas, withoutExtension(fileName), {
        format,
        quality,
        multiplier,
        transparentBackground: transparent,
      });
      toast.success("Image exported", "Your download should begin shortly.");
      onClose();
    } catch (error) {
      toast.error("Export failed", error instanceof Error ? error.message : undefined);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export image"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} isLoading={isExporting}>
            Download
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-[var(--text-secondary)]">Format</p>
          <div className="flex gap-2">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium uppercase ${
                  format === f
                    ? "border-brand-500 bg-brand-50/60 text-brand-700 dark:bg-brand-950/30"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {format !== "png" && (
          <Slider
            label="Quality"
            min={0.1}
            max={1}
            step={0.01}
            value={quality}
            displayValue={`${Math.round(quality * 100)}%`}
            onChange={setQuality}
          />
        )}

        <Slider
          label="Resolution"
          min={0.5}
          max={3}
          step={0.25}
          value={multiplier}
          displayValue={`${multiplier}x`}
          onChange={setMultiplier}
        />

        {format === "png" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(event) => setTransparent(event.target.checked)}
            />
            Transparent background
          </label>
        )}
      </div>
    </Modal>
  );
}
