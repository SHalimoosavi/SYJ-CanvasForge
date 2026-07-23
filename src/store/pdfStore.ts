import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  PdfHighlightAnnotation,
  PdfMetadata,
  PdfShapeAnnotation,
  PdfTextAnnotation,
} from "@/types";

export interface PdfDocState {
  fileId: string;
  pageOrder: number[]; // original page indices, in current display order
  rotations: Record<number, 0 | 90 | 180 | 270>; // keyed by original page index
  deletedPages: number[]; // original page indices marked deleted
  textAnnotations: PdfTextAnnotation[];
  shapeAnnotations: PdfShapeAnnotation[];
  highlightAnnotations: PdfHighlightAnnotation[];
  metadata: PdfMetadata;
}

interface DocHistory {
  present: PdfDocState;
  past: PdfDocState[];
  future: PdfDocState[];
}

const HISTORY_LIMIT = 100;

function emptyMetadata(): PdfMetadata {
  return {
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "SYJ-CanvasForge",
    producer: "SYJ-CanvasForge",
  };
}

function clone(state: PdfDocState): PdfDocState {
  return structuredClone(state);
}

interface PdfStoreState {
  documents: Record<string, DocHistory>;
  initDocument: (fileId: string, pageCount: number, metadata?: Partial<PdfMetadata>) => void;
  hasDocument: (fileId: string) => boolean;
  getActivePages: (fileId: string) => number[];
  getState: (fileId: string) => PdfDocState | undefined;

  rotatePage: (fileId: string, pageIndex: number, direction: 1 | -1) => void;
  deletePage: (fileId: string, pageIndex: number) => void;
  restorePage: (fileId: string, pageIndex: number) => void;
  reorderPages: (fileId: string, fromDisplayIndex: number, toDisplayIndex: number) => void;
  duplicatePage: (fileId: string, pageIndex: number) => void;

  addTextAnnotation: (fileId: string, annotation: Omit<PdfTextAnnotation, "id">) => string;
  updateTextAnnotation: (
    fileId: string,
    id: string,
    patch: Partial<PdfTextAnnotation>,
  ) => void;
  removeTextAnnotation: (fileId: string, id: string) => void;

  addShapeAnnotation: (fileId: string, annotation: Omit<PdfShapeAnnotation, "id">) => string;
  removeShapeAnnotation: (fileId: string, id: string) => void;

  addHighlightAnnotation: (
    fileId: string,
    annotation: Omit<PdfHighlightAnnotation, "id">,
  ) => string;
  removeHighlightAnnotation: (fileId: string, id: string) => void;

  updateMetadata: (fileId: string, patch: Partial<PdfMetadata>) => void;

  undo: (fileId: string) => void;
  redo: (fileId: string) => void;
  canUndo: (fileId: string) => boolean;
  canRedo: (fileId: string) => boolean;
  removeDocument: (fileId: string) => void;
}

function commit(
  documents: Record<string, DocHistory>,
  fileId: string,
  producer: (draft: PdfDocState) => PdfDocState,
): Record<string, DocHistory> {
  const history = documents[fileId];
  if (!history) return documents;
  const nextPresent = producer(clone(history.present));
  const past = [...history.past, history.present].slice(-HISTORY_LIMIT);
  return {
    ...documents,
    [fileId]: { present: nextPresent, past, future: [] },
  };
}

