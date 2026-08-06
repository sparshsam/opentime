//! Tauri command surface.
//!
//! Deliberately narrow: every command is validated on the Rust side, and no
//! command exposes arbitrary shell execution or unchecked filesystem access.

use std::str::FromStr;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::display_manager;
use crate::persistence::db::Database;
use crate::persistence::models::*;
use crate::persistence::queries;

#[cfg(test)]
mod config_tests;
use crate::startup;
use crate::window_manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetUpdatePayload {
    pub widget: WidgetRecord,
}

fn valid_timezone(id: &str) -> bool {
    id == "UTC" || known_zone(id) || chrono_tz::Tz::from_str(id).is_ok()
}

/// Accepts IANA ids; chrono-tz covers most. `known_zone` is a small allowlist
/// fallback for zones chrono-tz names differently (e.g. "America/Buenos_Aires"
/// → "America/Argentina/Buenos_Aires").
fn known_zone(id: &str) -> bool {
    matches!(
        id,
        "America/Buenos_Aires"
            | "America/Montreal"
            | "America/Calgary"
            | "America/Halifax"
            | "America/Phoenix"
            | "America/Anchorage"
            | "Asia/Kolkata"
            | "Asia/Kathmandu"
            | "Australia/Brisbane"
            | "Australia/Perth"
            | "Australia/Adelaide"
            | "Australia/Darwin"
            | "Pacific/Chatham"
            | "Pacific/Honolulu"
    )
}

// ── Settings ──────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_settings(db: State<'_, Database>) -> Result<AppSettings, String> {
    queries::get_settings(&db)
}

#[tauri::command]
pub fn update_settings(
    db: State<'_, Database>,
    settings: AppSettings,
) -> Result<AppSettings, String> {
    // Validate sensible ranges.
    if !matches!(settings.default_hour_cycle, 12 | 24) {
        return Err("default_hour_cycle must be 12 or 24".into());
    }
    if settings.manager_width < 600 || settings.manager_height < 400 {
        return Err("manager size too small".into());
    }
    queries::update_settings(&db, &settings)
}

// ── Widgets ───────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_widgets(db: State<'_, Database>) -> Result<Vec<WidgetRecord>, String> {
    queries::list_widgets(&db)
}

/// Create a clock with the current default zone/design (used by "Add Clock"
/// in the manager and the tray).
#[tauri::command]
pub fn add_widget(app: AppHandle, db: State<'_, Database>) -> Result<WidgetRecord, String> {
    let settings = queries::get_settings(&db)?;
    let input = CreateWidgetInput {
        design_id: settings.default_design_id.clone(),
        timezone_id: crate::commands::system_zone(),
        label: None,
        hour_cycle: None,
        show_seconds: None,
        show_date: None,
        show_timezone_label: None,
        display_id: None,
        x: None,
        y: None,
    };
    create_widget(app, db, input)
}

#[tauri::command]
pub fn get_widget(db: State<'_, Database>, id: String) -> Result<Option<WidgetRecord>, String> {
    queries::get_widget(&db, &id)
}

#[tauri::command]
pub fn create_widget(
    app: AppHandle,
    db: State<'_, Database>,
    input: CreateWidgetInput,
) -> Result<WidgetRecord, String> {
    if !valid_timezone(&input.timezone_id) {
        return Err(format!("invalid timezone: {}", input.timezone_id));
    }
    if !valid_design(&input.design_id) {
        return Err(format!("invalid design: {}", input.design_id));
    }

    let settings = queries::get_settings(&db)?;
    let now = crate::commands::now_iso();
    let id = uuid::Uuid::new_v4().to_string();

    // Default placement: near the top-right of the primary display.
    let (x, y) = default_position();
    let width = 320.0;
    let height = 160.0;

    let widget = WidgetRecord {
        id: id.clone(),
        widget_type: "clock".into(),
        design_id: input.design_id.clone(),
        timezone_id: input.timezone_id.clone(),
        label: input
            .label
            .clone()
            .unwrap_or_else(|| input.timezone_id.clone()),
        hour_cycle: input.hour_cycle.unwrap_or(settings.default_hour_cycle),
        show_seconds: input.show_seconds.unwrap_or(false),
        show_date: input.show_date.unwrap_or(true),
        show_timezone_label: input.show_timezone_label.unwrap_or(true),
        appearance: default_appearance(&settings),
        display_id: input.display_id.clone().unwrap_or_else(|| "primary".into()),
        logical_x: input.x.unwrap_or(x),
        logical_y: input.y.unwrap_or(y),
        logical_width: width,
        logical_height: height,
        scale: 1.0,
        opacity: 1.0,
        locked: false,
        hidden: false,
        world_rows: Vec::new(),
        created_at: now.clone(),
        updated_at: now,
    };

    queries::insert_widget(&db, &widget)?;
    window_manager::create_widget_window(&app, &widget)?;
    Ok(widget)
}

