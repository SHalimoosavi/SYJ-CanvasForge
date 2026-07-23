import { beforeEach, describe, expect, it } from "vitest";
import { usePdfStore } from "@/store/pdfStore";

const FILE_ID = "test-file";

beforeEach(() => {
  usePdfStore.setState({ documents: {} });
  usePdfStore.getState().initDocument(FILE_ID, 3);
});

describe("pdfStore page operations", () => {
  it("initializes a document with sequential pages", () => {
    const state = usePdfStore.getState().getState(FILE_ID);
    expect(state?.pageOrder).toEqual([0, 1, 2]);
    expect(state?.deletedPages).toEqual([]);
  });

  it("rotates a page by 90 degrees per call", () => {
    usePdfStore.getState().rotatePage(FILE_ID, 0, 1);
    expect(usePdfStore.getState().getState(FILE_ID)?.rotations[0]).toBe(90);
    usePdfStore.getState().rotatePage(FILE_ID, 0, 1);
    expect(usePdfStore.getState().getState(FILE_ID)?.rotations[0]).toBe(180);
  });

  it("marks a page deleted and excludes it from active pages", () => {
    usePdfStore.getState().deletePage(FILE_ID, 1);
    expect(usePdfStore.getState().getActivePages(FILE_ID)).toEqual([0, 2]);
  });

  it("restores a deleted page", () => {
    usePdfStore.getState().deletePage(FILE_ID, 1);
    usePdfStore.getState().restorePage(FILE_ID, 1);
    expect(usePdfStore.getState().getActivePages(FILE_ID)).toEqual([0, 1, 2]);
  });

  it("supports undo and redo across an operation", () => {
    usePdfStore.getState().deletePage(FILE_ID, 0);
    expect(usePdfStore.getState().getActivePages(FILE_ID)).toEqual([1, 2]);

    usePdfStore.getState().undo(FILE_ID);
    expect(usePdfStore.getState().getActivePages(FILE_ID)).toEqual([0, 1, 2]);

    usePdfStore.getState().redo(FILE_ID);
    expect(usePdfStore.getState().getActivePages(FILE_ID)).toEqual([1, 2]);
  });

  it("adds and removes text annotations", () => {
    const id = usePdfStore.getState().addTextAnnotation(FILE_ID, {
      pageIndex: 0,
      x: 10,
      y: 20,
      text: "Hello",
      fontSize: 14,
      color: "#000000",
      fontFamily: "Helvetica",
      bold: false,
      italic: false,
    });
    expect(usePdfStore.getState().getState(FILE_ID)?.textAnnotations).toHaveLength(1);

    usePdfStore.getState().removeTextAnnotation(FILE_ID, id);
    expect(usePdfStore.getState().getState(FILE_ID)?.textAnnotations).toHaveLength(0);
  });
});
