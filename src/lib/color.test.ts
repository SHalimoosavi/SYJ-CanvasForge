import { describe, expect, it } from "vitest";
import { hexToRgbUnit } from "@/lib/color";

describe("hexToRgbUnit", () => {
  it("converts a 6-digit hex color to unit RGB", () => {
    expect(hexToRgbUnit("#ff0000")).toEqual({ r: 1, g: 0, b: 0 });
    expect(hexToRgbUnit("#00ff00")).toEqual({ r: 0, g: 1, b: 0 });
    expect(hexToRgbUnit("#0000ff")).toEqual({ r: 0, g: 0, b: 1 });
  });

  it("expands a 3-digit shorthand hex color", () => {
    expect(hexToRgbUnit("#f00")).toEqual({ r: 1, g: 0, b: 0 });
  });

  it("handles black and white", () => {
    expect(hexToRgbUnit("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgbUnit("#ffffff")).toEqual({ r: 1, g: 1, b: 1 });
  });
});
