# Changelog

All notable changes to this project will be documented in this file.

## [0.3.1] — 2026-08-05

### Added

- **Duplicate-process prevention** — a second OpenTime launch focuses the
  existing instance instead of spawning a parallel process.
- **Sleep/resume correction** — clocks re-read the real clock immediately when
  the machine wakes (focus / visibilitychange hooks), instead of waiting for
  the next tick.
- **DPI-aware window icons** — the title bar and taskbar icons are loaded at
  the physical pixel size the current display needs (`GetDpiForWindow`), with
  `ICON_SMALL` + `ICON_SMALL2` + `ICON_BIG` all set. Fixes blurry icons at
  125–200% scaling. The bundled `icon.ico` now contains all 7 frames
  (16–256), including the previously-missing 96×96.
- **Windows build runbook** — `docs/qa/windows-build-runbook.md` with exact
  commands to install tooling, build the NSIS/MSIX bundles, install, and run
  the full interactive validation (27 checks) with a results template.

### Changed

- Single-instance plugin wired into the app builder.
- Widget and manager windows restore a DPI-correct icon at creation.

### Fixed

- `icon.ico` was missing the 96×96 frame (the blur-at-scale root cause);
  replaced with the full 7-frame set.
- No functional regressions; 73 frontend + 16 Rust tests pass.

---

## [0.3.0] — 2026-08-03

### Added

- **Multiple independent clocks** — create any number of clock widgets, each
  with its own timezone, design, appearance, hour cycle, seconds/date settings,
  display placement, size, lock, and visibility.
- **Searchable offline timezone picker** — city, country, IANA id, and alias
  search; shows abbreviation, UTC offset, and a live local-time preview; fully
  keyboard navigable.
- **Custom labels** — replace generated location labels with your own
  ("Home", "London Office", "New York Market").
- **World Clock Panel design** — grouped multi-timezone rows with custom
  ordering (drag or up/down), date/offset/abbreviation toggles, and a clear,
  accessible day-change indicator (+1 / −1).
- **IANA-only persistence** — timezone identities are always IANA ids; never a
  bare UTC offset.
- **Timezone correctness** — verified DST spring/fall transitions, zones
  without DST, half-hour (+5:30) and quarter-hour (+5:45, +12:45) offsets,
  midnight day changes, and leap years.
- **Performance safeguard** — the manager warns when many clocks are updating
  every second.
- **Coordinated time source** — one shared scheduler per window; clocks without
  seconds idle at one wake per minute.

### Changed

- Timezone picker previews respect each widget's hour cycle.
- Design switching in the gallery preserves compatible settings and safely
  resets incompatible ones.

### Fixed

- None (incremental capability release).

---

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
