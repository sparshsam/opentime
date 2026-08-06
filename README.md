<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="96" height="96" alt="OpenTime">
</p>

<h1 align="center">OpenTime</h1>
<p align="center"><strong>Time, kept beautifully.</strong></p>
<p align="center">A calm, privacy-first desktop time companion. Clocks placed directly on your Windows desktop.</p>

<p align="center">
  <a href="#download">Download</a> ·
  <a href="#features">Features</a> ·
  <a href="#built-with">Built With</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

<br>

<!--
  Hero screenshot. Pending capture from a real Windows desktop after the
  interactive validation is complete (see docs/qa/validation-results-v0.3.2.md).
  Drop a 1600×900 capture at assets/hero/hero-dark.png and uncomment below.
-->
<!--
<p align="center">
  <img src="assets/hero/hero-dark.png" width="900" alt="OpenTime on the Windows desktop" style="border-radius: 12px;">
</p>
-->

---

## Download

| Platform | Link |
|---|---|
| Windows (NSIS `.exe`) | [OpenTime_0.3.2_x64-setup.exe](releases/windows/OpenTime_0.3.2_x64-setup.exe) |
| Windows (MSI) | [OpenTime_0.3.2_x64_en-US.msi](releases/windows/OpenTime_0.3.2_x64_en-US.msi) |
| Source | [GitHub](https://github.com/sparshsam/opentime) |

> Install, launch, update, and uninstall commands are in [docs/INSTALL.md](docs/INSTALL.md).

---

## Gallery

<!--
  Screenshots pending: capture the widget on a real Windows desktop (dark +
  light) and add them under assets/screenshots/. See
  docs/qa/windows-manual-validation.md for what to capture.
-->

<table>
  <tr>
    <td align="center">
      <img src="assets/icons/icon-512.png" width="240" alt="OpenTime app icon"><br>
      <em>App icon</em>
    </td>
    <td align="center">
      <img src="assets/platforms/windows/app.ico" width="240" alt="OpenTime window icon"><br>
      <em>Windows icon</em>
    </td>
  </tr>
</table>

*Screenshots of the desktop widget and manager will be added after the manual
Windows validation. The current gallery shows the bundled icon assets.*

---

## Why This App

Most clocks are either a tiny system-tray afterthought or a full application
window that competes with your work. OpenTime is neither.

OpenTime places clock widgets *on your desktop itself* — above the wallpaper,
below your apps — so the time is always visible without ever getting in the
way. It is built to run all day: quiet, unobtrusive, and entirely local.

- **Own your time.** No account, no telemetry, no cloud. Your clocks and
  settings live only on your machine.
- **Calm by design.** Clocks without seconds idle at one wake per minute.
  Nothing blinks, nothing phones home, nothing nags.
- **Built to last.** Every clock is configurable, every design is
  reproducible, and the app keeps running through restarts, Explorer
  crashes, and mixed-DPI displays.

---

## Features

| Feature | Description |
|---|---|
| Desktop clock widgets | Borderless, transparent clocks on the desktop layer — above the wallpaper, below app windows, never in the taskbar or Alt+Tab |
| World clocks | Unlimited independent clocks, each with its own timezone, design, appearance, and placement |
| Timezone picker | Offline search by city, country, IANA id, or alias; live local-time preview, abbreviation, and offset |
| World Clock Panel | Grouped multi-timezone panel with custom ordering and clear day-change indicators |
| IANA timezone IDs | Persisted zones — never bare offsets; DST, half/quarter-hour, and leap-year correct |
| Clock gallery | 7 digital + 6 analog designs + world-clock panel, with live previews and capability badges |
| Appearance system | Configuration-driven design registry with presets, contrast validation, and per-widget token editing |
| Curated typography | 7 font styles + Arabic/Roman/markers numerals; all bundled fonts OFL-licensed |
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
- [Installation](docs/INSTALL.md)
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

### [v0.3.2](CHANGELOG.md) — 2026-08-05

Native Windows build verified: the Windows MSVC release binary and both
installer packages (NSIS + MSI) build successfully. Windows-only compile
fixes, config-consistency tests, and a verified installer pipeline.

### [v0.3.1](CHANGELOG.md) — 2026-08-05

Hardening: duplicate-process prevention, sleep/resume correction, and
DPI-aware window icons (fixes blurry icons at 125–200% scaling).

### [v0.3.0](CHANGELOG.md) — 2026-08-03

Full multi-clock world-clock support: unlimited independent clocks, a
searchable offline IANA timezone picker, custom labels, and the World Clock
Panel with day-change indicators.

### [v0.2.0](CHANGELOG.md) — 2026-08-03

The full clock gallery: 7 digital and 6 analog designs, the world-clock panel,
a configuration-driven appearance system with presets and contrast validation,
curated typography, and bundled OFL fonts.

### [v0.1.0](CHANGELOG.md) — 2026-08-03

The desktop-clock foundation: Minimal Digital clock on the Windows desktop
layer, system tray, startup registration, SQLite persistence, first-run
onboarding, and Explorer-restart recovery.

[View full changelog](CHANGELOG.md)

---

## License

AGPL-3.0. See [LICENSE](LICENSE) for details.

---

## Part of the Kovina Collection

OpenReader · OpenJournal · OpenLedger · OpenTone · OpenPalette · OpenConvert

OpenSnap · WorldClock Widget · OpenProof · OpenSend · OpenSprout

WordWise · OpenScrabble · Chess by Sparsh · Hisstastic

Minimal, focused tools for everyday tasks.
