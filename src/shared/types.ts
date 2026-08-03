/**
 * OpenTime shared domain types.
 *
 * These types are shared between the Manager window, widget windows, and the
 * Rust persistence layer (via tauri commands). Keep them free of UI concerns.
 */

/** Stable clock design identifiers. */
export type DigitalDesignId =
  | "minimal-digital"
  | "editorial"
  | "classic-led"
  | "flip"
  | "terminal"
  | "soft-panel"
  | "compact";

export type AnalogDesignId =
  | "classic-analog"
  | "minimal-analog"
  | "roman-analog"
  | "railway-analog"
  | "modern-analog"
  | "numeral-free-analog";

export type WorldClockDesignId = "world-clock-panel";

export type DesignId = DigitalDesignId | AnalogDesignId | WorldClockDesignId;
export type DesignFamily = "digital" | "analog" | "world-clock";

/** 12-hour / 24-hour cycle. */
export type HourCycle = 12 | 24;

/** Appearance preset identifiers. */
export type AppearancePresetId =
  | "light"
  | "dark"
  | "warm"
  | "cool"
  | "monochrome"
  | "high-contrast"
  | "transparent"
  | "soft-glass";

/** Numeral / typography style identifiers. */
export type NumeralStyleId = "arabic" | "roman" | "markers-only";

export type FontStyleId =
  | "geometric-sans"
  | "humanist-sans"
  | "serif"
  | "monospace"
  | "segmented"
  | "rounded"
  | "condensed";

/**
 * Appearance configuration for a single widget. Design-independent fields;
 * each design declares which fields it supports.
 */
export interface AppearanceConfig {
  presetId: AppearancePresetId;
  primaryColor?: string;
  secondaryColor?: string;
  handColor?: string;
  markerColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  opacity: number; // 0..1
  cornerRadius: number; // px
  shadowStrength: number; // 0..1
  alignment: "start" | "center" | "end";
  spacing: number; // px
  scale: number; // 0.5..2.0
  numeralStyle: NumeralStyleId;
  fontStyle: FontStyleId;
}

/** A row in the world-clock panel design. */
export interface WorldClockRow {
  timezoneId: string;
  label: string;
  showDate: boolean;
  showUtcOffset: boolean;
  showAbbreviation: boolean;
}

/**
 * A persisted clock widget record. Mirrors the `widgets` table in SQLite.
 * Positions are stored in logical (DPI-scaled) pixels to avoid scaling drift.
 */
export interface WidgetRecord {
  id: string; // stable unique ID (uuid v4)
  widgetType: "clock";
  designId: DesignId;
  timezoneId: string; // IANA, e.g. "America/Toronto"
  label: string;
  hourCycle: HourCycle;
  showSeconds: boolean;
  showDate: boolean;
  showTimezoneLabel: boolean;
  appearance: AppearanceConfig;
  displayId: string; // monitor identifier
  logicalX: number;
  logicalY: number;
  logicalWidth: number;
  logicalHeight: number;
  scale: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  /** Rows for the world-clock-panel design (empty for other designs). */
  worldRows: WorldClockRow[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Application-level settings. Mirrors the `settings` table. */
export interface AppSettings {
  startupEnabled: boolean;
  defaultHourCycle: HourCycle;
  defaultLocale: string;
  defaultDesignId: DigitalDesignId;
  defaultPresetId: AppearancePresetId;
  managerX: number | null;
  managerY: number | null;
  managerWidth: number;
  managerHeight: number;
  allWidgetsHidden: boolean;
  launchManagerAtStartup: boolean;
  restoreHiddenWidgets: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  schemaVersion: number;
  firstRunComplete: boolean;
}

/** Describes what a design supports, shown in the gallery. */
export interface DesignCapabilities {
  seconds: boolean;
  date: boolean;
  timezoneLabel: boolean;
  background: boolean;
  animation: boolean;
}

/** A design definition in the registry. */
export interface DesignDefinition {
  id: DesignId;
  family: DesignFamily;
  name: string;
  description: string;
  capabilities: DesignCapabilities;
  /** Appearance fields this design honours. */
  supportedAppearance: (keyof AppearanceConfig)[];
}

/** A timezone result from the picker. */
export interface TimezoneEntry {
  id: string; // IANA id
  city: string;
  country: string;
  abbreviation: string; // e.g. "EDT"
  utcOffsetMinutes: number;
  /** Current local time preview, formatted in the entry's zone. */
  localTimeLabel: string;
  hasDst: boolean;
}

/** Payload returned when creating a widget. */
export interface CreateWidgetInput {
  designId: DesignId;
  timezoneId: string;
  label?: string;
  hourCycle?: HourCycle;
  showSeconds?: boolean;
  showDate?: boolean;
  showTimezoneLabel?: boolean;
  displayId?: string;
  x?: number | null;
  y?: number | null;
}

export interface UpdateWidgetInput {
  id: string;
  patch: Partial<WidgetRecord>;
}

export interface DuplicateWidgetResult {
  originalId: string;
  newId: string;
  widget: WidgetRecord;
}

/** Window surface types the frontend boots into. */
export type WindowKind = "manager" | "widget";

export interface WidgetContext {
  kind: "widget";
  widgetId: string;
}

export interface ManagerContext {
  kind: "manager";
}

export type BootContext = WidgetContext | ManagerContext;

/** System monitor information surfaced to the frontend. */
export interface MonitorInfo {
  displayId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactor: number;
  isPrimary: boolean;
}
