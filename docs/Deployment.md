# Deployment

How OpenTime is built, packaged, and distributed.

## Overview

OpenTime ships as **Windows desktop installers** produced by the Tauri bundler.
There is no server component and no hosted backend — the app is local-first
and makes no network requests for core functionality.

| Artifact | Format | Purpose |
|---|---|---|
| NSIS `.exe` | Per-user installer | Recommended for most users |
| MSI | Windows Installer | Enterprise / silent deployment |

## Build pipeline

`npm run tauri build -- --bundles nsis,msi` produces both installers. The
pipeline runs:

1. Frontend production build (`npm run build` → `dist/`)
2. Rust release compile (MSVC on Windows)
3. NSIS bundling → `bundle/nsis/OpenTime_<ver>_x64-setup.exe`
4. WiX/MSI bundling → `bundle/msi/OpenTime_<ver>_x64_en-US.msi`

### CI

- **`.github/workflows/ci.yml`** runs on every push/PR to `main`:
  Linux (format, lint, typecheck, frontend + Rust tests) and Windows
  (full MSVC validation + installer build, artifacts uploaded).
- **`.github/workflows/release.yml`** runs on `v*` tags: runs the tests, builds
  both installers, and attaches them to a GitHub Release.

## Installation layout

The NSIS installer installs per-user (no admin required):

```
%LOCALAPPDATA%\Kovina\OpenTime\OpenTime.exe
```

The MSI uses Windows Installer with the standard per-machine or per-user
behaviour depending on how it is invoked.

## User data location

All data lives in one SQLite database (never touched by the installer):

```
%APPDATA%\org.kovina.opentime\opentime.sqlite
```

Upgrades preserve this directory; uninstalling the app does not delete it.

## Install / update / uninstall

Exact commands are in [docs/INSTALL.md](INSTALL.md).

## Versioning

- Versions are kept in sync across `package.json`, `src-tauri/Cargo.toml`,
  `src-tauri/tauri.conf.json`, and `.kovina/project.json`.
- Releases are tagged `vX.Y.Z` after validation. Tags are immutable — a fix is
  a new patch version, never a re-tag.
- The CHANGELOG is updated once per release.

## Signing

Installers are currently **unsigned** (local development builds). Before public
store distribution, sign with an Authenticode certificate:

```powershell
# Configure in tauri.conf.json / use the Tauri signing options:
signtool sign /fd SHA256 /a <installer>
```

MSIX store submission additionally requires a store/enterprise signing
certificate and the Microsoft Partner Center review.

## Known packaging limitation

- **MSIX/AppX** (the Store package format) is not currently configured; the
  project targets `nsis` and `msi`. Adding MSIX would require the Windows SDK's
  `MakeAppx`/`SignTool` and a signing certificate.
- The **interactive desktop-layer behaviour** (taskbar, Alt+Tab, Explorer
  restart, sleep/resume, DPI) is validated manually on a real Windows desktop;
  see [docs/qa/windows-manual-validation.md](qa/windows-manual-validation.md).
