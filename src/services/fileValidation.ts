import type { SupportedExtension, ValidationResult, WorkspaceKind } from "@/types";

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB per file

const EXTENSION_KIND: Record<SupportedExtension, WorkspaceKind> = {
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  gif: "image",
  svg: "image",
  bmp: "image",
  txt: "document",
  docx: "document",
};

const MIME_TYPES: Record<SupportedExtension, string[]> = {
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  svg: ["image/svg+xml"],
  bmp: ["image/bmp", "image/x-ms-bmp"],
  txt: ["text/plain"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export const ACCEPTED_EXTENSIONS = Object.keys(EXTENSION_KIND) as SupportedExtension[];

export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

export function getExtension(fileName: string): SupportedExtension | null {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  if (!match) return null;
  const ext = match[1].toLowerCase();
  return (ACCEPTED_EXTENSIONS as string[]).includes(ext) ? (ext as SupportedExtension) : null;
}

export function extensionToKind(extension: SupportedExtension): WorkspaceKind {
  return EXTENSION_KIND[extension];
}

export function validateBasics(file: File): ValidationResult {
  if (file.size === 0) {
    return { valid: false, error: `"${file.name}" is empty.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the 100 MB limit.`,
    };
  }
  const extension = getExtension(file.name);
  if (!extension) {
    return {
      valid: false,
      error: `"${file.name}" has an unsupported file type.`,
    };
  }
  return { valid: true };
}

/** Magic-byte signatures used to detect corrupted or mislabeled files. */
const SIGNATURES: Partial<Record<SupportedExtension, number[][]>> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  png: [[0x89, 0x50, 0x4e, 0x47]],
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  bmp: [[0x42, 0x4d]],
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF....WEBP
  docx: [[0x50, 0x4b, 0x03, 0x04]], // ZIP/OOXML container
};

function bytesMatch(buffer: ArrayBuffer, signature: number[]): boolean {
  const view = new Uint8Array(buffer, 0, Math.min(signature.length, buffer.byteLength));
  if (view.length < signature.length) return false;
  return signature.every((byte, index) => view[index] === byte);
}

export async function verifyIntegrity(
  file: File,
  extension: SupportedExtension,
): Promise<ValidationResult> {
  // Text-based formats (txt, svg) don't have a binary signature to check.
  if (extension === "txt" || extension === "svg") {
    return { valid: true };
  }

  const signatures = SIGNATURES[extension];
  if (!signatures) return { valid: true };

  const headerBuffer = await file.slice(0, 16).arrayBuffer();
  const matches = signatures.some((sig) => bytesMatch(headerBuffer, sig));

  if (!matches) {
    return {
      valid: false,
      error: `"${file.name}" appears to be corrupted or is not a valid .${extension} file.`,
    };
  }
  return { valid: true };
}

export function isMimeConsistent(file: File, extension: SupportedExtension): boolean {
  const expected = MIME_TYPES[extension];
  if (!file.type) return true; // Browsers don't always populate this reliably.
  return expected.includes(file.type);
}
