/** Parses a "#rrggbb" or "#rgb" string into 0–1 float RGB channels. */
export function hexToRgbUnit(hex: string): { r: number; g: number; b: number } {
  let normalized = hex.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(normalized, 16) || 0;
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
  };
}
