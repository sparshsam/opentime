# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] — 2026-08-03

### Added

- **Clock Gallery** — browse digital, analog, and world-clock designs with live
  current-time previews, capability badges, and appearance presets.
- **7 digital designs** — Minimal Digital, Editorial, Classic LED, Flip,
  Terminal, Soft Panel, Compact.
- **6 analog designs** — Classic, Minimal, Roman, Railway, Modern,
  Numeral-Free (SVG renderers with accessible text equivalents).
- **Appearance system** — configuration-driven design registry; per-widget
  token editor for colors, opacity, scale, corner radius, shadow, alignment,
  spacing, typography, and numerals (from each design's supported fields).
- **Appearance presets** — Light, Dark, Warm, Cool, Monochrome, High Contrast,
  Transparent, Soft Glass, with contrast validation.
- **Curated typography** — geometric sans, humanist sans, serif, monospace,
  segmented, rounded, condensed; numerals (Arabic / Roman / markers-only).
- **Bundled OFL fonts** — Inter, Source Sans 3, Source Serif 4, JetBrains Mono,
  Nunito, Oswald, DSEG7 — with third-party notices; no runtime downloads.
- **Flip animation** — subtle split-flap animation that respects
  `prefers-reduced-motion`.
- **Appearance persistence** — appearance JSON patches persisted via SQLite;
  design switching preserves compatible settings and safely resets
  incompatible ones.
- **Accessibility** — keyboard access and focus states in the manager and
  gallery, screen-reader labels, contrast warnings, reduced-motion support,
  analog clocks expose an accessible text equivalent.

### Changed

- Appearance section in the manager now hosts the full per-widget token editor.
- Design application preserves compatible settings and resets incompatible ones.

### Fixed

- `modern-analog` now renders restrained markings with no numerals.
- Appearance JSON patches round-trip correctly through the persistence layer.

---

## [0.1.0] — 2026-08-03

### Added

- **Desktop clock foundation** — Minimal Digital clock widget rendered on the
  Windows desktop layer.
- **Windows desktop layer** — WorkerW reparenting places widgets above the
  wallpaper and below app windows, with an `HWND_BOTTOM` fallback. Widgets are
  excluded from the taskbar and Alt+Tab and never steal focus.
- **Shell monitor** — detects Explorer restarts and re-attaches widgets to the
  recreated desktop surface.
- **Window manager** — per-clock borderless transparent webview windows,
  restored from persistence on startup; manager window hides to tray on close.
- **Display & DPI handling** — monitor enumeration, logical-pixel position
  model, invalid-position recovery to the primary display.
- **System tray** — Add Clock, Show Manager, Lock/Unlock All, Hide/Show All,
  Quit. Closing the manager never quits OpenTime.
- **Startup integration** — HKCU Run registration with honest real-state
  reporting (never claims enabled when registration failed).
- **SQLite persistence** — versioned schema (user_version) with migrations,
  forward-looking tables for calendars/alarms/timers/reminders (unused).
- **First-run onboarding** — creates a Minimal Digital clock in the local
  timezone near the top-right, explains drag/right-click/lock, skippable.
- **Localization scaffold** — translation-ready message catalog (English
  shipped), locale-aware time/date formatting via Intl/Luxon.
- **Timezone index** — offline IANA zone list with city/country/alias search.
- **Bundled fonts** — Inter, Source Sans 3, Source Serif 4, JetBrains Mono,
  Nunito, Oswald, DSEG7 (all SIL OFL), with third-party notices.
- **Icon pipeline** — full OpenTime icon set generated from the canonical
  1024×1024 masters, wired into the Tauri bundle.

### Changed

- None (initial release).

### Fixed

- None (initial release).

### Security & privacy

- No network requests for core functionality; data stored only locally; no
  telemetry; no accounts.

---

## [0.1.0-rc.0] — 2026-08-02

### Added

- Initial OpenForge scaffold (Kovina-compliant repository structure and
  metadata) and icon asset generation.