export const usePdfStore = create<PdfStoreState>((set, get) => ({
  documents: {},

  initDocument: (fileId, pageCount, metadata) => {
    if (get().documents[fileId]) return;
    const present: PdfDocState = {
      fileId,
      pageOrder: Array.from({ length: pageCount }, (_, i) => i),
      rotations: {},
      deletedPages: [],
      textAnnotations: [],
      shapeAnnotations: [],
      highlightAnnotations: [],
      metadata: { ...emptyMetadata(), ...metadata },
    };
    set((state) => ({
      documents: { ...state.documents, [fileId]: { present, past: [], future: [] } },
    }));
  },

  hasDocument: (fileId) => Boolean(get().documents[fileId]),

  getActivePages: (fileId) => {
    const doc = get().documents[fileId]?.present;
    if (!doc) return [];
    return doc.pageOrder.filter((p) => !doc.deletedPages.includes(p));
  },

  getState: (fileId) => get().documents[fileId]?.present,

  rotatePage: (fileId, pageIndex, direction) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        const current = draft.rotations[pageIndex] ?? 0;
        const next = (((current + direction * 90) % 360) + 360) % 360;
        draft.rotations[pageIndex] = next as 0 | 90 | 180 | 270;
        return draft;
      }),
    })),

  deletePage: (fileId, pageIndex) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        if (!draft.deletedPages.includes(pageIndex)) {
          draft.deletedPages.push(pageIndex);
        }
        return draft;
      }),
    })),

  restorePage: (fileId, pageIndex) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.deletedPages = draft.deletedPages.filter((p) => p !== pageIndex);
        return draft;
      }),
    })),

  duplicatePage: (fileId, pageIndex) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        const position = draft.pageOrder.indexOf(pageIndex);
        draft.pageOrder.splice(position + 1, 0, pageIndex);
        return draft;
      }),
    })),

  reorderPages: (fileId, fromDisplayIndex, toDisplayIndex) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        const activeOrder = draft.pageOrder.filter((p) => !draft.deletedPages.includes(p));
        const [moved] = activeOrder.splice(fromDisplayIndex, 1);
        activeOrder.splice(toDisplayIndex, 0, moved);
        const deletedInOriginalPositions = draft.pageOrder.filter((p) =>
          draft.deletedPages.includes(p),
        );
        draft.pageOrder = [...activeOrder, ...deletedInOriginalPositions];
        return draft;
      }),
    })),

  addTextAnnotation: (fileId, annotation) => {
    const id = uuid();
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.textAnnotations.push({ ...annotation, id });
        return draft;
      }),
    }));
    return id;
  },

  updateTextAnnotation: (fileId, id, patch) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.textAnnotations = draft.textAnnotations.map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        );
        return draft;
      }),
    })),

  removeTextAnnotation: (fileId, id) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.textAnnotations = draft.textAnnotations.filter((a) => a.id !== id);
        return draft;
      }),
    })),

  addShapeAnnotation: (fileId, annotation) => {
    const id = uuid();
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.shapeAnnotations.push({ ...annotation, id });
        return draft;
      }),
    }));
    return id;
  },

  removeShapeAnnotation: (fileId, id) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.shapeAnnotations = draft.shapeAnnotations.filter((a) => a.id !== id);
        return draft;
      }),
    })),

  addHighlightAnnotation: (fileId, annotation) => {
    const id = uuid();
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.highlightAnnotations.push({ ...annotation, id });
        return draft;
      }),
    }));
    return id;
  },

  removeHighlightAnnotation: (fileId, id) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.highlightAnnotations = draft.highlightAnnotations.filter((a) => a.id !== id);
        return draft;
      }),
    })),

  updateMetadata: (fileId, patch) =>
    set((state) => ({
      documents: commit(state.documents, fileId, (draft) => {
        draft.metadata = { ...draft.metadata, ...patch };
        return draft;
      }),
    })),

  undo: (fileId) =>
    set((state) => {
      const history = state.documents[fileId];
      if (!history || history.past.length === 0) return state;
      const previous = history.past[history.past.length - 1];
      const past = history.past.slice(0, -1);
      return {
        documents: {
          ...state.documents,
          [fileId]: {
            present: previous,
            past,
            future: [history.present, ...history.future],
          },
        },
      };
    }),

  redo: (fileId) =>
    set((state) => {
      const history = state.documents[fileId];
      if (!history || history.future.length === 0) return state;
      const [next, ...rest] = history.future;
      return {
        documents: {
          ...state.documents,
          [fileId]: {
            present: next,
            past: [...history.past, history.present],
            future: rest,
          },
        },
      };
    }),

  canUndo: (fileId) => (get().documents[fileId]?.past.length ?? 0) > 0,
  canRedo: (fileId) => (get().documents[fileId]?.future.length ?? 0) > 0,

  removeDocument: (fileId) =>
    set((state) => {
      const { [fileId]: _removed, ...rest } = state.documents;
      return { documents: rest };
    }),
}));
