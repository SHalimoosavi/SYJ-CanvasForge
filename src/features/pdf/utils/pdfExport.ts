import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { PDFFont } from "pdf-lib";
import { hexToRgbUnit } from "@/lib/color";
import type { PdfDocState } from "@/store/pdfStore";
import type { PdfTextAnnotation } from "@/types";

function resolveStandardFont(annotation: PdfTextAnnotation): StandardFonts {
  const { fontFamily, bold, italic } = annotation;
  if (fontFamily === "Courier") {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  if (fontFamily === "Times-Roman") {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

export async function buildExportedPdf(
  originalBytes: ArrayBuffer,
  state: PdfDocState,
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const outputDoc = await PDFDocument.create();

  const activeOriginalIndices = state.pageOrder.filter(
    (index) => !state.deletedPages.includes(index),
  );

  if (activeOriginalIndices.length === 0) {
    throw new Error("Cannot export a document with no pages. Restore at least one page.");
  }

  const copiedPages = await outputDoc.copyPages(sourceDoc, activeOriginalIndices);
  copiedPages.forEach((page, position) => {
    const originalIndex = activeOriginalIndices[position];
    outputDoc.addPage(page);

    const extraRotation = state.rotations[originalIndex] ?? 0;
    if (extraRotation !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + extraRotation) % 360));
    }
  });

  const fontCache = new Map<StandardFonts, PDFFont>();
  async function getFont(font: StandardFonts): Promise<PDFFont> {
    const cached = fontCache.get(font);
    if (cached) return cached;
    const embedded = await outputDoc.embedFont(font);
    fontCache.set(font, embedded);
    return embedded;
  }

  for (let position = 0; position < activeOriginalIndices.length; position += 1) {
    const originalIndex = activeOriginalIndices[position];
    const page = outputDoc.getPage(position);

    const textAnnotations = state.textAnnotations.filter((a) => a.pageIndex === originalIndex);
    for (const annotation of textAnnotations) {
      const font = await getFont(resolveStandardFont(annotation));
      const { r, g, b } = hexToRgbUnit(annotation.color);
      page.drawText(annotation.text, {
        x: annotation.x,
        y: annotation.y,
        size: annotation.fontSize,
        font,
        color: rgb(r, g, b),
      });
    }

    const shapeAnnotations = state.shapeAnnotations.filter(
      (a) => a.pageIndex === originalIndex,
    );
    for (const shape of shapeAnnotations) {
      const { r, g, b } = hexToRgbUnit(shape.color);
      if (shape.type === "rectangle") {
        page.drawRectangle({
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          borderColor: rgb(r, g, b),
          borderWidth: shape.strokeWidth,
        });
      } else if (shape.type === "circle") {
        page.drawEllipse({
          x: shape.x + shape.width / 2,
          y: shape.y + shape.height / 2,
          xScale: Math.abs(shape.width) / 2,
          yScale: Math.abs(shape.height) / 2,
          borderColor: rgb(r, g, b),
          borderWidth: shape.strokeWidth,
        });
      } else {
        page.drawLine({
          start: { x: shape.x, y: shape.y },
          end: { x: shape.x + shape.width, y: shape.y + shape.height },
          thickness: shape.strokeWidth,
          color: rgb(r, g, b),
        });
      }
    }

    const highlightAnnotations = state.highlightAnnotations.filter(
      (a) => a.pageIndex === originalIndex,
    );
    for (const highlight of highlightAnnotations) {
      const { r, g, b } = hexToRgbUnit(highlight.color);
      if (highlight.style === "highlight") {
        page.drawRectangle({
          x: highlight.x,
          y: highlight.y,
          width: highlight.width,
          height: highlight.height,
          color: rgb(r, g, b),
          opacity: 0.35,
        });
      } else if (highlight.style === "underline") {
        page.drawLine({
          start: { x: highlight.x, y: highlight.y },
          end: { x: highlight.x + highlight.width, y: highlight.y },
          thickness: 1.5,
          color: rgb(r, g, b),
        });
      } else {
        const midY = highlight.y + highlight.height / 2;
        page.drawLine({
          start: { x: highlight.x, y: midY },
          end: { x: highlight.x + highlight.width, y: midY },
          thickness: 1.5,
          color: rgb(r, g, b),
        });
      }
    }
  }

  const { title, author, subject, keywords, creator, producer } = state.metadata;
  if (title) outputDoc.setTitle(title);
  if (author) outputDoc.setAuthor(author);
  if (subject) outputDoc.setSubject(subject);
  if (keywords)
    outputDoc.setKeywords(
      keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    );
  outputDoc.setCreator(creator || "SYJ-CanvasForge");
  outputDoc.setProducer(producer || "SYJ-CanvasForge");

  return outputDoc.save();
}
