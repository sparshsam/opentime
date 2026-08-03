# Changelog

All notable changes to this project will be documented in this file.

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
