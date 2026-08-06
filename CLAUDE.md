# Project Standards

This project follows the Kovina ecosystem standards at:
https://github.com/sparshsam/kovina/tree/main/standards

Required reading before every session:
- KOVINA_MANIFESTO.md
- BRAND_GUIDELINES.md
- DESIGN_PLAYBOOK.md
- PRODUCT_ARCHITECTURE_PLAYBOOK.md

---

# OpenTime — Agent Notes

> Calm, privacy-first desktop time companion. Clocks, world clocks, and more.
> **Version:** 0.3.2 — Experimental (tags: v0.1.0, v0.2.0, v0.3.0, v0.3.1, v0.3.2)
> **Lifecycle:** Experimental (Windows build verified; manual desktop validation pending)

**Brand:** Kovina ecosystem (Open* product family)
**Repo:** https://github.com/sparshsam/opentime — **public, live on GitHub**

## Current Status

**v0.3.2 is the current release**, pushed to GitHub (main + all tags). Three
feature releases (foundation, gallery, world clocks) plus two hardening
releases are complete, committed, and tagged:

- **v0.1.0** — Desktop Clock Foundation (WorkerW desktop layer, tray, startup,
  SQLite, Minimal Digital clock, onboarding)
- **v0.2.0** — Clock Gallery (7 digital + 6 analog designs, appearance system,
  presets, bundled OFL fonts)
- **v0.3.0** — World Clocks (unlimited independent clocks, offline IANA
  timezone picker, World Clock Panel)
- **v0.3.1** — hardening (single-instance, sleep/resume, DPI-aware icons)
- **v0.3.2** — **native Windows build verified** (see below)

### Where the project stands

- **Live on GitHub.** `sparshsam/opentime` is public with `main` + all five
  tags pushed. CI (`ci.yml`) runs on push/PR: Linux fast checks + Windows MSVC
  full validation with installer build. A `release.yml` builds NSIS/MSI and
  attaches them to a GitHub Release on `v*` tags.
- **Kovina-standards compliant** (structure + docs). Closed in v0.3.2-era
  commits: `SUPPORT.md`, `scripts/` (generate-icons, build, test, lint),
  `docs/Architecture.md` / `Development.md` / `Deployment.md`, CLAUDE.md
  `# Project Standards` block, README showroom structure (hero/gallery pending
  real screenshots).
- **Code is production-quality for the shipped scope.** 73 frontend tests + 26
  Rust tests (Linux) / 31 Rust tests (Windows MSVC) pass; typecheck, lint,
  prettier, prod build all green.
- **Windows build is verified.** The Windows MSVC release binary and both
  installer packages (NSIS `.exe`, WiX `.msi`) build successfully via WSL
  interop. Installers are staged (gitignored) at `releases/windows/`.
- **Manual Windows desktop validation is still pending** — the interactive
  behaviour (taskbar, Alt+Tab, Explorer restart, sleep/resume, DPI visuals)
  needs a human on a real Windows desktop. See
  `docs/qa/validation-results-v0.3.2.md` and
  `docs/qa/windows-manual-validation.md`.
- **Roadmap (not implemented):** calendars, alarms, timers, reminders — schema
  tables already reserved in migrations. See `docs/ROADMAP.md`.

## Key Files

- `PRIVACY.md` — Privacy policy and data practices
- `AGENTS.md` — Agent operating notes (invariants, Windows build, release)
- `docs/INSTALL.md` — Exact install / launch / update / uninstall commands
- `docs/ROADMAP.md` — Development roadmap + explicit non-goals
- `docs/architecture/README.md` — Architecture overview
- `docs/architecture/desktop-layer.md` — Windows desktop-layer strategy
- `docs/architecture/timezones.md` — Timezone handling
- `docs/architecture/widget-lifecycle.md` — Widget lifecycle
- `docs/DESIGN_NOTES.md` — Architecture decisions and design rationale
- `docs/DATA.md` — Persistence schema
- `docs/qa/windows-build-runbook.md` — How to build Windows installers + tooling
- `docs/qa/validation-results-v0.3.2.md` — Verified build results + short manual checklist
- `docs/qa/windows-manual-validation.md` — Full Windows manual validation checklist
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

Expected: **73 frontend tests** (9 files), **26 Rust tests** on Linux,
**31 Rust tests** on Windows MSVC (the `cfg(windows)` icon/startup/registry
tests only compile on Windows).

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
│   └── shared/          # types, time utils, scheduler, presets, fonts, resume
├── src-tauri/           # Rust
│   └── src/
│       ├── desktop_layer/     # WorkerW reparent + HWND_BOTTOM fallback + DPI icons
│       ├── window_manager/    # widget/manager window lifecycle
│       ├── display_manager/   # monitor enumeration, DPI, position
│       ├── startup/           # HKCU Run sign-in registration
│       ├── shell_monitor/     # Explorer-restart recovery
│       ├── persistence/       # SQLite + migrations + queries
│       ├── commands/          # narrow validated command surface (+ config_tests)
│       └── manager/           # tray
├── assets/              # brand + platform icon assets
├── releases/windows/    # built installers (gitignored, not committed)
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

## Building for Windows (verified via WSL interop)

The Windows MSVC toolchain is installed on this machine and Tauri can build
Windows binaries from WSL. Verified facts (see
`docs/qa/windows-build-runbook.md`):

- **Copy the repo to a `C:\` path first.** MSVC cannot compile from a
  `\\wsl.localhost\...` UNC path. Use e.g.
  `/mnt/c/Users/spars/opentime-build/`.
- Toolchain present: rustc 1.96 MSVC, VS 2022 Build Tools (14.44), Windows SDK,
  WebView2, Tauri CLI 2.11.4. NSIS + WiX are auto-downloaded by the bundler.
- Build both installers:
  ```powershell
  cd C:\Users\spars\opentime-build
  npm run tauri build -- --bundles nsis,msi
  ```
- Outputs: `bundle\nsis\OpenTime_<ver>_x64-setup.exe` and
  `bundle\msi\OpenTime_<ver>_x64_en-US.msi`.
- Stage finished artifacts into the repo's `releases/windows/` (gitignored).

### windows-sys 0.59 gotchas (found the hard way in v0.3.2)

- `WPARAM`/`LPARAM` are **type aliases** (`usize`/`isize`), not tuple structs —
  no `WPARAM(x)` constructor.
- `FindWindowW` takes a `PCWSTR` (single `*const u16`), **not** a slice.
- `IsWindow` returns `BOOL` (`i32`), compare `!= 0`, not `bool`.
- `MONITORINFOF_PRIMARY` lives in `Win32::UI::WindowsAndMessaging`, not `Gdi`.
- `Win32_System_Registry` must be listed in the `windows-sys` cargo features or
  the Registry module is configured out.
- The Windows-side `cargo test` run (via interop) is the only way to catch
  errors in `#[cfg(windows)]` code — always run it after touching Windows code.

---

*This project is part of the [Kovina](https://kovina.org) ecosystem.*
