# Installing, Running, and Uninstalling OpenTime (Windows)

This document gives the exact commands for installing, launching, updating, and
removing OpenTime on Windows. It covers the two installer formats OpenTime
produces: the **NSIS `.exe`** (recommended for most users) and the **MSI**
(Microsoft Installer).

> The installer files are produced on a Windows machine by the build process.
> See [docs/qa/windows-build-runbook.md](docs/qa/windows-build-runbook.md) for
> how to build them.

---

## Install

### NSIS installer (`.exe`) — recommended

```powershell
# From the build output folder:
.\OpenTime_0.3.2_x64-setup.exe

# Or silent install (no prompts, per-user, no admin required):
Start-Process .\OpenTime_0.3.2_x64-setup.exe -ArgumentList "/S" -Wait
```

Installs to:

```
%LOCALAPPDATA%\Kovina\OpenTime\
```

and creates a Start Menu entry under **Kovina → OpenTime**.

### MSI installer (`.msi`)

```powershell
# Interactive:
msiexec /i OpenTime_0.3.2_x64_en-US.msi

# Silent:
msiexec /i OpenTime_0.3.2_x64_en-US.msi /qn /norestart
```

---

## Launch

```powershell
# Start Menu:
#   Start → Kovina → OpenTime

# Command line:
& "$env:LOCALAPPDATA\Kovina\OpenTime\OpenTime.exe"

# Or by Windows Run dialog (Win+R):
OpenTime
```

### First launch

1. The tray icon appears (look in the taskbar overflow `^` if you don't see it).
2. A clock widget appears near the top-right of the desktop.
3. Right-click the clock to configure it; use the tray icon to open the manager.

### Launch at sign-in (optional)

Open the **OpenTime Manager** → **Startup** → enable **"Start OpenTime when I
sign in to Windows"**. The status line confirms whether registration succeeded.

---

## Update / Upgrade

**NSIS:** run the newer `.exe` — it upgrades in place, preserving settings and
widgets (per-user install, no uninstall step needed).

```powershell
Start-Process .\OpenTime_0.3.2_x64-setup.exe -ArgumentList "/S" -Wait
```

**MSI:** run the newer `.msi` — Windows Installer upgrades the existing
installation.

```powershell
msiexec /i OpenTime_0.3.2_x64_en-US.msi /qn /norestart
```

Your widgets, positions, and settings (stored in `%APPDATA%\org.kovina.opentime\`)
are preserved across upgrades.

---

## Uninstall

### Via Settings

**Settings → Apps → Installed apps** → search **OpenTime** → **Uninstall**.

### Command line

```powershell
# NSIS:
Get-Package -Name "OpenTime" | Uninstall-Package

# MSI (find the product code first):
Get-Package -Name "OpenTime" | Uninstall-Package
```

### Fully remove data (optional)

Uninstalling removes the program files but **keeps your data** in the app-data
folder. To remove everything:

```powershell
Remove-Item -Recurse -Force "$env:APPDATA\org.kovina.opentime"
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Kovina\OpenTime"
```

> Removing the app-data folder deletes your widgets, positions, and settings.

---

## Verification

After installing, confirm the package:

```powershell
# Version, product name, publisher
(Get-Item "$env:LOCALAPPDATA\Kovina\OpenTime\OpenTime.exe").VersionInfo |
  Select-Object ProductName, ProductVersion, CompanyName
# Expected: OpenTime · 0.3.2 · Kovina
```
