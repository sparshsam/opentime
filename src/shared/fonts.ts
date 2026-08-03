/**
 * OpenTime font registry.
 *
 * Curated, legally redistributable font styles — never an unstructured list of
 * every bundled font. Each style label maps to a specific bundled family and
 * its license. Fonts ship locally; no online font downloads.
 */

import type { FontStyleId } from "@/shared/types";

export interface FontDefinition {
  id: FontStyleId;
  label: string;
  family: string;
  /** Fallback stack used when the bundled font cannot load. */
  stack: string;
  /** SPDX license identifier. */
  license: string;
  /** Whether the family is bundled in src/assets/fonts/. */
  bundled: boolean;
}

export const FONTS: Record<FontStyleId, FontDefinition> = {
  "geometric-sans": {
    id: "geometric-sans",
    label: "Geometric Sans",
    family: "Inter",
    stack: "Inter, 'Segoe UI', system-ui, sans-serif",
    license: "OFL-1.1",
    bundled: true,
  },
  "humanist-sans": {
    id: "humanist-sans",
    label: "Humanist Sans",
    family: "Source Sans 3",
    stack: "'Source Sans 3', Inter, 'Segoe UI', sans-serif",
    license: "OFL-1.1",
    bundled: true,
  },
  serif: {
    id: "serif",
    label: "Serif",
    family: "Source Serif 4",
    stack: "'Source Serif 4', Georgia, 'Times New Roman', serif",
    license: "OFL-1.1",
    bundled: true,
  },
  monospace: {
    id: "monospace",
    label: "Monospace",
    family: "JetBrains Mono",
    stack: "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace",
    license: "OFL-1.1",
    bundled: true,
  },
  segmented: {
    id: "segmented",
    label: "Segmented",
    family: "DSEG7 Classic",
    stack: "'DSEG7 Classic', 'Courier New', monospace",
    license: "OFL-1.1",
    bundled: true,
  },
  rounded: {
    id: "rounded",
    label: "Rounded",
    family: "Nunito",
    stack: "Nunito, 'Segoe UI', system-ui, sans-serif",
    license: "OFL-1.1",
    bundled: true,
  },
  condensed: {
    id: "condensed",
    label: "Condensed",
    family: "Oswald",
    stack: "Oswald, 'Arial Narrow', system-ui, sans-serif",
    license: "OFL-1.1",
    bundled: true,
  },
};

export function fontStyleList(): FontDefinition[] {
  return Object.values(FONTS);
}

export function getFont(style: FontStyleId): FontDefinition {
  return FONTS[style];
}

/**
 * CSS @font-face declarations for all bundled families.
 * See src/assets/fonts/ for the files and THIRD_PARTY_NOTICES for licenses.
 *
 * Most families are variable fonts (single file, weight range); DSEG7 is a
 * static pair. `font-weight` ranges let the OS synthesize weights within the
 * file's design space.
 */
export function fontFacesCss(): string {
  const faces: string[] = [];
  const variable = (family: string, file: string, weightRange: string) =>
    `@font-face { font-family: '${family}'; src: url('../assets/fonts/${file}') format('truetype-variations'); font-weight: ${weightRange}; font-display: swap; }`;
  const staticFace = (family: string, file: string, weight: string) =>
    `@font-face { font-family: '${family}'; src: url('../assets/fonts/${file}') format('truetype'); font-weight: ${weight}; font-display: swap; }`;

  faces.push(variable("Inter", "inter-var.ttf", "100 900"));
  faces.push(variable("Source Sans 3", "source-sans-3-var.ttf", "200 900"));
  faces.push(variable("Source Serif 4", "source-serif-4-var.ttf", "200 900"));
  faces.push(variable("JetBrains Mono", "jetbrains-mono-var.ttf", "100 800"));
  faces.push(variable("Nunito", "nunito-var.ttf", "200 1000"));
  faces.push(variable("Oswald", "oswald-var.ttf", "200 700"));
  faces.push(staticFace("DSEG7 Classic", "dseg7-classic-regular.ttf", "400"));
  faces.push(staticFace("DSEG7 Classic", "dseg7-classic-bold.ttf", "700"));
  return faces.join("\n");
}