#[tauri::command]
pub fn update_widget(
    app: AppHandle,
    db: State<'_, Database>,
    input: UpdateWidgetInput,
) -> Result<WidgetRecord, String> {
    // Validate timezone/design if present in the patch.
    if let Some(tz) = input.patch.get("timezone_id").and_then(|v| v.as_str()) {
        if !valid_timezone(tz) {
            return Err(format!("invalid timezone: {tz}"));
        }
    }
    if let Some(d) = input.patch.get("design_id").and_then(|v| v.as_str()) {
        if !valid_design(d) {
            return Err(format!("invalid design: {d}"));
        }
    }
    let updated = queries::update_widget(&db, &input.id, &input.patch)?;
    // Recreate or refresh the widget window if geometry/visibility changed.
    let _ = window_manager::set_widget_visibility(&app, &input.id, !updated.hidden);
    window_manager::push_widget_update(&app, &updated);
    Ok(updated)
}

#[tauri::command]
pub fn delete_widget(app: AppHandle, db: State<'_, Database>, id: String) -> Result<(), String> {
    queries::delete_widget(&db, &id)?;
    window_manager::destroy_widget_window(&app, &id)?;
    Ok(())
}

#[tauri::command]
pub fn duplicate_widget(
    app: AppHandle,
    db: State<'_, Database>,
    id: String,
) -> Result<DuplicateWidgetResult, String> {
    let res = queries::duplicate_widget(&db, &id)?;
    window_manager::create_widget_window(&app, &res.widget)?;
    Ok(res)
}

