# Windows Desktop-Layer Implementation

This document describes how OpenTime places clock widgets on the Windows
desktop so they sit **above the wallpaper but below ordinary application
windows**, excluded from the taskbar and Alt+Tab, and survive Explorer
restarts.

## Selected strategy: WorkerW reparenting + HWND_BOTTOM fallback

The Explorer desktop is itself a window:

- `Progman` ("Program Manager") hosts the desktop icons.
- A child window, `WorkerW`, hosts the wallpaper surface.

Reparenting a widget window into the `WorkerW` places it in the desktop layer
with exactly the behaviour OpenTime needs:

| Requirement | How it's satisfied |
|---|---|
| Above the wallpaper | Child of the WorkerW (wallpaper surface) |
| Below app windows | App windows are top-level; the desktop surface is at the bottom of the z-order |
| No taskbar presence | `WS_EX_TOOLWINDOW` + `skip_taskbar` |
| No Alt+Tab presence | Tool-window styling excludes the window from Alt+Tab |
| No focus steal | `WS_EX_NOACTIVATE` on the widget window |
| Explorer-restart safe | `shell_monitor` re-runs the attach routine when the WorkerW is destroyed |

This is the established shell-window practice used by Rainmeter and similar
desktop-widget software. The one semi-undocumented element — the `0x052C`
message that asks Progman to (re)create its WorkerW — is well documented in the
field, wrapped in `find_desktop_workerw()`, and isolated behind the
`desktop_layer` module.

### Attach algorithm (`desktop_layer/windows.rs`)

1. Find `Progman`.
2. Send `WM_SPAWN_WORKERW` (`0x052C`) to force a WorkerW to exist.
3. Enumerate top-level windows; pick the `WorkerW` whose parent is **not**
   `Progman` (that is the wallpaper surface).
4. `SetParent(widget, workerw)`.
5. Apply tool-window / no-activate / transparent extended styles.

If the WorkerW cannot be found or `SetParent` fails, OpenTime falls back to a
**bottom-most top-level window** (`HWND_BOTTOM`) with tool-window styling. This
degrades gracefully: widgets still never appear in the taskbar or Alt+Tab and
never steal focus, but they sit "in" the window stack rather than on the
desktop surface itself.

## Why not `alwaysOnTop` or plain windows?

A conventional window with `alwaysOnTop: false` is not enough: maximized
applications fully cover it, and it participates in normal z-order management.
The desktop surface approach is the only way to render *on the desktop itself*.

## Known Windows limitations

- **Explorer restart** destroys the WorkerW. The `shell_monitor` polls every
  few seconds; when a widget's parent is no longer valid, it re-runs the
  attach routine.
- **Virtual desktops**: desktop-attached windows remain on the current virtual
  desktop; Windows does not move them between virtual desktops automatically.
- **Sign-out / lock**: widget windows are destroyed by the session; state is
  persisted and restored on the next run.
- The `0x052C` message is not a formally documented API. It is isolated in one
  function and only used to *refresh* the WorkerW discovery; the discovery
  itself uses `EnumWindows`.

## Explorer-restart recovery flow

1. Explorer restarts → the old WorkerW is destroyed.
2. `shell_monitor::sweep()` notices the widget's parent is invalid.
3. It detaches the widget, re-runs `attach_to_desktop`, and re-registers the
   window for supervision.

## Fallback behaviour

- If the desktop surface cannot be found at all (e.g. an unusual shell),
  widgets fall back to `HWND_BOTTOM` top-level tool windows. They remain
  usable, movable, and persisted — just not on the wallpaper surface.
