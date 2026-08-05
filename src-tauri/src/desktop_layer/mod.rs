//! Desktop-layer abstraction for OpenTime widgets.
//!
//! A widget must sit above the wallpaper but below ordinary application
//! windows, with no taskbar or Alt+Tab presence, and must survive Explorer
//! restarts.
//!
//! ## Selected strategy (Windows): WorkerW reparenting + HWND_BOTTOM fallback
//!
//! The Explorer desktop is itself a window ("Progman") whose child ("WorkerW")
//! hosts the wallpaper. Reparenting a widget window into the WorkerW places it
//! in the desktop layer: above the wallpaper, below icons and app windows,
//! excluded from the taskbar and Alt+Tab, and unaffected by "Show desktop".
//!
//! This is the established shell-window practice used by Rainmeter, RocketDock
//! and similar desktop-widget software. It relies on the (documented-in-the-
//! field, but not formally API-documented) `0x052C` message to force Progman
//! to (re)create its WorkerW child.
//!
//! ### Known limitations (documented per spec)
//! - Explorer restart destroys the WorkerW; the shell watcher re-runs the
//!   attach routine. See `shell_monitor`.
//! - Virtual desktops: widgets attached to the desktop surface remain visible
//!   on the current virtual desktop; Windows does not move desktop-attached
//!   windows between virtual desktops automatically.
//! - If the WorkerW cannot be found or reparenting fails, we fall back to a
//!   bottom-most top-level window (HWND_BOTTOM) with tool-window styling.
//!
//! On non-Windows platforms this module is a stub; the rest of the app compiles
//! and widget windows fall back to ordinary always-on-top-less windows.

#[cfg(windows)]
mod windows;

#[cfg(not(windows))]
mod stub;

pub mod icons;

#[cfg(windows)]
pub use windows::*;

#[cfg(not(windows))]
pub use stub::*;
