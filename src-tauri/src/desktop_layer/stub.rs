//! Non-Windows stub. Widgets are ordinary windows; there is no desktop layer.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DesktopLayerResult {
    Attached,
    Fallback,
    NotSupported,
}

/// No-op on non-Windows platforms.
pub fn attach_to_desktop(_hwnd: usize) -> DesktopLayerResult {
    DesktopLayerResult::NotSupported
}

/// No-op.
pub fn detach_from_desktop(_hwnd: usize) {}

/// Returns true when the desktop surface the widget is attached to still exists.
pub fn is_attached_valid(_hwnd: usize) -> bool {
    true
}

/// Re-run the attach routine (Explorer restart recovery). No-op on non-Windows.
pub fn reattach(_hwnd: usize) -> DesktopLayerResult {
    DesktopLayerResult::NotSupported
}

/// Apply tool-window / no-activate styling. No-op on non-Windows.
pub fn apply_desktop_window_styles(_hwnd: usize) {}
