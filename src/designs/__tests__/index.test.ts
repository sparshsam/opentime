import { describe, expect, it } from "vitest";
import {
  ALL_DESIGNS,
  ANALOG_DESIGNS,
  DEFAULT_DESIGN,
  DIGITAL_DESIGNS,
  designsByFamily,
  getDesign,
  WORLD_CLOCK_DESIGNS,
} from "../index";

describe("design registry", () => {
  it("registers all required digital families", () => {
    const ids = DIGITAL_DESIGNS.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "minimal-digital",
        "editorial",
        "classic-led",
        "flip",
        "terminal",
        "soft-panel",
        "compact",
      ]),
    );
  });

  it("registers all required analog families", () => {
    const ids = ANALOG_DESIGNS.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "classic-analog",
        "minimal-analog",
        "roman-analog",
        "railway-analog",
        "modern-analog",
        "numeral-free-analog",
      ]),
    );
  });

  it("registers the world-clock panel", () => {
    expect(WORLD_CLOCK_DESIGNS.map((d) => d.id)).toContain("world-clock-panel");
  });

  it("has exactly 14 designs", () => {
    expect(ALL_DESIGNS).toHaveLength(14);
  });

  it("default design is minimal-digital", () => {
    expect(DEFAULT_DESIGN).toBe("minimal-digital");
  });

  it("getDesign falls back to the first digital design for unknown ids", () => {
    expect(getDesign("nope" as never).id).toBe("minimal-digital");
  });

  it("designsByFamily groups correctly", () => {
    expect(designsByFamily("digital").length).toBe(7);
    expect(designsByFamily("analog").length).toBe(6);
    expect(designsByFamily("world-clock").length).toBe(1);
  });

  it("every design has a renderer component key", () => {
    for (const d of ALL_DESIGNS) {
      expect(d.component.length).toBeGreaterThan(0);
    }
  });

  it("compact design does not claim seconds support", () => {
    expect(getDesign("compact").capabilities.seconds).toBe(false);
  });

  it("flip design claims animation support", () => {
    expect(getDesign("flip").capabilities.animation).toBe(true);
  });
});
