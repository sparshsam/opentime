<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="96" height="96" alt="OpenTime">
</p>

<h1 align="center">OpenTime</h1>
<p align="center"><strong>Time, kept beautifully.</strong></p>
<p align="center">A calm, privacy-first desktop time companion. Clocks placed directly on your desktop.</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#built-with">Built With</a> ·
  <a href="CHANGELOG.md">Changelog</a> ·
  <a href="docs/architecture/README.md">Architecture</a>
</p>

---

## About

OpenTime places clock widgets directly on your Windows desktop — above the
wallpaper, below your apps. It is calm, private, and entirely local: no
account, no telemetry, no cloud dependency, no network requests for core
functionality. Widgets survive restarts, Explorer crashes, sign-out, and
mixed-DPI display layouts.

**Current release: v0.1.0** — a reliable desktop-clock foundation with a
Minimal Digital clock, a system tray, Windows sign-in startup, and full
position/state persistence.

> **Roadmap only** — calendars, alarms, timers, and reminders are planned but
> not yet implemented. See [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Features

| Feature | Description |
|---|---|
| Desktop clock widgets | Borderless, transparent clocks on the desktop layer — above the wallpaper, below app windows, never in the taskbar or Alt+Tab |
| Minimal Digital design | Clean, legible 12/24-hour clock with optional seconds, date, and timezone label |
| Move & lock | Drag to reposition; lock to prevent accidental moves; edge snapping and safe bounds |
| Widget context menu | Settings, timezone, design, duplicate, lock/unlock, seconds/date toggles, display move, hide, remove |
| System tray | Add Clock, Show Manager, Lock/Unlock All, Hide/Show All, Quit — closing the manager never quits OpenTime |
| Windows startup | Start at sign-in (HKCU Run), with honest status reporting |
| Persistence | SQLite with versioned migrations; widgets, positions, and settings restored on launch |
| Explorer-restart recovery | Widgets re-attach automatically when the shell recreates the desktop surface |
| Mixed-DPI support | Logical-pixel coordinates prevent scaling drift across 100–200% scaling |
| First-run onboarding | Concise welcome, optional startup, one clock placed near the top-right |
| Localization-ready | Translation-ready message catalog; locale-aware formatting (English shipped) |
| Bundled fonts | Inter, Source Sans 3, Source Serif 4, JetBrains Mono, Nunito, Oswald, DSEG7 — all SIL OFL |

---

## Built With

- **Framework:** Tauri 2
- **Frontend:** React + TypeScript + Vite
- **Native:** Rust (Windows desktop-layer, display/DPI, tray, startup)
- **Storage:** SQLite (via rusqlite), WAL mode
- **Time:** Luxon + Intl (IANA timezones)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Rust toolchain
- Tauri CLI (`cargo install tauri-cli --version "^2"`)

### Develop

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

Output appears in `src-tauri/target/release/bundle/`.

### Test

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Vitest unit tests
cargo test --manifest-path src-tauri/Cargo.toml  # Rust unit tests
```

---

## Documentation

- [Architecture](docs/architecture/README.md)
- [Windows desktop layer](docs/architecture/desktop-layer.md)
- [Persistence schema](docs/DATA.md)
- [Timezone handling](docs/architecture/timezones.md)
- [Design system](docs/DESIGN_NOTES.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Privacy](PRIVACY.md)

---

## Privacy

OpenTime is local-first and privacy-first:

- No accounts, no telemetry, no analytics, no ads.
- No network requests for core functionality.
- All data (widgets, positions, settings) is stored in a local SQLite database.
- Full local-data deletion is supported (delete the database).

---

## Version Journey

### [v0.1.0](CHANGELOG.md) — 2026-08-03

The desktop-clock foundation: Minimal Digital clock on the Windows desktop
layer, system tray, startup registration, SQLite persistence, first-run
onboarding, and Explorer-restart recovery.

[View full changelog](CHANGELOG.md)

---

## License

AGPL-3.0. See [LICENSE](LICENSE) for details.
