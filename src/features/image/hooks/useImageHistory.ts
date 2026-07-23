import { useCallback, useRef, useState } from "react";
import type { Canvas } from "fabric";

const HISTORY_LIMIT = 100;
const EXTRA_PROPS = ["selectable", "evented", "filters"];

export function useCanvasHistory(canvas: Canvas | null) {
  const past = useRef<Record<string, unknown>[]>([]);
  const future = useRef<Record<string, unknown>[]>([]);
  const isRestoring = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const snapshot = useCallback(() => {
    if (!canvas || isRestoring.current) return;
    const state = canvas.toObject(EXTRA_PROPS);
    past.current = [...past.current, state].slice(-HISTORY_LIMIT);
    future.current = [];
    syncFlags();
  }, [canvas, syncFlags]);

  const restore = useCallback(
    (state: Record<string, unknown>) => {
      if (!canvas) return;
      isRestoring.current = true;
      void canvas.loadFromJSON(state).then(() => {
        canvas.renderAll();
        isRestoring.current = false;
      });
    },
    [canvas],
  );

  const undo = useCallback(() => {
    if (!canvas || past.current.length === 0) return;
    const current = canvas.toObject(EXTRA_PROPS);
    const previous = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [current, ...future.current];
    restore(previous);
    syncFlags();
  }, [canvas, restore, syncFlags]);

  const redo = useCallback(() => {
    if (!canvas || future.current.length === 0) return;
    const current = canvas.toObject(EXTRA_PROPS);
    const [next, ...rest] = future.current;
    future.current = rest;
    past.current = [...past.current, current];
    restore(next);
    syncFlags();
  }, [canvas, restore, syncFlags]);

  const reset = useCallback(() => {
    past.current = [];
    future.current = [];
    syncFlags();
  }, [syncFlags]);

  return { snapshot, undo, redo, canUndo, canRedo, reset };
}
