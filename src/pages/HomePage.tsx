import { FileText, Image as ImageIcon, FileType, ShieldCheck, Zap, Lock } from "lucide-react";
import { Dropzone } from "@/features/upload/components/Dropzone";

const FEATURES = [
  {
    icon: FileText,
    title: "PDF editing",
    description: "Annotate, reorganize, merge, split, and export PDFs with full page control.",
  },
  {
    icon: ImageIcon,
    title: "Image editing",
    description: "Crop, filter, draw, and compose images with a layer-based canvas editor.",
  },
  {
    icon: FileType,
    title: "Document viewing",
    description: "Open DOCX and TXT files, edit their text, and export instantly.",
  },
];

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Private by design",
    description:
      "Files are processed entirely in your browser. Nothing is uploaded to a server.",
  },
  {
    icon: Zap,
    title: "Fast",
    description: "No round-trips, no queues — editing happens the moment you interact.",
  },
  {
    icon: ShieldCheck,
    title: "Open source",
    description: "The full source is on GitHub. Inspect it, self-host it, or contribute.",
  },
];

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            SYJ-CanvasForge
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Professional PDF & image editor — fast, private, browser-based.
          </p>
        </div>
        <Dropzone />
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 pb-12 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] p-5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
              <Icon size={20} aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-3">
        {PRINCIPLES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3 p-2">
            <Icon size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
