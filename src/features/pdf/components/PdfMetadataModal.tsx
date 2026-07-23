import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { usePdfStore } from "@/store/pdfStore";

interface PdfMetadataModalProps {
  open: boolean;
  onClose: () => void;
  fileId: string;
}

const FIELDS: { key: "title" | "author" | "subject" | "keywords"; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "subject", label: "Subject" },
  { key: "keywords", label: "Keywords (comma separated)" },
];

export function PdfMetadataModal({ open, onClose, fileId }: PdfMetadataModalProps) {
  const metadata = usePdfStore((s) => s.documents[fileId]?.present.metadata);
  const updateMetadata = usePdfStore((s) => s.updateMetadata);

  if (!metadata) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Document properties"
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="space-y-3">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="block text-sm">
            {label}
            <input
              value={metadata[key]}
              onChange={(event) => updateMetadata(fileId, { [key]: event.target.value })}
              className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-transparent px-3 py-1.5"
            />
          </label>
        ))}
        <p className="text-xs text-[var(--text-muted)]">
          Applied when you export the PDF. Producer and creator are set automatically.
        </p>
      </div>
    </Modal>
  );
}
