//! Window manager — creates, restores, positions and closes widget windows
//! and the manager window.
//!
//! Each widget is a separate borderless, transparent, tool-window webview. The
//! manager is a conventional window. Closing the manager hides it (does not
//! quit); quitting is only ever triggered from the tray.

use tauri::{AppHandle, Emitter, Manager, WebviewWindowBuilder};

use crate::persistence::models::WidgetRecord;
use crate::persistence::queries;

/// Prefix for widget window labels (also used to resolve boot context).
pub const WIDGET_PREFIX: &str = "widget-";
pub const MANAGER_LABEL: &str = "manager";

pub fn widget_label(id: &str) -> String {
    format!("{WIDGET_PREFIX}{id}")
}

/// Create (or focus) the manager window.
pub fn open_manager(app: &AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window(MANAGER_LABEL) {
        let _ = w.show();
        let _ = w.set_focus();
        return Ok(());
    }
    let win = WebviewWindowBuilder::new(
        app,
        MANAGER_LABEL,
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("OpenTime")
    .inner_size(1080.0, 720.0)
    .min_inner_size(760.0, 520.0)
    .center()
    .build()
    .map_err(|e| format!("create manager: {e}"))?;
    let _ = win.show();
    Ok(())
}

/// Create a widget window for a persisted widget record and attach it to the
/// desktop layer.
pub fn create_widget_window(app: &AppHandle, widget: &WidgetRecord) -> Result<String, String> {
    let label = widget_label(&widget.id);
    if app.get_webview_window(&label).is_some() {
        return Ok(label); // already exists
    }

    let win = WebviewWindowBuilder::new(app, &label, tauri::WebviewUrl::App("index.html".into()))
        .title("OpenTime Clock")
        .inner_size(
            widget.logical_width.max(120.0),
            widget.logical_height.max(80.0),
        )
        .position(widget.logical_x, widget.logical_y)
        .decorations(false)
        .transparent(true)
        .skip_taskbar(true)
        .resizable(true)
        .shadow(false)
        .visible(false) // shown after attach
        .build()
        .map_err(|e| format!("create widget window: {e}"))?;

    // Native desktop-layer attach (Windows). On other platforms this is a no-op.
    #[cfg(windows)]
    {
        use crate::desktop_layer::{attach_to_desktop, DesktopLayerResult};
        if let Ok(hwnd) = win.hwnd() {
            let result = attach_to_desktop(hwnd.0 as usize);
            match result {
                DesktopLayerResult::Attached | DesktopLayerResult::Fallback => {
                    crate::shell_monitor::register(hwnd.0 as usize);
                }
                DesktopLayerResult::NotSupported => {}
            }
        }
    }

    if !widget.hidden {
        let _ = win.show();
    }

    // Emit the record so the widget window can load its state.
    let _ = app.emit(
        "widget-updated",
        crate::commands::WidgetUpdatePayload {
            widget: widget.clone(),
        },
    );

    Ok(label)
}

/// Recreate all widget windows from persisted state (startup, Explorer restart).
pub fn restore_all_widgets(app: &AppHandle) -> Result<usize, String> {
    let db = app.state::<crate::persistence::db::Database>();
    let widgets = queries::list_widgets(&db).map_err(|e| format!("list widgets: {e}"))?;
    let mut count = 0;
    for w in &widgets {
        if w.hidden {
            continue;
        }
        if create_widget_window(app, w).is_ok() {
            count += 1;
        }
    }
    Ok(count)
}

/// Close (destroy) a widget window, detaching from the desktop layer first.
pub fn destroy_widget_window(app: &AppHandle, widget_id: &str) -> Result<(), String> {
    let label = widget_label(widget_id);
    if let Some(win) = app.get_webview_window(&label) {
        #[cfg(windows)]
        {
            if let Ok(hwnd) = win.hwnd() {
                crate::desktop_layer::detach_from_desktop(hwnd.0 as usize);
                crate::shell_monitor::unregister(hwnd.0 as usize);
            }
        }
        win.close().map_err(|e| format!("close widget: {e}"))?;
    }
    Ok(())
}

/// Show or hide a widget window (no-op if missing).
pub fn set_widget_visibility(
    app: &AppHandle,
    widget_id: &str,
    visible: bool,
) -> Result<(), String> {
    let label = widget_label(widget_id);
    if let Some(win) = app.get_webview_window(&label) {
        if visible {
            let _ = win.show();
        } else {
            let _ = win.hide();
        }
    }
    Ok(())
}

/// Hide the manager window (does NOT quit the app).
pub fn hide_manager(app: &AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window(MANAGER_LABEL) {
        let _ = win.hide();
    }
    Ok(())
}

/// Send the current widget record to its window (after an update).
pub fn push_widget_update(app: &AppHandle, widget: &WidgetRecord) {
    let _ = app.emit(
        "widget-updated",
        crate::commands::WidgetUpdatePayload {
            widget: widget.clone(),
        },
    );
}
