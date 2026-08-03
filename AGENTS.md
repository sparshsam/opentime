# OpenTime — Agent Notes

> Part of the [Kovina](https://kovina.org) ecosystem.
> **Version:** 0.3.0 — Experimental

## Before Coding

Read [CLAUDE.md](CLAUDE.md) before making any changes. It contains the full project
context, design constraints, architecture decisions, and operating procedures.

Read the Kovina standards and design philosophy before making design decisions:
- **Brand Standards:** `BRAND_NOTES.md`
- **Design Tokens:** `assets/design-tokens.css`
- **Design Playbook:** https://kovina.org/design

## Project Identity

- **Project:** OpenTime (OpenTime)
- **Repo:** opentime
- **Author:** Kovina
- **Category:** Utilities
- **Primary Platform:** desktop
- **App Type:** Desktop App
- **Profile:** desktop
- **License:** AGPL-3.0

## Description

Calm, privacy-first desktop time companion. Clocks, world clocks, and more.

OpenTime is a calm, privacy-first, local-first desktop time companion. It places clock widgets directly on the Windows desktop. Future versions will add calendars, alarms, timers, and reminders.

## Key Files

- `CLAUDE.md` — Full project context and operating instructions
- `PRIVACY.md` — Privacy policy and data practices
- `docs/ROADMAP.md` — Development roadmap
- `docs/DESIGN_NOTES.md` — Architecture decisions and design rationale
- `docs/RELEASE_CHECKLIST.md` — Release process checklist
- `BRAND_NOTES.md` — Brand identity documentation
- `assets/design-tokens.css` — Design tokens and visual foundation

## Principles

1. Read CLAUDE.md before making changes.
2. Follow Kovina design philosophy — built to be owned, understood, and kept.
3. Update documentation as you go.
4. Keep the changelog current.
5. Respect the privacy pledge — no telemetry, no data collection without consent.

## Project-Specific Agent Instructions

### Architecture invariants

1. **Windows logic stays isolated.** Everything Win32-specific lives in
   `desktop_layer`, `display_manager`, and `startup` behind `#[cfg(windows)]`
   gates. Never put native shell logic inside a React component.
2. **Persistence is the source of truth.** Widget windows are disposable views
   over SQLite. Recreate windows from records; don't hold widget state only in
   the frontend.
3. **IANA zones only.** Timezone identities are always IANA ids. Never persist
   a bare UTC offset as a zone.
4. **Coordinated time.** Use `shared/scheduler.ts` — one tick source per
   window. No per-clock timers.
5. **Designs are configuration.** New designs are registry entries plus a small
   renderer branch — never a component per colour.

### Commands

- Validate all inputs in Rust (`valid_timezone`, `valid_design`, dimension
  ranges).
- Keep the command surface narrow; no arbitrary shell execution.

### Tests

- Frontend: `npm test` (Vitest). Add timezone-correctness tests when touching
  time logic.
- Rust: `cargo test --manifest-path src-tauri/Cargo.toml`. The persistence
  suite covers migrations, CRUD, and appearance patches.

### Release

- Bump version in `package.json`, `src-tauri/Cargo.toml`,
  `src-tauri/tauri.conf.json`, `.kovina/project.json`.
- Update `CHANGELOG.md` once per release.
- The MSIX/NSIS bundle and Windows manual validation require a Windows host.

---

*This file is part of the OpenTime project — Calm, privacy-first desktop time companion. Clocks, world clocks, and more.*
