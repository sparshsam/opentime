//! OpenTime Tauri application.

pub mod commands;
pub mod desktop_layer;
pub mod display_manager;
pub mod manager;
pub mod persistence;
pub mod shell_monitor;
pub mod startup;
pub mod window_manager;

use tauri::{App, AppHandle, Listener, Manager, RunEvent, WindowEvent};

use persistence::db::Database;
use persistence::models::{AppSettings, AppearanceConfig, WidgetRecord};
use persistence::queries;

/// Locate the SQLite database path (app-data dir).
fn db_path(app: &App) -> Result<std::path::PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app data dir: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("create data dir: {e}"))?;
    Ok(dir.join("opentime.sqlite"))
}

fn ensure_managed_state(app: &App) -> Result<(), String> {
    let db = Database::open(&db_path(app)?)?;
    app.manage(db);
    Ok(())
}

/// The local system zone as an IANA id (fallback: America/Toronto).
fn system_zone() -> String {
    commands::system_zone()
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

fn now_iso() -> String {
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

/// Build a WidgetRecord for a brand-new clock using defaults + placement.
fn build_default_widget(
    app: &AppHandle,
    settings: &AppSettings,
    timezone_id: &str,
) -> WidgetRecord {
    let now = now_iso();
    let id = uuid::Uuid::new_v4().to_string();
    let (x, y) = default_position(app);
    WidgetRecord {
        id,
        widget_type: "clock".into(),
        design_id: settings.default_design_id.clone(),
        timezone_id: timezone_id.to_string(),
        label: timezone_id.to_string(),
        hour_cycle: settings.default_hour_cycle,
        show_seconds: false,
        show_date: true,
        show_timezone_label: true,
        appearance: default_appearance(settings),
        display_id: "primary".into(),
        logical_x: x,
        logical_y: y,
        logical_width: 320.0,
        logical_height: 160.0,
        scale: 1.0,
        opacity: 1.0,
        locked: false,
        hidden: false,
        world_rows: Vec::new(),
        created_at: now.clone(),
        updated_at: now,
    }
}

fn default_position(_app: &AppHandle) -> (f64, f64) {
    if let Some(primary) = display_manager::primary_monitor() {
        let x = primary.x as f64 + primary.width as f64 - 320.0 - 24.0;
        let y = primary.y as f64 + 24.0;
        (x.max(primary.x as f64), y.max(primary.y as f64))
    } else {
        (24.0, 24.0)
    }
}

/// First-run: create a default Minimal Digital clock in the local timezone
/// near the top-right of the primary display, and mark onboarding done.
fn ensure_first_run(app: &AppHandle) -> Result<(), String> {
    let db = app.state::<Database>();
    let settings = queries::get_settings(&db)?;
    if settings.first_run_complete {
        return Ok(());
    }

    let widget = build_default_widget(app, &settings, &system_zone());
    queries::insert_widget(&db, &widget)?;
    let _ = window_manager::create_widget_window(app, &widget);

    let mut updated = settings;
    updated.first_run_complete = true;
    let _ = queries::update_settings(&db, &updated);
    Ok(())
}

/// Tray "Add Clock" → create a clock in the default zone/design.
fn add_clock_from_tray(app: &AppHandle) -> Result<WidgetRecord, String> {
    let db = app.state::<Database>();
    commands::add_widget(app.clone(), db)
}

/// Apply a visibility/lock action to every widget.
fn apply_tray_action_all(app: &AppHandle, action: &str) -> Result<(), String> {
    let db = app.state::<Database>();
    let widgets = queries::list_widgets(&db)?;
    for w in &widgets {
        match action {
            "lock" => {
                let _ = queries::update_widget(&db, &w.id, &serde_json::json!({ "locked": true }));
            }
            "unlock" => {
                let _ = queries::update_widget(&db, &w.id, &serde_json::json!({ "locked": false }));
            }
            "hide" => {
                let _ = queries::update_widget(&db, &w.id, &serde_json::json!({ "hidden": true }));
                let _ = window_manager::set_widget_visibility(app, &w.id, false);
            }
            "show" => {
                let _ = queries::update_widget(&db, &w.id, &serde_json::json!({ "hidden": false }));
                let _ = window_manager::set_widget_visibility(app, &w.id, true);
            }
            _ => {}
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Duplicate-process prevention: a second launch focuses the existing
        // instance's manager instead of spawning a parallel process.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = window_manager::open_manager(&app);
        }))
        .setup(|app| {
            ensure_managed_state(app)?;
            ensure_first_run(app.handle())?;

            // Recreate widget windows from persistence.
            let _ = window_manager::restore_all_widgets(app.handle());

            // Start the shell monitor (Explorer-restart recovery).
            shell_monitor::start(std::time::Duration::from_secs(3));

            // Build the tray.
            manager::tray::build_tray(app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::update_settings,
            commands::list_widgets,
            commands::get_widget,
            commands::add_widget,
            commands::create_widget,
            commands::update_widget,
            commands::delete_widget,
            commands::duplicate_widget,
            commands::save_widget_geometry,
            commands::list_monitors,
            commands::drag_widget,
            commands::resize_widget,
            commands::hide_widget,
            commands::show_widget,
            commands::open_manager,
            commands::close_manager,
            commands::confirm_remove_widget,
            commands::destroy_widget_window,
            commands::move_widget_next_display,
            commands::reset_widget_positions,
            commands::export_diagnostics,
            commands::get_startup_enabled,
            commands::set_startup_enabled,
            commands::migrate,
        ])
        .on_window_event(|window, event| {
            if window.label() == window_manager::MANAGER_LABEL {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    // Closing the manager hides it to the tray, not quit.
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error building OpenTime")
        .run(|app_handle, event| {
            if let RunEvent::Ready = event {
                // Each handler receives its own clone; the closure captures a
                // fresh clone so no move-out-of-borrow occurs.
                let handler = |event: &str, action: fn(&AppHandle) -> Result<(), String>| {
                    let h = app_handle.clone();
                    let h_in = h.clone();
                    h.listen(event, move |_| {
                        let h = h_in.clone();
                        tauri::async_runtime::spawn(async move {
                            let _ = action(&h);
                        });
                    });
                };
                handler("tray-add-clock", |app| {
                    let _ = add_clock_from_tray(app)?;
                    Ok(())
                });
                handler("tray-lock-all", |app| apply_tray_action_all(app, "lock"));
                handler("tray-unlock-all", |app| {
                    apply_tray_action_all(app, "unlock")
                });
                handler("tray-hide-all", |app| apply_tray_action_all(app, "hide"));
                handler("tray-show-all", |app| apply_tray_action_all(app, "show"));
            }
        });
}
