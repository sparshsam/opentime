/**
 * OpenTime localization.
 *
 * English is the only shipped language for v0.1.0–v0.3.0, but the architecture
 * is translation-ready: all user-facing strings flow through `t()` with a
 * message catalog, and locale-aware formatting is delegated to Intl/Luxon.
 * Adding a language = adding a catalog entry, no string-splitting.
 */

export type LocaleCode = "en";

export interface MessageCatalog {
  // App / common
  "app.name": string;
  "app.tagline": string;
  "common.add": string;
  "common.remove": string;
  "common.edit": string;
  "common.duplicate": string;
  "common.cancel": string;
  "common.save": string;
  "common.done": string;
  "common.close": string;
  "common.hidden": string;
  "common.visible": string;
  "common.locked": string;
  "common.unlocked": string;
  "common.enabled": string;
  "common.disabled": string;
  "common.confirm": string;

  // Manager navigation
  "nav.widgets": string;
  "nav.gallery": string;
  "nav.appearance": string;
  "nav.startup": string;
  "nav.general": string;

  // Widget list
  "widgets.title": string;
  "widgets.add": string;
  "widgets.empty": string;
  "widgets.edit": string;
  "widgets.show": string;
  "widgets.hide": string;
  "widgets.lock": string;
  "widgets.unlock": string;
  "widgets.duplicate": string;
  "widgets.moveToDisplay": string;
  "widgets.remove": string;
  "widgets.confirmRemove": string;
  "widgets.confirmRemoveBody": string;

  // Clock widget context menu
  "widget.menu.openSettings": string;
  "widget.menu.changeTimezone": string;
  "widget.menu.changeDesign": string;
  "widget.menu.duplicate": string;
  "widget.menu.lock": string;
  "widget.menu.unlock": string;
  "widget.menu.showSeconds": string;
  "widget.menu.showDate": string;
  "widget.menu.moveToDisplay": string;
  "widget.menu.hide": string;
  "widget.menu.remove": string;

  // Tray
  "tray.tooltip": string;
  "tray.addClock": string;
  "tray.showManager": string;
  "tray.lockAll": string;
  "tray.unlockAll": string;
  "tray.hideAll": string;
  "tray.showAll": string;
  "tray.startWithWindows": string;
  "tray.quit": string;

  // Startup
  "startup.title": string;
  "startup.startWithWindows": string;
  "startup.launchManagerAtStartup": string;
  "startup.restoreHiddenWidgets": string;
  "startup.status": string;
  "startup.statusEnabled": string;
  "startup.statusDisabled": string;
  "startup.statusFailed": string;

  // Gallery
  "gallery.title": string;
  "gallery.digital": string;
  "gallery.analog": string;
  "gallery.worldClock": string;
  "gallery.apply": string;
  "gallery.currentTime": string;
  "gallery.supportsSeconds": string;
  "gallery.supportsDate": string;
  "gallery.supportsTimezoneLabel": string;
  "gallery.supportsBackground": string;
  "gallery.supportsAnimation": string;

  // Appearance
  "appearance.title": string;
  "appearance.defaultPreset": string;
  "appearance.defaultNumeral": string;
  "appearance.defaultHourCycle": string;
  "appearance.reducedMotion": string;
  "appearance.highContrast": string;

  // General
  "general.title": string;
  "general.language": string;
  "general.regionalFormatting": string;
  "general.firstRun": string;
  "general.resetWidgetPositions": string;
  "general.exportDiagnostics": string;
  "general.about": string;
  "general.version": string;

  // First-run
  "onboarding.welcome": string;
  "onboarding.explanation": string;
  "onboarding.startWithWindows": string;
  "onboarding.clockCreated": string;
  "onboarding.dragHint": string;
  "onboarding.rightClickHint": string;
  "onboarding.lockHint": string;
  "onboarding.skip": string;
  "onboarding.finish": string;

  // World clocks
  "worldclock.panelTitle": string;
  "worldclock.timezonePicker": string;
  "worldclock.search": string;
  "worldclock.city": string;
  "worldclock.country": string;
  "worldclock.abbreviation": string;
  "worldclock.utcOffset": string;
  "worldclock.customLabel": string;
  "worldclock.dayAhead": string;
  "worldclock.dayBehind": string;
  "worldclock.sameDay": string;
}

