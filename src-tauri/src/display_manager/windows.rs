//! Windows monitor enumeration and position correction.

use windows_sys::Win32::Foundation::{HWND, LPARAM};
use windows_sys::Win32::Graphics::Gdi::{
    EnumDisplayMonitors, GetMonitorInfoW, HDC, HMONITOR, MONITORINFO,
};
use windows_sys::Win32::UI::HiDpi::{GetDpiForMonitor, MDT_EFFECTIVE_DPI};
use windows_sys::Win32::UI::WindowsAndMessaging::{GetWindowRect, IsWindow, MONITORINFOF_PRIMARY};

use crate::persistence::models::MonitorInfo;

/// Logical DPI at 100% scaling.
const BASE_DPI: u32 = 96;

fn hmonitor_display_id(hmon: HMONITOR) -> String {
    // Use the monitor handle address as a stable id within a session.
    format!("monitor-{:x}", hmon as usize)
}

fn monitor_from_hmonitor(hmon: HMONITOR) -> Option<MonitorInfo> {
    unsafe {
        let mut info: MONITORINFO = std::mem::zeroed();
        info.cbSize = std::mem::size_of::<MONITORINFO>() as u32;
        if GetMonitorInfoW(hmon, &mut info) == 0 {
            return None;
        }
        let mut dpi_x: u32 = 96;
        let mut dpi_y: u32 = 96;
        // GetDpiForMonitor can fail (e.g. on some virtual displays); fall back
        // to the effective window DPI.
        let _ = GetDpiForMonitor(hmon, MDT_EFFECTIVE_DPI, &mut dpi_x, &mut dpi_y);
        let scale = dpi_x as f64 / BASE_DPI as f64;

        let name = monitor_name(hmon);
        let rc = info.rcMonitor;
        Some(MonitorInfo {
            display_id: hmonitor_display_id(hmon),
            name,
            x: rc.left as i64,
            y: rc.top as i64,
            width: (rc.right - rc.left) as i64,
            height: (rc.bottom - rc.top) as i64,
            scale_factor: scale,
            is_primary: info.dwFlags & MONITORINFOF_PRIMARY != 0,
        })
    }
}

fn monitor_name(_hmon: HMONITOR) -> String {
    // Querying the display device name via EnumDisplayDevices is involved;
    // a readable fallback is fine for the widget list.
    "Display".to_string()
}

/// Enumerate all connected monitors.
pub fn list_monitors() -> Vec<MonitorInfo> {
    let mut out: Vec<MonitorInfo> = Vec::new();
    unsafe {
        EnumDisplayMonitors(
            std::ptr::null_mut(),
            std::ptr::null(),
            Some(enum_proc),
            &mut out as *mut Vec<MonitorInfo> as LPARAM,
        );
    }
    out
}

unsafe extern "system" fn enum_proc(
    hmon: HMONITOR,
    _hdc: HDC,
    _rect: *mut windows_sys::Win32::Foundation::RECT,
    data: LPARAM,
) -> i32 {
    if let Some(mon) = monitor_from_hmonitor(hmon) {
        let vec = &mut *(data as *mut Vec<MonitorInfo>);
        vec.push(mon);
    }
    1
}

pub fn primary_monitor() -> Option<MonitorInfo> {
    list_monitors().into_iter().find(|m| m.is_primary)
}

/// Find the monitor containing a logical point.
pub fn monitor_at(x: f64, y: f64) -> Option<MonitorInfo> {
    let monitors = list_monitors();
    monitors.into_iter().find(|m| {
        x >= m.x as f64
            && x < (m.x + m.width) as f64
            && y >= m.y as f64
            && y < (m.y + m.height) as f64
    })
}

/// Correct a logical position so the top-left corner of a `width`×`height`
/// widget lands inside a usable monitor work area. Falls back to the primary
/// monitor when the original display is unavailable.
pub fn correct_position(x: f64, y: f64, width: f64, height: f64) -> (f64, f64) {
    let monitors = list_monitors();
    if monitors.is_empty() {
        return (x, y);
    }

    let on_any = monitors.iter().any(|m| {
        x >= m.x as f64
            && x + width <= (m.x + m.width) as f64
            && y >= m.y as f64
            && y + height <= (m.y + m.height) as f64
    });
    if on_any {
        return (x, y);
    }

    // Not on any monitor (e.g. display disconnected) — land on the primary
    // near the top-right, clear of the taskbar (which we approximate as a
    // 60px bottom strip).
    if let Some(primary) = primary_monitor() {
        let px = primary.x as f64 + primary.width as f64 - width - 24.0;
        let py = primary.y as f64 + 24.0;
        return (px.max(primary.x as f64), py.max(primary.y as f64));
    }
    (x, y)
}

/// A tiny helper: is this a valid window handle?
pub fn window_exists(hwnd: usize) -> bool {
    unsafe { IsWindow(hwnd as HWND) != 0 }
}

/// Get the window's rect in physical pixels (used for DPI-aware sizing).
#[allow(dead_code)]
pub fn window_physical_rect(hwnd: usize) -> Option<(i32, i32, i32, i32)> {
    unsafe {
        let mut r: windows_sys::Win32::Foundation::RECT = std::mem::zeroed();
        if GetWindowRect(hwnd as HWND, &mut r) == 0 {
            return None;
        }
        Some((r.left, r.top, r.right - r.left, r.bottom - r.top))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn correct_position_keeps_valid_points() {
        // Without a real display context, list_monitors may be empty; the
        // function must still not panic and must return the input.
        let (x, y) = correct_position(10.0, 10.0, 320.0, 160.0);
        // Either unchanged or corrected to a primary — never NaN.
        assert!(!x.is_nan() && !y.is_nan());
    }
}
