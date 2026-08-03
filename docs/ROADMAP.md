# Roadmap

> Development roadmap for OpenTime.

## Completed

### v0.1.0 — Desktop Clock Foundation (2026-08-03)

- Minimal Digital clock on the Windows desktop layer (WorkerW reparent +
  HWND_BOTTOM fallback)
- System tray, sign-in startup, SQLite persistence, first-run onboarding,
  Explorer-restart recovery, mixed-DPI handling

### v0.2.0 — Clock Gallery (2026-08-03)

- 7 digital + 6 analog designs + world-clock panel
- Configuration-driven appearance system with presets and contrast validation
- Curated typography, bundled OFL fonts

### v0.3.0 — World Clocks (2026-08-03)

- Unlimited independent clocks with per-widget timezone/design/appearance
- Searchable offline IANA timezone picker
- World Clock Panel with day-change indicators
- IANA-only persistence; DST/half/quarter-hour correctness

## In Progress

- Windows packaging (MSIX/NSIS) and on-Windows manual validation — requires a
  Windows host.

## Planned

- Calendars
- Alarms
- Timers
- Reminders
- Stopwatch
- Weather
- macOS support
- Linux support

## Ideas

- Cloud sync (explicitly non-goal for v0.1–v0.3)
- External calendar integrations (Google Calendar, Outlook)

## Explicit Non-Goals (v0.1.0 – v0.3.0)

The following are intentionally NOT implemented in these versions: calendar
widgets, alarms, reminders, stopwatch, timers, weather, cloud sync, accounts,
authentication, online timezone APIs, online font downloads, external calendar
integrations, mobile apps, macOS/Linux support, plugin systems, scripting,
natural-language commands, AI functionality, and an always-on-top mode (unless
added later as a clearly separate optional capability).

---

*This document is a living roadmap — update it as priorities evolve.*
