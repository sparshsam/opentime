//! Display manager — monitor enumeration, DPI, and position correction.
//!
//! On Windows this uses the Win32 monitor APIs (`EnumDisplayMonitors`,
//! `GetMonitorInfoW`, `GetDpiForMonitor`). Positions are stored in *logical*
//! pixels so a widget at logical (100, 100) stays put across scaling changes
//! instead of drifting. The module is `#[cfg(windows)]`-gated; other platforms
//! get a stub so the rest of the app compiles everywhere.

#[cfg(windows)]
mod windows;

#[cfg(not(windows))]
mod stub;

#[cfg(windows)]
pub use windows::*;

#[cfg(not(windows))]
pub use stub::*;