#[tauri::command]
pub fn save_widget_geometry(
    db: State<'_, Database>,
    id: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<WidgetRecord, String> {
    if !(width.is_finite() && height.is_finite() && x.is_finite() && y.is_finite()) {
        return Err("non-finite geometry".into());
    }
    queries::update_widget_geometry(&db, &id, x, y, width.max(120.0), height.max(80.0))
}

// ── Window / display commands ─────────────────────────────────────────────

#[tauri::command]
pub fn list_monitors() -> Vec<MonitorInfo> {
    display_manager::list_monitors()
}

#[tauri::command]
pub fn drag_widget(app: AppHandle, widget_id: String, dx: f64, dy: f64) -> Result<(), String> {
    let label = window_manager::widget_label(&widget_id);
    if let Some(win) = app.get_webview_window(&label) {
        let pos = win.outer_position().map_err(|e| format!("pos: {e}"))?;
        win.set_position(tauri::LogicalPosition::new(
            pos.x as f64 + dx,
            pos.y as f64 + dy,
        ))
        .map_err(|e| format!("move: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub fn resize_widget(
    app: AppHandle,
    widget_id: String,
    width: f64,
    height: f64,
) -> Result<(), String> {
    let label = window_manager::widget_label(&widget_id);
    if let Some(win) = app.get_webview_window(&label) {
        win.set_size(tauri::LogicalSize::new(
            width.clamp(120.0, 2400.0),
            height.clamp(80.0, 1600.0),
        ))
        .map_err(|e| format!("resize: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub fn hide_widget(app: AppHandle, widget_id: String) -> Result<(), String> {
    window_manager::set_widget_visibility(&app, &widget_id, false)
}

#[tauri::command]
pub fn show_widget(app: AppHandle, widget_id: String) -> Result<(), String> {
    window_manager::set_widget_visibility(&app, &widget_id, true)
}

#[tauri::command]
pub fn open_manager(app: AppHandle) -> Result<(), String> {
    window_manager::open_manager(&app)
}

#[tauri::command]
pub fn close_manager(app: AppHandle) -> Result<(), String> {
    window_manager::hide_manager(&app)
}

#[tauri::command]
pub fn confirm_remove_widget(app: AppHandle, widget_id: String) -> Result<(), String> {
    // Frontend confirms via dialog; here we just destroy the window. The
    // record removal is handled by the manager's remove action.
    window_manager::destroy_widget_window(&app, &widget_id)
}

#[tauri::command]
pub fn destroy_widget_window(app: AppHandle, widget_id: String) -> Result<(), String> {
    window_manager::destroy_widget_window(&app, &widget_id)
}

#[tauri::command]
pub fn move_widget_next_display(app: AppHandle, widget_id: String) -> Result<(), String> {
    let label = window_manager::widget_label(&widget_id);
    let monitors = display_manager::list_monitors();
    if monitors.is_empty() {
        return Err("no monitors".into());
    }
    if let Some(win) = app.get_webview_window(&label) {
        let pos = win.outer_position().map_err(|e| format!("pos: {e}"))?;
        // Find current monitor index, move to next.
        let current = monitors
            .iter()
            .position(|m| {
                let (mx, my, mw, mh) = (m.x as f64, m.y as f64, m.width as f64, m.height as f64);
                (pos.x as f64) >= mx
                    && (pos.x as f64) < mx + mw
                    && (pos.y as f64) >= my
                    && (pos.y as f64) < my + mh
            })
            .unwrap_or(0);
        let next = monitors[(current + 1) % monitors.len()].clone();
        let nx = next.x as f64 + 40.0;
        let ny = next.y as f64 + 40.0;
        win.set_position(tauri::LogicalPosition::new(nx, ny))
            .map_err(|e| format!("move to display: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
pub fn reset_widget_positions(db: State<'_, Database>) -> Result<(), String> {
    let widgets = queries::list_widgets(&db)?;
    let (x, y) = default_position();
    for w in &widgets {
        let _ =
            queries::update_widget_geometry(&db, &w.id, x, y, w.logical_width, w.logical_height);
    }
    Ok(())
}

#[tauri::command]
pub fn export_diagnostics(db: State<'_, Database>) -> Result<String, String> {
    let settings = queries::get_settings(&db)?;
    let widgets = queries::list_widgets(&db)?;
    let info = format!(
        "OpenTime diagnostics\nversion: {}\nwidgets: {}\nschema_version: {}\n",
        env!("CARGO_PKG_VERSION"),
        widgets.len(),
        settings.schema_version,
    );
    Ok(info)
}

// ── Startup commands ──────────────────────────────────────────────────────

#[tauri::command]
pub fn get_startup_enabled() -> bool {
    startup::is_startup_enabled()
}

#[tauri::command]
pub fn set_startup_enabled(enabled: bool) -> Result<bool, String> {
    startup::set_startup_enabled(enabled)
}

// ── Migration ─────────────────────────────────────────────────────────────

#[tauri::command]
pub fn migrate(db: State<'_, Database>) -> Result<i64, String> {
    db.run_migrations()
}

// ── Helpers ───────────────────────────────────────────────────────────────

fn valid_design(id: &str) -> bool {
    matches!(
        id,
        "minimal-digital"
            | "editorial"
            | "classic-led"
            | "flip"
            | "terminal"
            | "soft-panel"
            | "compact"
            | "classic-analog"
            | "minimal-analog"
            | "roman-analog"
            | "railway-analog"
            | "modern-analog"
            | "numeral-free-analog"
            | "world-clock-panel"
    )
}

fn default_position() -> (f64, f64) {
    if let Some(primary) = display_manager::primary_monitor() {
        let x = primary.x as f64 + primary.width as f64 - 320.0 - 24.0;
        let y = primary.y as f64 + 24.0;
        (x.max(primary.x as f64), y.max(primary.y as f64))
    } else {
        (24.0, 24.0)
    }
}

fn default_appearance(settings: &AppSettings) -> AppearanceConfig {
    AppearanceConfig {
        preset_id: settings.default_preset_id.clone(),
        primary_color: None,
        secondary_color: None,
        hand_color: None,
        marker_color: None,
        background_color: None,
        border_color: None,
        opacity: 1.0,
        corner_radius: 12,
        shadow_strength: 0.0,
        alignment: "center".into(),
        spacing: 4,
        scale: 1.0,
        numeral_style: "arabic".into(),
        font_style: "geometric-sans".into(),
    }
}

/// The local system zone as an IANA id (fallback: America/Toronto).
pub fn system_zone() -> String {
    if let Ok(tz) = std::env::var("TZ") {
        if !tz.is_empty() && tz != "UTC" {
            return tz;
        }
    }
    "America/Toronto".to_string()
}

pub fn now_iso() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let days = secs / 86400;
    let h = (secs % 86400) / 3600;
    let m = (secs % 3600) / 60;
    let s = secs % 60;
    format!("{days:07}-{h:02}:{m:02}:{s:02}Z")
}
