# Windows Build & Validation Runbook

> **Who runs this:** a human on a Windows 10/11 machine.
> **Why:** the MSIX/NSIS bundle and the interactive desktop-layer behaviour
> (taskbar, tray, Alt+Tab, Explorer restart, sleep/resume) cannot be produced
> or exercised from the WSL development host. This document gives the exact
> commands and a results template.

---

## Part A — Prerequisites (one-time)

Run these in **PowerShell (Administrator)** on the Windows machine.

```powershell
# 1. Rust + MSVC toolchain (if not already present)
winget install Rustlang.Rustup
rustup default stable-x86_64-pc-windows-msvc

# 2. Node + npm (if not already present)
winget install OpenJS.NodeJS.LTS

# 3. Tauri CLI (the Windows build tool)
cargo install tauri-cli --version "^2" --locked

# 4. NSIS installer tool (for the .exe installer)
winget install NSIS.NSIS

# 5. WiX Toolset (for MSIX) — or enable the Tauri "msi" target's bundled
#    option. MSIX also needs the Windows SDK / MakeAppx from the SDK.
winget install --id Microsoft.WiX
```

Verify:

```powershell
cargo --version
cargo-tauri --version
makensis -VERSION
```

---

## Part B — Clone / open the repo on Windows

The repo lives at `\\wsl.localhost\Ubuntu\home\spars\repos\opentime` when
viewed from Windows, but **MSVC cannot compile from a UNC path**. Copy it to a
real Windows path first:

```powershell
# From the WSL shell:
cp -r /home/spars/repos/opentime /mnt/c/Users/spars/opentime-build

# Then open a Windows terminal in C:\Users\spars\opentime-build
```

---

## Part C — Build the Windows release

```powershell
cd C:\Users\spars\opentime-build
npm install
npm run typecheck
npm test
cargo test --manifest-path src-tauri/Cargo.toml

# Windows debug binary (fast iteration)
npm run tauri dev

# Windows release binary
npm run tauri build

# Produce only the bundle(s):
npm run tauri build -- --bundles nsis,msi
```

Expected outputs:

```
src-tauri\target\release\opentime.exe
src-tauri\target\release\bundle\nsis\OpenTime_0.3.0_x64-setup.exe
src-tauri\target\release\bundle\msi\OpenTime_0.3.0_x64_en-US.msi
```

### If MSIX fails

MSIX needs the Windows SDK's `MakeAppx.exe` and a code-signing certificate.
For a local unsigned test build, either:

- Install the Windows SDK via Visual Studio Installer, or
- Temporarily set `"targets": ["nsis"]` in `src-tauri/tauri.conf.json` to
  validate the NSIS path first.

---

## Part D — Install & verify the packaged build

```powershell
# NSIS silent install (per-user, no admin):
Start-Process .\src-tauri\target\release\bundle\nsis\OpenTime_0.3.0_x64-setup.exe -ArgumentList "/S" -Wait

# MSIX (unsigned local test — requires developer mode or a signing cert):
Add-AppxPackage -Path .\src-tauri\target\release\bundle\msi\OpenTime_0.3.0_x64_en-US.msi
```

Verify installation:

```powershell
# Installed location (per-user NSIS):
Get-Item "$env:LOCALAPPDATA\Kovina\OpenTime\OpenTime.exe"
# Start Menu entry:
Test-Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Kovina"
```

### Package metadata

```powershell
# Version, product name, publisher
(Get-Item "$env:LOCALAPPDATA\Kovina\OpenTime\OpenTime.exe").VersionInfo |
  Select-Object ProductName, ProductVersion, CompanyName
# Expected: OpenTime, 0.3.0, Kovina
```

### Startup registry entry

Enable startup in the manager, then verify the real key:

```powershell
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v OpenTime
# Expected: REG_SZ with the quoted path to OpenTime.exe
```

### Database creation

After first launch, confirm the SQLite database was created:

```powershell
Get-Item "$env:APPDATA\org.kovina.opentime\opentime.sqlite"
# Add a clock, close OpenTime, reopen → the clock returns.
```

---

## Part E — Interactive validation checklist

Run each and record the result in the template below.

| # | Check | Pass? |
|---|---|---|
| 1 | Launch → tray icon appears; no manager window on first start after install | ☐ |
| 2 | First-run onboarding appears once, then never again | ☐ |
| 3 | A Minimal Digital clock appears near the top-right, **above the wallpaper** | ☐ |
| 4 | Ordinary app windows (e.g. Notepad) cover the widget when overlapping | ☐ |
| 5 | Widget is NOT in the taskbar and NOT in Alt+Tab | ☐ |
| 6 | Dragging the widget works; clicking does not steal focus | ☐ |
| 7 | Lock the widget → drag stops; edit outline hides | ☐ |
| 8 | Right-click menu: Open Settings / Change Timezone / Change Design / Duplicate / Lock / Seconds / Date / Move to Display / Hide / Remove all work | ☐ |
| 9 | Tray: Add Clock, Show Manager, Lock/Unlock All, Hide/Show All, Quit | ☐ |
| 10 | Closing the manager hides it; OpenTime stays running; widgets stay visible | ☐ |
| 11 | Second launch focuses the existing instance (no duplicate process) | ☐ |
| 12 | Quit from tray → all windows close cleanly | ☐ |
| 13 | Reopen → widgets restored at saved positions | ☐ |
| 14 | Start with Windows → restart → OpenTime runs; widgets restored; no manager | ☐ |
| 15 | **Explorer restart** (Task Manager → restart Windows Explorer) → widgets re-attach within ~5 s | ☐ |
| 16 | **Show Desktop** (Win+D) → widgets stay on the desktop | ☐ |
| 17 | Alt+Tab and Win+Tab → widgets absent | ☐ |
| 18 | Virtual desktops → widgets behave sanely (stays on current desktop) | ☐ |
| 19 | Taskbar at bottom/top/left/right → widgets not obscured | ☐ |
| 20 | Taskbar auto-hide → widgets remain visible | ☐ |
| 21 | 100% / 125% / 150% / 175% / 200% scaling → position no drift, icons sharp | ☐ |
| 22 | Mixed-DPI multi-monitor → widgets correct after moving | ☐ |
| 23 | Monitor disconnect/reconnect → widgets land safely on primary | ☐ |
| 24 | **Sleep → resume** → clocks correct within ~1 s | ☐ |
| 25 | Add 10 clocks, seconds on → manager shows the performance warning; CPU acceptable | ☐ |
| 26 | Title-bar and taskbar icons are sharp at 150% scaling | ☐ |
| 27 | Uninstall → Start Menu entry and app-data removed; no leftover processes | ☐ |

### Results template

```
Date: ____________
Windows version/build: ____________
Display scaling used: ____________
Build: nsis [ ] msi [ ]  (which bundle validated)
All 27 checks: pass [ ] fail [ ]
Failures (numbers + what happened): ____________
```

---

## Part F — Report back

Copy the results template and paste it back into this session, or save it to
`docs/qa/validation-results-v0.3.0.md`. I'll update `docs/qa/windows-manual-validation.md`
with the results and commit the hardening release.

---

## If something breaks

- **Bundle fails to build** → check NSIS/WiX installed (Part A) and that the
  repo is on a `C:\` path (Part B).
- **Widgets vanish after Explorer restart** → the shell monitor polls every
  3 s; wait, then tray → Show All.
- **Blurry icons** → confirm 96×96 is in the ICO (it is now: 7 frames); the
  runtime `restore_window_icon` handles DPI.
- **Second instance opens** → confirm the single-instance plugin is active
  (it was added in the hardening build).
