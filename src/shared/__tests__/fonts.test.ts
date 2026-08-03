import { describe, expect, it } from "vitest";
import { fontStyleList, getFont } from "../fonts";

describe("font registry", () => {
  it("exposes all seven curated styles", () => {
    expect(fontStyleList().map((f) => f.id)).toEqual(
      expect.arrayContaining([
        "geometric-sans",
        "humanist-sans",
        "serif",
        "monospace",
        "segmented",
        "rounded",
        "condensed",
      ]),
    );
  });

  it("every font is bundled and OFL-licensed", () => {
    for (const f of fontStyleList()) {
      expect(f.bundled).toBe(true);
      expect(f.license).toBe("OFL-1.1");
    }
  });

  it("every font has a non-empty family and stack", () => {
    for (const f of fontStyleList()) {
      expect(f.family.length).toBeGreaterThan(0);
      expect(f.stack.length).toBeGreaterThan(0);
    }
  });

  it("looks up fonts by id", () => {
    expect(getFont("monospace").family).toBe("JetBrains Mono");
  });
});
