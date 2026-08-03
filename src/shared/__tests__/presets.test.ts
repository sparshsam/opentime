import { describe, expect, it } from "vitest";
import {
  appearanceFromPreset,
  applyPresetColors,
  passesContrast,
  presetList,
} from "../presets";

describe("presetList", () => {
  it("contains all eight curated presets", () => {
    const ids = presetList().map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "light",
        "dark",
        "warm",
        "cool",
        "monochrome",
        "high-contrast",
        "transparent",
        "soft-glass",
      ]),
    );
  });
});

describe("appearanceFromPreset", () => {
  it("maps preset colors onto a full config", () => {
    const c = appearanceFromPreset("dark");
    expect(c.presetId).toBe("dark");
    expect(c.primaryColor).toBe("#f9f9f9");
    expect(c.backgroundColor).toBe("#111111");
    expect(c.scale).toBe(1);
  });

  it("preserves overrides", () => {
    const c = appearanceFromPreset("light", { scale: 1.4, cornerRadius: 20 });
    expect(c.scale).toBe(1.4);
    expect(c.cornerRadius).toBe(20);
  });
});

describe("applyPresetColors", () => {
  it("resets colors but keeps structural fields", () => {
    const base = appearanceFromPreset("light", { scale: 1.3 });
    const out = applyPresetColors(base, "high-contrast");
    expect(out.primaryColor).toBe("#ffffff");
    expect(out.backgroundColor).toBe("#000000");
    expect(out.scale).toBe(1.3); // untouched
  });
});

describe("passesContrast", () => {
  it("passes black-on-white", () => {
    expect(passesContrast("#111111", "#f9f9f9", 3)).toBe(true);
  });

  it("passes white-on-black", () => {
    expect(passesContrast("#ffffff", "#000000", 3)).toBe(true);
  });

  it("fails white-on-white", () => {
    expect(passesContrast("#ffffff", "#ffffff", 3)).toBe(false);
  });

  it("fails low-contrast pairs", () => {
    expect(passesContrast("#777777", "#666666", 3)).toBe(false);
  });
});
