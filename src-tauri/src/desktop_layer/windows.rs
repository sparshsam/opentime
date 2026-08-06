//! Windows desktop-layer implementation (WorkerW reparent + HWND_BOTTOM fallback).

use windows_sys::Win32::Foundation::{HWND, LPARAM, WPARAM};
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
    // FindWindowW takes PCWSTR (a single *const u16), not a slice.
    let progman = FindWindowW(PROGMAN_CLASS.as_ptr().cast(), std::ptr::null());
    if progman.is_null() {
        return None;
    }

    // Ask Progman to spawn (or refresh) its WorkerW child.
    let mut result: usize = 0;
    let _ = SendMessageTimeoutW(
        progman,
        WM_SPAWN_WORKERW,
        0xD as WPARAM, // WM_SPAWN_WORKERW wParam
        0x1 as LPARAM, // WM_SPAWN_WORKERW lParam
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
    let h = hwnd as HWND;
    unsafe {
        if IsWindow(h) == 0 {
            return DesktopLayerResult::NotSupported;
        }

        // First, ensure the window never appears in the taskbar or Alt+Tab.
        apply_desktop_window_styles(hwnd);

        // Apply a DPI-correct title-bar/taskbar icon (16/32 logical px scaled
        // by GetDpiForWindow). Fixes blurry icons at non-100% scaling.
        super::icons::restore_window_icon(hwnd);

        if let Some(workerw) = find_desktop_workerw() {
            if !SetParent(h, workerw).is_null() {
                // Position at the bottom of the desktop surface's z-order so
                // desktop icons (children of Progman, above WorkerW) stay on top.
                let _ = SetWindowPos(
                    h,
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
            h,
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
    let h = hwnd as HWND;
    unsafe {
        if IsWindow(h) != 0 {
            let _ = SetParent(h, std::ptr::null_mut());
        }
    }
}

/// True when the widget's parent (the WorkerW) is still a valid window.
pub fn is_attached_valid(hwnd: usize) -> bool {
    let h = hwnd as HWND;
    unsafe {
        if IsWindow(h) == 0 {
            return false;
        }
        let parent = GetParent(h);
        if parent.is_null() {
            // Fallback mode: window exists, that's the definition of valid.
            return true;
        }
        IsWindow(parent) != 0
    }
}

/// Re-run the attach routine — used by the shell watcher after Explorer
/// restarts and the WorkerW is recreated.
pub fn reattach(hwnd: usize) -> DesktopLayerResult {
    let h = hwnd as HWND;
    unsafe {
        if IsWindow(h) == 0 {
            return DesktopLayerResult::NotSupported;
        }
        // Detach from any stale parent first.
        let _ = SetParent(h, std::ptr::null_mut());
    }
    attach_to_desktop(hwnd)
}

/// Apply tool-window / no-activate / transparent styling so the widget never
/// appears in the taskbar, Alt+Tab, or steals focus.
pub fn apply_desktop_window_styles(hwnd: usize) {
    let h = hwnd as HWND;
    unsafe {
        let ex = GetWindowLongW(h, GWL_EXSTYLE) as u32;
        let new_ex =
            ex | WS_EX_TOOLWINDOW as u32 | WS_EX_NOACTIVATE as u32 | WS_EX_TRANSPARENT as u32;
        let _ = SetWindowLongW(h, GWL_EXSTYLE, new_ex as i32);

        let style = GetWindowLongW(h, GWL_STYLE) as u32;
        if style & WS_POPUP as u32 == 0 {
            let _ = SetWindowLongW(h, GWL_STYLE, (style | WS_POPUP as u32) as i32);
        }
    }
}

/// Ensure the window is not above normal windows (clear WS_EX_TOPMOST).
pub fn clear_topmost(hwnd: usize) {
    let h = hwnd as HWND;
    unsafe {
        let ex = GetWindowLongPtrW(h, GWL_EXSTYLE) as usize;
        if ex & WS_EX_TOPMOST as usize != 0 {
            let _ =
                SetWindowLongPtrW(h, GWL_EXSTYLE, (ex & !(WS_EX_TOPMOST as usize)) as isize);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn attach_invalid_hwnd_is_not_supported() {
        // 0 is never a valid window; must report NotSupported, not panic.
        assert_eq!(attach_to_desktop(0), DesktopLayerResult::NotSupported);
    }
}
