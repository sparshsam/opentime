# Troubleshooting

## Widgets are missing after Explorer restarts

OpenTime's shell monitor re-attaches widgets when Explorer recreates the
desktop surface. It polls every 3 seconds.

- Wait a few seconds — widgets should reappear.
- If they don't, right-click the tray icon → **Show All Widgets**.
- If they still don't appear, check that the widget record still exists:
  the manager's **Widgets** list shows every widget, hidden or not.

## Widgets appear in the taskbar or Alt+Tab

This should not happen: every widget window is created with tool-window
styling and `skip_taskbar`. If you see it, the window was created before the
styling applied. Rebuild from a fresh install. If it reproduces, file an issue
with the exact Windows version.

## Blurry title-bar or taskbar icon

OpenTime loads DPI-aware icon sizes (`GetDpiForWindow`-scaled). If an icon
still looks soft, check your display scaling: at 150% the title bar needs a
24×24 frame, at 200% a 32×32 frame. The bundled `icon.ico` contains all frames
16–256.

## Startup setting shows "not registered" even though I enabled it

The startup status reads the **real** registry state (HKCU Run key). If
registration failed (e.g. permission issue), the UI reports it honestly rather
than claiming success. Check:

- The toggle in **Startup** and its status line.
- Whether the registry value `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\OpenTime`
  exists.

## Clocks don't update after sleep

Every clock re-reads `Date.now()` on resume and corrects immediately. If a
clock appears stuck, wake it by moving the mouse over it or restarting
OpenTime from the tray. This is a known edge case with webviews that miss the
resume event.

## Time is wrong for a city

- Check the timezone, not the label: open **Edit Clock** and confirm the IANA
  zone.
- DST is applied automatically from the platform timezone database.
- Some cities share a zone (Mumbai and Delhi both live in `Asia/Kolkata`); the
  offset and abbreviation are the same.

## The tray icon is missing

- If OpenTime is running, look in the overflow area of the taskbar (the `^`
  chevron) — tray icons can be hidden there.
- If it's truly gone, the tray may have been recreated after an Explorer
  restart; restart OpenTime.

## Memory or CPU seems high

- Clocks with **seconds** update every second; many such clocks cost CPU. The
  manager warns when 8+ clocks update every second. Turn off seconds where you
  don't need them.
- OpenTime is designed to idle at one wake per minute for clocks without
  seconds. If idle CPU looks wrong, export diagnostics (**General → Export
  Diagnostics**) for a bug report.

## Data location

All data lives in one SQLite database:

```
%APPDATA%\org.kovina.opentime\opentime.sqlite
```

Deleting it resets OpenTime to first run. Back it up before uninstalling if
you want to keep your clocks.
