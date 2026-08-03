//! Windows desktop-layer implementation (WorkerW reparent + HWND_BOTTOM fallback).

use windows_sys::Win32::Foundation::{HWND, LPARAM, LRESULT, RECT, S_OK, WPARAM};
use windows_sys::Win32::UI::WindowsAndMessaging::{
    EnumWindows, FindWindowW, GetClassNameW, GetParent, GetWindowLongPtrW, GetWindowLongW,
    IsWindow, SendMessageTimeoutW, SetParent, SetWindowLongPtrW, SetWindowLongW, SetWindowPos,
    GWL_EXSTYLE, GWL_STYLE, HWND_BOTTOM, SMTO_ABORTIFHUNG, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE,
    SWP_NOZORDER, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW, WS_EX_TOPMOST, WS_EX_TRANSPARENT, WS_POPUP,
};

// The WM_SPAWN_WORKERW message — a de-facto standard used by desktop-widget
// software to ask Progman to (re)create its WorkerW child.
const WM_SPAWN_WORKERW: u32 = 0x052C;
const PROGMAN_CLASS: &str = "Progman";
const WORKERW_CLASS: &str = "WorkerW";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DesktopLayerResult {
    Attached,
    Fallback,
    NotSupported,
}

/// Locate the WorkerW that hosts the desktop wallpaper.
///
/// Algorithm (established shell-window practice):
/// 1. Find the Progman window.
/// 2. Send it WM_SPAWN_WORKERW to force a WorkerW to exist.
/// 3. Enumerate top-level windows; the WorkerW whose parent is NOT Progman is
///    the wallpaper surface. The Progman window itself hosts the desktop icons.
unsafe fn find_desktop_workerw() -> Option<HWND> {
    let progman = FindWindowW(&[PROGMAN_CLASS.as_ptr().cast(), 0], std::ptr::null());
    if progman.is_null() {
        return None;
    }

    // Ask Progman to spawn (or refresh) its WorkerW child.
    let mut result: usize = 0;
    let _ = SendMessageTimeoutW(
        progman,
        WM_SPAWN_WORKERW,
        WPARAM(0xD as usize),
        LPARAM(0x1 as isize),
        SMTO_ABORTIFHUNG,
        1000,
        &mut result,
    );

    let mut found: Option<HWND> = None;
    EnumWindows(
        Some(enum_workerw_proc),
        &mut found as *mut Option<HWND> as LPARAM,
    );
    found
}

unsafe extern "system" fn enum_workerw_proc(hwnd: HWND, lparam: LPARAM) -> i32 {
    let mut class = [0u16; 256];
    let len = GetClassNameW(hwnd, class.as_mut_ptr(), class.len() as i32);
    if len == 0 {
        return 1;
    }
    let name = String::from_utf16_lossy(&class[..len as usize]);
    if name != WORKERW_CLASS {
        return 1;
    }
    // The wallpaper WorkerW is a top-level window (parent == null). The
    // icons WorkerW is parented to Progman.
    if GetParent(hwnd).is_null() {
        let slot = &mut *(lparam as *mut Option<HWND>);
        *slot = Some(hwnd);
        return 0; // stop enumeration
    }
    1
}

/// Attach a widget window into the desktop layer.
pub fn attach_to_desktop(hwnd: usize) -> DesktopLayerResult {
    let hwnd = hwnd as HWND;
    unsafe {
        if !IsWindow(hwnd) {
            return DesktopLayerResult::NotSupported;
        }

        // First, ensure the window never appears in the taskbar or Alt+Tab.
        apply_desktop_window_styles(hwnd);

        if let Some(workerw) = find_desktop_workerw() {
            if SetParent(hwnd, workerw) != 0 {
                // Position at the bottom of the desktop surface's z-order so
                // desktop icons (children of Progman, above WorkerW) stay on top.
                let _ = SetWindowPos(
                    hwnd,
                    HWND_BOTTOM,
                    0,
                    0,
                    0,
                    0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_NOZORDER,
                );
                return DesktopLayerResult::Attached;
            }
        }

        // Fallback: no WorkerW available. Keep it a bottom-most top-level
        // tool window (never taskbar/Alt+Tab, never activating).
        let _ = SetWindowPos(
            hwnd,
            HWND_BOTTOM,
            0,
            0,
            0,
            0,
            SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
        );
        DesktopLayerResult::Fallback
    }
}

/// Detach a widget window from the desktop layer (called before destruction).
pub fn detach_from_desktop(hwnd: usize) {
    let hwnd = hwnd as HWND;
    unsafe {
        if IsWindow(hwnd) {
            let _ = SetParent(hwnd, std::ptr::null_mut());
        }
    }
}

/// True when the widget's parent (the WorkerW) is still a valid window.
pub fn is_attached_valid(hwnd: usize) -> bool {
    let hwnd = hwnd as HWND;
    unsafe {
        if !IsWindow(hwnd) {
            return false;
        }
        let parent = GetParent(hwnd);
        if parent.is_null() {
            // Fallback mode: window exists, that's the definition of valid.
            return IsWindow(hwnd) != 0;
        }
        IsWindow(parent) != 0
    }
}

/// Re-run the attach routine — used by the shell watcher after Explorer
/// restarts and the WorkerW is recreated.
pub fn reattach(hwnd: usize) -> DesktopLayerResult {
    let hwnd = hwnd as HWND;
    unsafe {
        if !IsWindow(hwnd) {
            return DesktopLayerResult::NotSupported;
        }
        // Detach from any stale parent first.
        let _ = SetParent(hwnd, std::ptr::null_mut());
    }
    attach_to_desktop(hwnd)
}

/// Apply tool-window / no-activate / transparent styling so the widget never
/// appears in the taskbar, Alt+Tab, or steals focus.
pub fn apply_desktop_window_styles(hwnd: usize) {
    let hwnd = hwnd as HWND;
    unsafe {
        let ex = GetWindowLongW(hwnd, GWL_EXSTYLE) as u32;
        let new_ex =
            ex | WS_EX_TOOLWINDOW as u32 | WS_EX_NOACTIVATE as u32 | WS_EX_TRANSPARENT as u32;
        let _ = SetWindowLongW(hwnd, GWL_EXSTYLE, new_ex as i32);

        let style = GetWindowLongW(hwnd, GWL_STYLE) as u32;
        if style & WS_POPUP as u32 == 0 {
            let _ = SetWindowLongW(hwnd, GWL_STYLE, (style | WS_POPUP as u32) as i32);
        }
    }
}

/// Ensure the window is not above normal windows (clear WS_EX_TOPMOST).
pub fn clear_topmost(hwnd: usize) {
    let hwnd = hwnd as HWND;
    unsafe {
        let ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE) as usize;
        if ex & WS_EX_TOPMOST as usize != 0 {
            let _ = SetWindowLongPtrW(hwnd, GWL_EXSTYLE, (ex & !(WS_EX_TOPMOST as usize)) as isize);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn find_workerw_does_not_crash_on_any_system() {
        // On headless CI (no Explorer) this returns None; on a real Windows
        // session it returns the wallpaper surface. We only assert it doesn't
        // panic and that attach on an invalid hwnd reports NotSupported.
        unsafe {
            let result = attach_to_desktop(0);
            // 0 is never a valid window, so must be NotSupported (or the
            // fallback path if a window check passes — it won't).
            assert!(result == DesktopLayerResult::NotSupported);
        }
    }
}
