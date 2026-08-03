//! Startup registration for Windows sign-in.
//!
//! Uses the current-user Run key (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`),
//! which is the platform-appropriate mechanism for per-user auto-start and
//! requires no elevation. The real registration state is always read back and
//! reported honestly — the UI never claims startup is enabled when registration
//! failed.

#[cfg(windows)]
mod windows;

#[cfg(not(windows))]
mod stub;

#[cfg(windows)]
pub use windows::*;

#[cfg(not(windows))]
pub use stub::*;
