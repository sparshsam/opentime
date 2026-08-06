# Development

How to set up, build, and test OpenTime from source.

## Prerequisites

- **Node.js** 18+ and npm
- **Rust** toolchain (stable)
- **Tauri CLI** (`cargo install tauri-cli --version "^2" --locked`)
- **Windows (to run the app):** WebView2 runtime (present on Windows 11 / modern
  Windows 10), Visual Studio 2022 Build Tools + Windows SDK for the MSVC build

On Linux, Tauri additionally needs the WebKitGTK system packages:

```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev patchelf
```

## Install

```bash
npm install
```

## Run in development

```bash
npm run tauri dev
```

This starts the Vite dev server and launches the Tauri app. `cargo tauri dev`
hot-reloads the frontend; Rust changes require a rebuild.

## Scripts

The repo ships shell wrappers in `scripts/` (each with `--help`):

| Script | Purpose |
|---|---|
| `scripts/lint.sh` | Prettier + ESLint + TypeScript + rustfmt (add `--fix` to auto-fix) |
| `scripts/test.sh` | Vitest frontend tests + Rust unit tests |
| `scripts/build.sh` | Frontend production build (add `--app` for the full Tauri build) |
| `scripts/generate-icons.js` | Regenerate all platform icons from `assets/app-icon/` |

## Individual checks

```bash
npm run typecheck                                   # TypeScript
npm run lint                                        # ESLint
npx prettier --check src                            # formatting
npm test                                            # Vitest
cargo test --manifest-path src-tauri/Cargo.toml     # Rust unit tests
npm run build                                       # frontend production build
```

## Building for Windows

The app's primary platform is Windows. See
[docs/qa/windows-build-runbook.md](qa/windows-build-runbook.md) for the full
procedure (the repo must be copied to a `C:\` path — MSVC cannot build from a
WSL UNC path). In short:

```powershell
cd C:\path\to\opentime-build
npm run tauri build -- --bundles nsis,msi
```

Outputs:

```
src-tauri\target\release\bundle\nsis\OpenTime_<version>_x64-setup.exe
src-tauri\target\release\bundle\msi\OpenTime_<version>_x64_en-US.msi
```

## Windows-only testing note

The `#[cfg(windows)]` code (desktop layer, display manager, startup, icon
sizing) only compiles on Windows. Run `cargo test` on the Windows toolchain
(via WSL interop or a Windows host) after touching that code — Linux
`cargo check` will not catch Windows-only errors.

## Conventions

- **Commits:** small, focused; branch names `feat/*`, `fix/*`, `docs/*`.
- **Versions:** keep `package.json`, `src-tauri/Cargo.toml`,
  `src-tauri/tauri.conf.json`, and `.kovina/project.json` in sync.
- **Docs:** update `docs/` with every significant change; outdated docs are a bug.
