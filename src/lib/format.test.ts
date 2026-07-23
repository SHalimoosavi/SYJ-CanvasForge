import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/format";

describe("formatBytes", () => {
  it("returns 0 B for zero or negative input", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
  });

  it("formats bytes without decimals", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB");
  });
});
