# OpenTime — Agent Notes

> Part of the [Kovina](https://kovina.org) ecosystem.
> **Version:** 0.3.2 — Experimental (tags: v0.1.0, v0.2.0, v0.3.0, v0.3.1, v0.3.2)

## Before Coding

Read [CLAUDE.md](CLAUDE.md) before making any changes. It contains the full project
context, design constraints, architecture decisions, current status, and
operating procedures.

Read the Kovina standards and design philosophy before making design decisions:
- **Brand Standards:** `BRAND_NOTES.md`
- **Design Tokens:** `assets/design-tokens.css`
- **Design Playbook:** https://kovina.org/design

## Project Identity

- **Project:** OpenTime
- **Repo:** opentime
- **Author:** Kovina
- **Category:** Utilities
- **Primary Platform:** desktop
- **App Type:** Desktop App
- **Profile:** desktop
- **License:** AGPL-3.0

## Description

Calm, privacy-first desktop time companion. Clocks, world clocks, and more.

OpenTime is a calm, privacy-first, local-first desktop time companion. It places
clock widgets directly on the Windows desktop. It ships clocks, a gallery of
digital/analog designs, and offline world-clock support. Calendars, alarms,
timers, and reminders are roadmap-only (schema reserved, not implemented).

## Where the project stands

- **Live on GitHub:** public repo at `sparshsam/opentime`, `main` + all five
  tags pushed. CI (`ci.yml`) validates on push/PR (Linux fast checks + Windows
  MSVC full validation with installer build); `release.yml` builds NSIS/MSI and
  attaches them to a GitHub Release on `v*` tags.
- **Kovina-standards compliant** (structure + docs): `SUPPORT.md`, `scripts/`
  (generate-icons, build, test, lint), `docs/Architecture.md` /
  `Development.md` / `Deployment.md`, CLAUDE.md `# Project Standards` block,
  README showroom structure. README's "Part of the Kovina Collection" section
  links the ecosystem apps to their repos.
- **Shipped & tagged:** v0.1.0 (foundation) → v0.2.0 (gallery) → v0.3.0 (world
  clocks) → v0.3.1 (hardening) → v0.3.2 (native Windows build verified).
- **All automated checks green:** 73 frontend tests, 26 Rust tests on Linux,
  31 Rust tests on Windows MSVC, typecheck, lint, prettier, prod build.
- **Windows build verified via WSL interop:** MSVC release binary + NSIS `.exe`
  + WiX `.msi` all build. Installers staged (gitignored) at `releases/windows/`.
- **Manual Windows desktop validation is the one remaining open item.** It
  needs a human on a real Windows desktop (taskbar, Alt+Tab, Explorer restart,
  sleep/resume, DPI visuals). The checklist is in
  `docs/qa/validation-results-v0.3.2.md` and
  `docs/qa/windows-manual-validation.md`. Screenshots for the README hero and
  gallery are captured during that pass.

## Key Files

- `CLAUDE.md` — Full project context, current status, Windows build facts
- `PRIVACY.md` — Privacy policy and data practices
- `docs/INSTALL.md` — Install / launch / update / uninstall commands
- `docs/ROADMAP.md` — Roadmap + explicit non-goals
- `docs/architecture/README.md` — Architecture overview
- `docs/architecture/desktop-layer.md` — Windows desktop-layer strategy
- `docs/architecture/timezones.md` — Timezone handling
- `docs/architecture/widget-lifecycle.md` — Widget lifecycle
- `docs/DESIGN_NOTES.md` — Architecture decisions and design rationale
- `docs/DATA.md` — Persistence schema
- `docs/qa/windows-build-runbook.md` — Windows build + tooling instructions
- `docs/qa/validation-results-v0.3.2.md` — Verified results + short manual checklist
- `docs/qa/windows-manual-validation.md` — Full manual validation checklist
- `docs/RELEASE_CHECKLIST.md` — Release process checklist
- `BRAND_NOTES.md` — Brand identity documentation
- `assets/design-tokens.css` — Design tokens and visual foundation

## Principles

1. Read CLAUDE.md before making changes.
2. Follow Kovina design philosophy — built to be owned, understood, and kept.
3. Update documentation as you go.
4. Keep the changelog current.
5. Respect the privacy pledge — no telemetry, no data collection without consent.
6. Never claim Windows behaviour is validated just because code builds — the
   interactive desktop-layer checks are still manual.

## Architecture Invariants

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

## Commands

- Validate all inputs in Rust (`valid_timezone`, `valid_design`, dimension
  ranges).
- Keep the command surface narrow; no arbitrary shell execution.
- `config_tests.rs` verifies version/identifier/icons/installer config — keep
  it in sync when bumping versions or changing `tauri.conf.json`.

## Tests

- Frontend: `npm test` (Vitest). Add timezone-correctness tests when touching
  time logic.
- Rust (Linux): `cargo test --manifest-path src-tauri/Cargo.toml`.
- **Rust (Windows MSVC):** run `cargo test` via WSL interop from the Windows
  copy of the repo. This is the only way to compile-check `#[cfg(windows)]`
  code (icon sizing, desktop layer, registry). Always do this after touching
  Windows code — Linux `cargo check` will not catch Windows-only errors.

## Windows build (from this WSL host)

1. Copy the repo to a Windows path — MSVC can't build from UNC:
   `cp -r /home/spars/repos/opentime /mnt/c/Users/spars/opentime-build`
2. Sync changed files from the repo into the copy (Cargo.toml, tauri.conf.json,
   `src-tauri/src/*`, package.json).
3. Build both installers:
   ```powershell
   cd /d C:\Users\spars\opentime-build
   npm run tauri build -- --bundles nsis,msi
   ```
4. Stage outputs into `releases/windows/` (gitignored).

See `docs/qa/windows-build-runbook.md` for the full procedure and the
`windows-sys 0.59` gotchas in `CLAUDE.md`.

## Release

- Bump version in `package.json`, `src-tauri/Cargo.toml`,
  `src-tauri/tauri.conf.json`, `.kovina/project.json` (all four, in sync).
- Update `CHANGELOG.md` once per release.
- Commit, then tag `v0.X.Y` **after** validation. Do not move existing tags.
- After a Windows build, verify: exe metadata (ProductName/Version/Company),
  version consistency, `icon.ico` has all 7 frames, installers exist.
- Built installers are gitignored (`releases/`); document their paths rather
  than committing binaries.

## Pushing to GitHub

- Repo: `sparshsam/opentime` (public). Push `main` and tags after the user
  approves.
- **The shell exports an invalid `GITHUB_TOKEN`** that overrides the keyring
  credential and breaks git/gh auth. Always push with it unset:
  ```bash
  env -u GITHUB_TOKEN git push origin main
  env -u GITHUB_TOKEN git push origin --tags
  ```
  (`gh` commands likewise need `env -u GITHUB_TOKEN gh ...`.)
- After pushing, CI validates on GitHub (Linux + Windows MSVC).

---

*This file is part of the OpenTime project — Calm, privacy-first desktop time companion. Clocks, world clocks, and more.*
