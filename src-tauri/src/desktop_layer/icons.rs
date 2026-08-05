//! DPI-aware window icon restoration (Windows).
//!
//! Tauri v2's `window_builder.icon()` loads a single ICO frame and overrides
//! whatever the Windows resource compiler embedded in the `.exe`. That leaves
//! the title bar and taskbar with a downscaled icon and a blurry result at
//! non-100% scaling.
//!
//! This module re-loads the embedded group icon at the *physical pixel size the
//! current display actually needs* (via `GetDpiForWindow`) and applies it with
//! `WM_SETICON`. ICON_SMALL + ICON_SMALL2 are both set (some Windows versions
//! use one or the other for the title bar); ICON_BIG covers the taskbar.
//!
//! ## Why DPI-aware sizing
//! At 150% scaling (144 DPI) the title bar wants a 24×24 icon, not 16×16;
//! forcing 16×16 makes Windows upscale → blur. We compute
//! `(16 * dpi + 48) / 96` (MulDiv with rounding).

use std::sync::atomic::{AtomicBool, Ordering};

#[cfg(windows)]
use std::ffi::c_void;

static RESTORED: AtomicBool = AtomicBool::new(false);

/// Apply a DPI-correct icon to a window. Safe to call more than once.
#[cfg(windows)]
pub fn restore_window_icon(hwnd: usize) {
    use std::ptr;

    use windows_sys::Win32::Foundation::{LPARAM, WPARAM};
    use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows_sys::Win32::UI::HiDpi::GetDpiForWindow;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        LoadImageW, SendMessageW, ICON_BIG, ICON_SMALL, ICON_SMALL2, IMAGE_ICON, LR_DEFAULTCOLOR,
        WM_SETICON,
    };

    const RT_GROUP_ICON: *const u16 = 32512 as *const u16;

    let hw = hwnd as *mut c_void;
    if hw.is_null() {
        return;
    }

    unsafe {
        let hinst = GetModuleHandleW(ptr::null());
        if hinst.is_null() {
            return;
        }

        let dpi = GetDpiForWindow(hw);
        // Title bar: 16 logical px; taskbar: 32 logical px. MulDiv rounding.
        let title_size = (((16i32 * dpi as i32) + 48) / 96).max(16).clamp(16, 64);
        let task_size = (((32i32 * dpi as i32) + 48) / 96).max(32).clamp(32, 96);

        let icon_title = LoadImageW(
            hinst,
            RT_GROUP_ICON,
            IMAGE_ICON,
            title_size,
            title_size,
            LR_DEFAULTCOLOR,
        );
        let icon_task = LoadImageW(
            hinst,
            RT_GROUP_ICON,
            IMAGE_ICON,
            task_size,
            task_size,
            LR_DEFAULTCOLOR,
        );

        if !icon_title.is_null() {
            let _ = SendMessageW(hw, WM_SETICON, ICON_SMALL as WPARAM, icon_title as LPARAM);
            let _ = SendMessageW(hw, WM_SETICON, ICON_SMALL2 as WPARAM, icon_title as LPARAM);
        }
        if !icon_task.is_null() {
            let _ = SendMessageW(hw, WM_SETICON, ICON_BIG as WPARAM, icon_task as LPARAM);
        }
    }

    RESTORED.store(true, Ordering::SeqCst);
}

/// Non-Windows no-op.
#[cfg(not(windows))]
pub fn restore_window_icon(_hwnd: usize) {}

/// Whether the icon has been applied at least once (for tests / diagnostics).
pub fn icon_restored() -> bool {
    RESTORED.load(Ordering::SeqCst)
}

/// Reset the flag (tests).
pub fn reset_icon_state() {
    RESTORED.store(false, Ordering::SeqCst);
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The DPI sizing formula: title bar 16 logical px, MulDiv with rounding.
    fn title_size(dpi: u32) -> i32 {
        (((16i32 * dpi as i32) + 48) / 96).max(16).clamp(16, 64)
    }

    fn task_size(dpi: u32) -> i32 {
        (((32i32 * dpi as i32) + 48) / 96).max(32).clamp(32, 96)
    }

    #[test]
    fn title_icon_sizes_follow_dpi() {
        // 100% (96 dpi) → 16; 125% (120) → 20; 150% (144) → 24; 200% (192) → 32.
        assert_eq!(title_size(96), 16);
        assert_eq!(title_size(120), 20);
        assert_eq!(title_size(144), 24);
        assert_eq!(title_size(192), 32);
    }

    #[test]
    fn taskbar_icon_sizes_follow_dpi() {
        assert_eq!(task_size(96), 32);
        assert_eq!(task_size(120), 40);
        assert_eq!(task_size(144), 48);
        assert_eq!(task_size(192), 64);
    }

    #[test]
    fn sizes_are_clamped() {
        assert!(title_size(0) <= 64);
        assert!(title_size(500) <= 64);
        assert!(task_size(500) <= 96);
    }

    #[test]
    fn flag_resets() {
        reset_icon_state();
        assert!(!icon_restored());
    }
}
