/**
 * OpenTime design registry.
 *
 * Designs are configuration-driven: each entry is metadata + a renderer
 * component. Color variations are NOT separate components — they come from the
 * AppearanceConfig tokens. This keeps the gallery and per-widget config small
 * and lets users switch designs while preserving compatible settings.
 */

import type {
  DesignDefinition,
  DesignFamily,
  DesignId,
  DigitalDesignId,
} from "@/shared/types";

export interface DesignRegistration extends DesignDefinition {
  /** Renderer component key — resolved by the widget layer. */
  component: string;
}

export const DIGITAL_DESIGNS: DesignRegistration[] = [
  {
    id: "minimal-digital",
    family: "digital",
    name: "Minimal Digital",
    description: "Clean, highly legible, no unnecessary decoration.",
    component: "MinimalDigital",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "alignment",
      "spacing",
      "scale",
      "fontStyle",
    ],
  },
  {
    id: "editorial",
    family: "digital",
    name: "Editorial",
    description: "Large time with secondary date and location typography.",
    component: "Editorial",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "alignment",
      "scale",
      "fontStyle",
      "cornerRadius",
    ],
  },
  {
    id: "classic-led",
    family: "digital",
    name: "Classic LED",
    description: "Segmented display inspired by traditional digital clocks.",
    component: "ClassicLed",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: false,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "scale",
      "fontStyle",
    ],
  },
  {
    id: "flip",
    family: "digital",
    name: "Flip",
    description: "Split-flap / flip-clock inspired presentation.",
    component: "Flip",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: false,
      background: true,
      animation: true,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "scale",
      "fontStyle",
    ],
  },
  {
    id: "terminal",
    family: "digital",
    name: "Terminal",
    description: "Monospaced and technical, but still polished.",
    component: "Terminal",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "scale",
      "fontStyle",
    ],
  },
  {
    id: "soft-panel",
    family: "digital",
    name: "Soft Panel",
    description: "Rounded background panel for visually busy wallpapers.",
    component: "SoftPanel",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "borderColor",
      "opacity",
      "cornerRadius",
      "shadowStrength",
      "scale",
      "fontStyle",
    ],
  },
  {
    id: "compact",
    family: "digital",
    name: "Compact",
    description: "Small footprint for secondary timezone clocks.",
    component: "Compact",
    capabilities: {
      seconds: false,
      date: true,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "scale",
      "fontStyle",
    ],
  },
];

export const ANALOG_DESIGNS: DesignRegistration[] = [
  {
    id: "classic-analog",
    family: "analog",
    name: "Classic",
    description: "Traditional clock face with numerals.",
    component: "ClassicAnalog",
    capabilities: {
      seconds: true,
      date: false,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "handColor",
      "markerColor",
      "backgroundColor",
      "borderColor",
      "opacity",
      "scale",
      "numeralStyle",
    ],
  },
  {
    id: "minimal-analog",
    family: "analog",
    name: "Minimal",
    description: "Hour markers with minimal or no numerals.",
    component: "MinimalAnalog",
    capabilities: {
      seconds: true,
      date: false,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "handColor",
      "markerColor",
      "backgroundColor",
      "opacity",
      "scale",
      "numeralStyle",
    ],
  },
  {
    id: "roman-analog",
    family: "analog",
    name: "Roman",
    description: "Roman numerals with traditional proportions.",
    component: "RomanAnalog",
    capabilities: {
      seconds: true,
      date: false,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "handColor",
      "markerColor",
      "backgroundColor",
      "borderColor",
      "opacity",
      "scale",
    ],
  },
  {
    id: "railway-analog",
    family: "analog",
    name: "Railway",
    description: "High-contrast station-clock presentation.",
    component: "RailwayAnalog",
    capabilities: {
      seconds: true,
      date: false,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "handColor",
      "markerColor",
      "backgroundColor",
      "opacity",
      "scale",
    ],
  },
  {
    id: "modern-analog",
    family: "analog",
    name: "Modern",
    description: "Fine hands and restrained markings.",
    component: "ModernAnalog",
    capabilities: {
      seconds: true,
      date: false,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "handColor",
      "markerColor",
      "backgroundColor",
      "opacity",
      "scale",
    ],
  },
  {
    id: "numeral-free-analog",
    family: "analog",
    name: "Numeral-Free",
    description: "Hands and markers only.",
    component: "NumeralFreeAnalog",
    capabilities: {
      seconds: true,
      date: false,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "handColor",
      "markerColor",
      "backgroundColor",
      "opacity",
      "scale",
    ],
  },
];

export const WORLD_CLOCK_DESIGNS: DesignRegistration[] = [
  {
    id: "world-clock-panel",
    family: "world-clock",
    name: "World Clock Panel",
    description: "Grouped multi-timezone panel with day-change indicators.",
    component: "WorldClockPanel",
    capabilities: {
      seconds: true,
      date: true,
      timezoneLabel: true,
      background: true,
      animation: false,
    },
    supportedAppearance: [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "opacity",
      "cornerRadius",
      "scale",
      "fontStyle",
      "spacing",
    ],
  },
];

export const ALL_DESIGNS: DesignRegistration[] = [
  ...DIGITAL_DESIGNS,
  ...ANALOG_DESIGNS,
  ...WORLD_CLOCK_DESIGNS,
];

const DESIGN_MAP = new Map<DesignId, DesignRegistration>(
  ALL_DESIGNS.map((d) => [d.id, d]),
);

export function getDesign(id: DesignId): DesignRegistration {
  return DESIGN_MAP.get(id) ?? DIGITAL_DESIGNS[0];
}

export function designsByFamily(family: DesignFamily): DesignRegistration[] {
  return ALL_DESIGNS.filter((d) => d.family === family);
}

/** Default digital design (used for the very first clock). */
export const DEFAULT_DESIGN: DigitalDesignId = "minimal-digital";

/** Whether a design supports the given capability. */
export function designSupports(
  id: DesignId,
  capability: keyof DesignRegistration["capabilities"],
): boolean {
  return getDesign(id).capabilities[capability];
}
