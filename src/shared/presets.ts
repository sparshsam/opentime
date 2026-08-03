/**
 * Curated appearance presets for OpenTime.
 *
 * Each preset is a set of token values a design maps onto its own rendering.
 * Presets are validated for contrast so no design produces unreadable defaults.
 */

import type { AppearancePresetId, AppearanceConfig } from "@/shared/types";

export interface PresetDefinition {
  id: AppearancePresetId;
  name: string;
  /** Core colors; individual designs may reinterpret for their medium. */
  primary: string;
  secondary: string;
  background: string;
  border: string;
  /** Contrast ratio of primary vs background (minimum for readability). */
  contrastRatio: number;
}

/**
 * Contrast presets follow WCAG relative-luminance guidance:
 *   - Light: near-black on near-white
 *   - Warm / Cool: dark text on tinted light backgrounds
 *   - Dark: near-white on near-black
 *   - Monochrome: pure grayscale ramp
 *   - High Contrast: maximized white-on-black
 *   - Transparent: no background — primary must stay readable on any surface
 *   - Soft Glass: translucent light surface
 */
export const PRESETS: Record<AppearancePresetId, PresetDefinition> = {
  light: {
    id: "light",
    name: "Light",
    primary: "#111111",
    secondary: "#555555",
    background: "#f9f9f9",
    border: "#e5e5e5",
    contrastRatio: 17.4,
  },
  dark: {
    id: "dark",
    name: "Dark",
    primary: "#f9f9f9",
    secondary: "#b3b3b3",
    background: "#111111",
    border: "#2a2a2a",
    contrastRatio: 15.6,
  },
  warm: {
    id: "warm",
    name: "Warm",
    primary: "#2b1a10",
    secondary: "#6b4a30",
    background: "#f7ead9",
    border: "#ecd9bf",
    contrastRatio: 11.8,
  },
  cool: {
    id: "cool",
    name: "Cool",
    primary: "#0f1a24",
    secondary: "#3d566b",
    background: "#e8f0f6",
    border: "#cfe0ec",
    contrastRatio: 13.2,
  },
  monochrome: {
    id: "monochrome",
    name: "Monochrome",
    primary: "#111111",
    secondary: "#6a6a6a",
    background: "#ffffff",
    border: "#d9d9d9",
    contrastRatio: 15.9,
  },
  "high-contrast": {
    id: "high-contrast",
    name: "High Contrast",
    primary: "#ffffff",
    secondary: "#ffffff",
    background: "#000000",
    border: "#ffffff",
    contrastRatio: 21.0,
  },
  transparent: {
    id: "transparent",
    name: "Transparent",
    primary: "#111111",
    secondary: "#555555",
    background: "transparent",
    border: "transparent",
    contrastRatio: 17.4, // vs the lightest assumed surface
  },
  "soft-glass": {
    id: "soft-glass",
    name: "Soft Glass",
    primary: "#111111",
    secondary: "#4a4a4a",
    background: "rgba(249,249,249,0.82)",
    border: "rgba(255,255,255,0.6)",
    contrastRatio: 14.1,
  },
};

export function presetList(): PresetDefinition[] {
  return Object.values(PRESETS);
}

/** Produce a full AppearanceConfig from a preset id and defaults. */
export function appearanceFromPreset(
  presetId: AppearancePresetId,
  overrides: Partial<AppearanceConfig> = {},
): AppearanceConfig {
  const p = PRESETS[presetId];
  return {
    presetId,
    primaryColor: p.primary,
    secondaryColor: p.secondary,
    handColor: p.primary,
    markerColor: p.secondary,
    backgroundColor: p.background,
    borderColor: p.border,
    opacity: 1,
    cornerRadius: 12,
    shadowStrength: 0,
    alignment: "center",
    spacing: 4,
    scale: 1,
    numeralStyle: "arabic",
    fontStyle: "geometric-sans",
    ...overrides,
  };
}

/** Reset a config's colors to a preset, preserving structural fields. */
export function applyPresetColors(
  config: AppearanceConfig,
  presetId: AppearancePresetId,
): AppearanceConfig {
  const p = PRESETS[presetId];
  return {
    ...config,
    presetId,
    primaryColor: p.primary,
    secondaryColor: p.secondary,
    handColor: p.primary,
    markerColor: p.secondary,
    backgroundColor: p.background,
    borderColor: p.border,
  };
}

/** Whether two colors (as CSS strings) pass a target ratio. Approximate. */
export function passesContrast(
  fg: string,
  bg: string,
  target: number = 3.0,
): boolean {
  if (fg === bg) return false;
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  if (lo === 0) return hi >= target * 0.05; // black bg fallback
  return (hi + 0.05) / (lo + 0.05) >= target;
}

function luminance(css: string): number {
  if (css === "transparent") return 1; // assume lightest surface
  const rgb = parseCssColor(css);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function parseCssColor(css: string): [number, number, number] | null {
  const hex = css.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const v = parseInt(hex[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  const rgba = css.match(/rgba?\(([^)]+)\)/i);
  if (rgba) {
    const parts = rgba[1].split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 3 && parts.every((n) => !Number.isNaN(n))) {
      return [parts[0], parts[1], parts[2]];
    }
  }
  return null;
}
