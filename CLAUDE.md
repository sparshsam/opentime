# OpenTime — Agent Notes

> Calm, privacy-first desktop time companion. Clocks, world clocks, and more.
> **Version:** 0.3.0 — Experimental

**Brand:** Kovina ecosystem (Open* product family)
**Repo:** github.com/Kovina/opentime

## Key Files

- `PRIVACY.md` — Privacy policy and data practices
- `AGENTS.md` — Agent operating notes (architecture invariants, commands, release)
- `docs/ROADMAP.md` — Development roadmap
- `docs/architecture/README.md` — Architecture overview
- `docs/architecture/desktop-layer.md` — Windows desktop-layer strategy
- `docs/architecture/timezones.md` — Timezone handling
- `docs/architecture/widget-lifecycle.md` — Widget lifecycle
- `docs/DESIGN_NOTES.md` — Architecture decisions and design rationale
- `docs/DATA.md` — Persistence schema
- `docs/qa/windows-manual-validation.md` — Windows manual validation checklist
- `docs/TROUBLESHOOTING.md` — Troubleshooting guide
- `docs/RELEASE_CHECKLIST.md` — Release process checklist
- `BRAND_NOTES.md` — Brand identity documentation
- `assets/design-tokens.css` — Design tokens and visual foundation

## Tech Stack

- **Framework:** Tauri 2
- **Frontend:** React 18 + TypeScript + Vite
- **Native:** Rust (desktop layer, display/DPI, tray, startup, SQLite)
- **Storage:** SQLite via rusqlite (WAL), versioned migrations
- **Time:** Luxon + Intl (IANA timezones)
- **Category:** Utilities · **Primary Platform:** desktop

## Quick Start

```bash
npm install
npm run tauri dev
npm run tauri build
```

## Tests

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint (flat config)
npm test            # Vitest (unit + component)
cargo test --manifest-path src-tauri/Cargo.toml   # Rust unit tests
```

## Project Structure

```
opentime/
├── src/                 # React frontend
│   ├── app/             # window boot context resolution
│   ├── manager/         # Manager UI (widgets, gallery, appearance, startup)
│   ├── widgets/clock/   # widget shell + clock renderers
│   ├── designs/         # configuration-driven design registry
│   ├── timezone/        # offline IANA search + entries
│   ├── persistence/     # typed command wrappers
│   ├── localization/    # translation-ready message catalog
│   └── shared/          # types, time utils, scheduler, presets, fonts
├── src-tauri/           # Rust
│   └── src/
│       ├── desktop_layer/     # WorkerW reparent + HWND_BOTTOM fallback
│       ├── window_manager/    # widget/manager window lifecycle
│       ├── display_manager/   # monitor enumeration, DPI, position
│       ├── startup/           # HKCU Run sign-in registration
│       ├── shell_monitor/     # Explorer-restart recovery
│       ├── persistence/       # SQLite + migrations + queries
│       ├── commands/          # narrow validated command surface
│       └── manager/           # tray
├── assets/              # brand + platform icon assets
├── docs/                # documentation
└── .kovina/             # Kovina project metadata
```

## Kovina Standards

Before making design or architecture decisions, read the Kovina standards
(the canonical copy lives in the `kovina` repo, not here):

- `standards/foundational/BRAND_GUIDELINES.md`
- `standards/foundational/DESIGN_PLAYBOOK.md`
- `standards/shared/APP_ICON_STANDARD.md`
- `standards/platforms/WINDOWS_APP_STANDARD.md`

Do not modify canonical Kovina standards from inside this repository.

## Design Constraints

- Kovina design philosophy — built to be owned, understood, and kept
- Local-first by default — no data collection without user consent
- Calm, unobtrusive, offline-capable; no account, no telemetry, no ads
- Designs are configuration-driven (registry + appearance tokens), never
  per-colour components
- Fonts are bundled and OFL-licensed; no runtime downloads

## Architecture Invariants

1. Windows logic is isolated behind `#[cfg(windows)]` gates.
2. Persistence (SQLite) is the source of truth; windows are views over it.
3. Timezone identities are always IANA ids, never bare offsets.
4. One coordinated time source (`shared/scheduler.ts`), no per-clock timers.
5. Narrow validated command surface; no arbitrary shell execution.

See [docs/architecture/README.md](docs/architecture/README.md) and
[docs/DESIGN_NOTES.md](docs/DESIGN_NOTES.md) for details.

---

*This project is part of the [Kovina](https://kovina.org) ecosystem.*
