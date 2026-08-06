# OpenTime v0.3.2 — Validation Results

**Date:** 2026-08-05
**Build host:** Windows 11 via WSL interop (Windows MSVC toolchain)

## Build & packaging validation (command-line, verified)

| Check | Result |
|---|---|
| Windows Rust MSVC toolchain | ✅ rustc 1.96.0, cargo 1.96.0 |
| VS 2022 Build Tools + Windows SDK | ✅ MSVC 14.44, SDK present |
| WebView2 runtime | ✅ present |
| Tauri CLI (Windows) | ✅ 2.11.4 |
| NSIS + WiX | ✅ auto-downloaded by bundler |
| Windows release compile | ✅ `opentime.exe` (9 MB) |
| Rust unit tests (Windows MSVC) | ✅ 31 passed |
| Frontend typecheck (Windows) | ✅ |
| Frontend tests (Windows) | ✅ 73 passed |
| NSIS installer | ✅ `OpenTime_0.3.2_x64-setup.exe` (3.7 MB) |
| MSI installer | ✅ `OpenTime_0.3.2_x64_en-US.msi` (4.5 MB) |
| Exe metadata | ✅ ProductName=OpenTime, Version=0.3.2, Company=Kovina |
| Version consistency | ✅ package.json / Cargo.toml / tauri.conf.json all 0.3.2 |
| Package identifier | ✅ org.kovina.opentime |
| Bundled `icon.ico` frames | ✅ 7 frames: 16,24,32,48,64,96,256 |
| MSIX tile assets (Light + Dark) | ✅ present |
| Startup registry impl | ✅ compiled in (RegSetValueExW/RegDeleteValueW linked) |
| Single-instance | ✅ plugin compiled in |
| NSIS install mode | ✅ currentUser (per-user, no admin) |
| WiX MSI language | ✅ en-US |
| Config-consistency tests | ✅ validate all of the above in Rust tests |

## Pending (manual, on a real Windows desktop)

Interactive behaviour cannot be verified from the build host. See the manual
checklist in [windows-manual-validation.md](windows-manual-validation.md) and
the short checklist below.

## Installer outputs

```
C:\Users\spars\opentime-build\src-tauri\target\release\bundle\nsis\OpenTime_0.3.2_x64-setup.exe
C:\Users\spars\opentime-build\src-tauri\target\release\bundle\msi\OpenTime_0.3.2_x64_en-US.msi
```

---

## Short manual validation checklist

Run the generated package and confirm:

- [ ] Install the generated package (NSIS `.exe` or MSI)
- [ ] Launch OpenTime
- [ ] Confirm the clock widget appears on the desktop (above the wallpaper)
- [ ] Confirm normal app windows cover the widget
- [ ] Confirm the widget is absent from Alt+Tab and the taskbar
- [ ] Test Win+D (Show Desktop) — widget stays
- [ ] Test tray behaviour (icon, add clock, show manager, quit)
- [ ] Drag, resize, lock, and configure a widget
- [ ] Create several clocks and timezones
- [ ] Restart Explorer — widgets re-attach
- [ ] Sleep and wake the computer — clocks correct promptly
- [ ] Test startup after sign-in (if enabled)
- [ ] Inspect icon sharpness at 150% scaling
- [ ] Test multiple monitors if available
- [ ] Uninstall the app