const EN: MessageCatalog = {
  "app.name": "OpenTime",
  "app.tagline": "Time, kept beautifully.",
  "common.add": "Add",
  "common.remove": "Remove",
  "common.edit": "Edit",
  "common.duplicate": "Duplicate",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.done": "Done",
  "common.close": "Close",
  "common.hidden": "Hidden",
  "common.visible": "Visible",
  "common.locked": "Locked",
  "common.unlocked": "Unlocked",
  "common.enabled": "Enabled",
  "common.disabled": "Disabled",
  "common.confirm": "Confirm",

  "nav.widgets": "Widgets",
  "nav.gallery": "Clock Gallery",
  "nav.appearance": "Appearance",
  "nav.startup": "Startup",
  "nav.general": "General",

  "widgets.title": "Clocks",
  "widgets.add": "Add Clock",
  "widgets.empty": "No clocks yet. Add your first clock.",
  "widgets.edit": "Edit",
  "widgets.show": "Show",
  "widgets.hide": "Hide",
  "widgets.lock": "Lock",
  "widgets.unlock": "Unlock",
  "widgets.duplicate": "Duplicate",
  "widgets.moveToDisplay": "Move to Display",
  "widgets.remove": "Remove",
  "widgets.confirmRemove": "Remove this clock?",
  "widgets.confirmRemoveBody":
    "This removes the widget. This action cannot be undone.",

  "widget.menu.openSettings": "Open Settings",
  "widget.menu.changeTimezone": "Change Timezone",
  "widget.menu.changeDesign": "Change Design",
  "widget.menu.duplicate": "Duplicate",
  "widget.menu.lock": "Lock Position",
  "widget.menu.unlock": "Unlock Position",
  "widget.menu.showSeconds": "Show Seconds",
  "widget.menu.showDate": "Show Date",
  "widget.menu.moveToDisplay": "Move to Display",
  "widget.menu.hide": "Hide Widget",
  "widget.menu.remove": "Remove Widget",

  "tray.tooltip": "OpenTime",
  "tray.addClock": "Add Clock",
  "tray.showManager": "Show OpenTime Manager",
  "tray.lockAll": "Lock All Widgets",
  "tray.unlockAll": "Unlock All Widgets",
  "tray.hideAll": "Hide All Widgets",
  "tray.showAll": "Show All Widgets",
  "tray.startWithWindows": "Start with Windows",
  "tray.quit": "Quit OpenTime",

  "startup.title": "Startup",
  "startup.startWithWindows": "Start OpenTime when I sign in to Windows",
  "startup.launchManagerAtStartup": "Open the manager at startup",
  "startup.restoreHiddenWidgets": "Restore hidden widgets at startup",
  "startup.status": "Startup status",
  "startup.statusEnabled": "Registered — OpenTime starts at sign-in.",
  "startup.statusDisabled": "Not registered.",
  "startup.statusFailed": "Registration failed. See diagnostics.",

  "gallery.title": "Clock Gallery",
  "gallery.digital": "Digital",
  "gallery.analog": "Analog",
  "gallery.worldClock": "World Clock",
  "gallery.apply": "Apply Design",
  "gallery.currentTime": "Current time preview",
  "gallery.supportsSeconds": "Seconds",
  "gallery.supportsDate": "Date",
  "gallery.supportsTimezoneLabel": "Timezone label",
  "gallery.supportsBackground": "Background",
  "gallery.supportsAnimation": "Animation",

  "appearance.title": "Appearance",
  "appearance.defaultPreset": "Default preset",
  "appearance.defaultNumeral": "Default numeral style",
  "appearance.defaultHourCycle": "Default hour cycle",
  "appearance.reducedMotion": "Reduce motion",
  "appearance.highContrast": "High contrast",

  "general.title": "General",
  "general.language": "Language",
  "general.regionalFormatting": "Regional formatting",
  "general.firstRun": "First-run behaviour",
  "general.resetWidgetPositions": "Reset widget positions",
  "general.exportDiagnostics": "Export diagnostics",
  "general.about": "About OpenTime",
  "general.version": "Version",

  "onboarding.welcome": "Welcome to OpenTime",
  "onboarding.explanation":
    "OpenTime places clocks directly on your desktop — above the wallpaper, below your apps. Calm, private, and entirely local.",
  "onboarding.startWithWindows": "Start OpenTime when I sign in to Windows",
  "onboarding.clockCreated":
    "A clock has been added near the top-right of your display.",
  "onboarding.dragHint": "Drag it to move it.",
  "onboarding.rightClickHint": "Right-click it to configure it.",
  "onboarding.lockHint": "Lock it when you’re happy with its position.",
  "onboarding.skip": "Skip",
  "onboarding.finish": "Finish",

  "worldclock.panelTitle": "World Clock Panel",
  "worldclock.timezonePicker": "Add a timezone",
  "worldclock.search": "Search city, country, or timezone…",
  "worldclock.city": "City",
  "worldclock.country": "Country",
  "worldclock.abbreviation": "Abbreviation",
  "worldclock.utcOffset": "UTC offset",
  "worldclock.customLabel": "Custom label",
  "worldclock.dayAhead": "next day",
  "worldclock.dayBehind": "previous day",
  "worldclock.sameDay": "same day",
};

const CATALOGS: Record<LocaleCode, MessageCatalog> = { en: EN };

/** Translate a key in the active locale. Falls back to English. */
export function t(
  key: keyof MessageCatalog,
  locale: LocaleCode = "en",
): string {
  return CATALOGS[locale]?.[key] ?? EN[key] ?? String(key);
}

/** The active application locale (defaults to "en"). */
export function getLocale(): LocaleCode {
  return "en";
}

/** All supported locale codes. */
export function supportedLocales(): LocaleCode[] {
  return Object.keys(CATALOGS) as LocaleCode[];
}
