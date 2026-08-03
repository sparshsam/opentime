# Windows Manual Validation Checklist

Native Windows desktop-layer behaviour cannot be fully automated. This
checklist must be run manually on a Windows 10/11 machine before each release.

## Display & DPI

- [ ] Widget renders correctly at 100% scaling
- [ ] 125% scaling
- [ ] 150% scaling
- [ ] 175% scaling
- [ ] 200% scaling
- [ ] Mixed-DPI multi-monitor setup
- [ ] Monitors positioned left, right, above, and below the primary
- [ ] Negative virtual-screen coordinates
- [ ] Monitor disconnection → widget moves to primary safely
- [ ] Monitor reconnection → widget stays usable
- [ ] Resolution change → no position drift
- [ ] Orientation change → no position drift

## Desktop layer

- [ ] Widget is above the wallpaper
- [ ] Ordinary app windows cover the widget
- [ ] Widget not in the taskbar
- [ ] Widget not in Alt+Tab
- [ ] Widget does not steal focus during ordinary use
- [ ] "Show Desktop" (Win+D) does not remove the widget
- [ ] Explorer restart → widget re-attaches (within a few seconds)
- [ ] Explorer restart → widget position preserved
- [ ] System restart → widget restored
- [ ] Sign-out → sign-in → widget restored

## Widget manipulation

- [ ] Drag to reposition works (unlocked)
- [ ] Lock stops dragging
- [ ] Edit-state outline visible when unlocked, hidden when locked
- [ ] Edge snapping works
- [ ] Widget stays inside usable monitor bounds
- [ ] Resize handles work (where the design supports it)

## Context menu (right-click)

- [ ] Open Settings
- [ ] Change Timezone
- [ ] Change Design
- [ ] Duplicate
- [ ] Lock / Unlock Position
- [ ] Show Seconds / Show Date toggles
- [ ] Move to Display
- [ ] Hide Widget
- [ ] Remove Widget (confirmed)

## Tray

- [ ] Tray icon visible and legible
- [ ] Add Clock works from the tray
- [ ] Show Manager works
- [ ] Lock All / Unlock All Widgets
- [ ] Hide All / Show All Widgets
- [ ] Quit closes all widget windows cleanly and persists state
- [ ] Closing the manager does NOT quit OpenTime or close widgets

## Startup

- [ ] "Start with Windows" toggle registers the Run key
- [ ] Registration state shown honestly (enabled / disabled / failed)
- [ ] App launches quietly at sign-in (no manager window)
- [ ] Widgets restored at sign-in
- [ ] Invalid positions corrected

## Sleep / resume

- [ ] Clocks correct immediately after resume
- [ ] No timer drift after an extended sleep

## Accessibility & input

- [ ] Windows Narrator reads manager controls
- [ ] High-contrast themes usable
- [ ] Keyboard-only navigation in the manager
- [ ] Text scaling to 200% does not break the manager layout

## Taskbar edges & auto-hide

- [ ] Taskbar on bottom / top / left / right
- [ ] Taskbar auto-hide enabled — widgets not obscured

## Packaging

- [ ] Install from MSIX/MSI (path containing spaces)
- [ ] Unicode Windows username install
- [ ] Silent install (`/quiet`)
- [ ] Start Menu entry appears under "Kovina"
- [ ] Clean uninstall

## Stability

- [ ] Long-running run (> 24h) — no memory growth
- [ ] Repeated add/remove of widgets — no window leaks
- [ ] Multiple clocks with seconds + animations — acceptable CPU/memory
