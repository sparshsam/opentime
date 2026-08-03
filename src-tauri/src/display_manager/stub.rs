//! Non-Windows stub — keeps the crate compiling on macOS/Linux during
//! development. No monitor data is available; callers must handle empty lists.

use crate::persistence::models::MonitorInfo;

pub fn list_monitors() -> Vec<MonitorInfo> {
    Vec::new()
}

pub fn primary_monitor() -> Option<MonitorInfo> {
    None
}

/// Correct a logical position so it falls inside a usable monitor bounds.
/// The stub returns the position unchanged (no monitors known).
pub fn correct_position(x: f64, y: f64, _width: f64, _height: f64) -> (f64, f64) {
    (x, y)
}

/// Identify the monitor that contains a logical point.
pub fn monitor_at(_x: f64, _y: f64) -> Option<MonitorInfo> {
    None
}
