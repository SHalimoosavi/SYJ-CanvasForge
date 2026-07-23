import { describe, expect, it } from "vitest";
import {
  getExtension,
  extensionToKind,
  validateBasics,
  verifyIntegrity,
  MAX_FILE_SIZE_BYTES,
} from "@/services/fileValidation";

function makeFile(name: string, content: Uint8Array | string, type = ""): File {
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("getExtension", () => {
  it("extracts a supported extension case-insensitively", () => {
    expect(getExtension("resume.PDF")).toBe("pdf");
    expect(getExtension("photo.JPG")).toBe("jpg");
  });

  it("returns null for unsupported extensions", () => {
    expect(getExtension("archive.exe")).toBeNull();
    expect(getExtension("no-extension")).toBeNull();
  });
});

describe("extensionToKind", () => {
  it("maps extensions to the correct workspace kind", () => {
    expect(extensionToKind("pdf")).toBe("pdf");
    expect(extensionToKind("png")).toBe("image");
    expect(extensionToKind("docx")).toBe("document");
  });
});

describe("validateBasics", () => {
  it("rejects empty files", () => {
    const file = makeFile("empty.pdf", "");
    expect(validateBasics(file).valid).toBe(false);
  });

  it("rejects files over the size limit", () => {
    const bigContent = new Uint8Array(MAX_FILE_SIZE_BYTES + 1);
    const file = makeFile("big.pdf", bigContent);
    const result = validateBasics(file);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/100 MB/);
  });

  it("rejects unsupported file types", () => {
    const file = makeFile("script.exe", "MZ");
    expect(validateBasics(file).valid).toBe(false);
  });

  it("accepts a well-formed supported file", () => {
    const file = makeFile("notes.txt", "hello world");
    expect(validateBasics(file).valid).toBe(true);
  });
});

describe("verifyIntegrity", () => {
  it("accepts a PDF with a valid %PDF signature", async () => {
    const file = makeFile("doc.pdf", "%PDF-1.7\n...");
    const result = await verifyIntegrity(file, "pdf");
    expect(result.valid).toBe(true);
  });

  it("rejects a PDF with an invalid signature", async () => {
    const file = makeFile("fake.pdf", "not a real pdf");
    const result = await verifyIntegrity(file, "pdf");
    expect(result.valid).toBe(false);
  });

  it("accepts a PNG with a valid signature", async () => {
    const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = makeFile("image.png", signature);
    const result = await verifyIntegrity(file, "png");
    expect(result.valid).toBe(true);
  });

  it("always accepts text-based formats without a signature", async () => {
    const file = makeFile("notes.txt", "plain text content");
    const result = await verifyIntegrity(file, "txt");
    expect(result.valid).toBe(true);
  });
});
