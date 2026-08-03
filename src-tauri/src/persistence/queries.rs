//! Query layer over the SQLite connection. Each function takes the database,
//! locks the connection for the duration of the statement, and maps rows to
//! serde models. Input validation (IANA ids, design ids, dimensions) lives in
//! the commands layer.

use std::time::{SystemTime, UNIX_EPOCH};

use rusqlite::params;
use uuid::Uuid;

use super::db::Database;
use super::models::*;

fn now_iso() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    // ISO-ish UTC timestamp; sufficient for ordering and display fallback.
    let days = secs / 86400;
    let h = (secs % 86400) / 3600;
    let m = (secs % 3600) / 60;
    let s = secs % 60;
    // 1970-01-01 + days (approx, ignoring month rollover for uniqueness).
    format!("{days:07}-{h:02}:{m:02}:{s:02}Z")
}

fn appearance_to_json(a: &AppearanceConfig) -> Result<String, String> {
    serde_json::to_string(a).map_err(|e| format!("serialize appearance: {e}"))
}

fn appearance_from_json(s: &str) -> AppearanceConfig {
    serde_json::from_str(s).unwrap_or_else(|_| AppearanceConfig {
        preset_id: "dark".into(),
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
    })
}

fn world_rows_from_json(s: &str) -> Vec<WorldClockRow> {
    serde_json::from_str(s).unwrap_or_default()
}

fn row_to_widget(row: &rusqlite::Row) -> rusqlite::Result<WidgetRecord> {
    let appearance_json: String = row.get("appearance")?;
    let appearance = appearance_from_json(&appearance_json);
    let world_rows_json: String = row.get("world_rows").unwrap_or_else(|_| "[]".to_string());
    Ok(WidgetRecord {
        id: row.get("id")?,
        widget_type: row.get("widget_type")?,
        design_id: row.get("design_id")?,
        timezone_id: row.get("timezone_id")?,
        label: row.get("label")?,
        hour_cycle: row.get("hour_cycle")?,
        show_seconds: row.get("show_seconds")?,
        show_date: row.get("show_date")?,
        show_timezone_label: row.get("show_timezone_label")?,
        appearance,
        display_id: row.get("display_id")?,
        logical_x: row.get("logical_x")?,
        logical_y: row.get("logical_y")?,
        logical_width: row.get("logical_width")?,
        logical_height: row.get("logical_height")?,
        scale: row.get("scale")?,
        opacity: row.get("opacity")?,
        locked: row.get("locked")?,
        hidden: row.get("hidden")?,
        world_rows: world_rows_from_json(&world_rows_json),
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
    })
}

// ── Settings ──────────────────────────────────────────────────────────────

pub fn get_settings(db: &Database) -> Result<AppSettings, String> {
    // Read the schema version WITHOUT holding the connection lock — calling
    // schema_version() inside the row closure below would deadlock on the same
    // mutex (std Mutex is not reentrant).
    let schema_version = db.schema_version().unwrap_or(0);
    let conn = db.conn.lock().unwrap();
    conn.query_row(
        "SELECT startup_enabled, default_hour_cycle, default_locale, default_design_id,
                default_preset_id, manager_x, manager_y, manager_width, manager_height,
                all_widgets_hidden, launch_manager_at_startup, restore_hidden_widgets,
                reduced_motion, high_contrast, first_run_complete
         FROM settings WHERE id = 1",
        [],
        |r| {
            Ok(AppSettings {
                startup_enabled: r.get(0)?,
                default_hour_cycle: r.get(1)?,
                default_locale: r.get(2)?,
                default_design_id: r.get(3)?,
                default_preset_id: r.get(4)?,
                manager_x: r.get(5)?,
                manager_y: r.get(6)?,
                manager_width: r.get(7)?,
                manager_height: r.get(8)?,
                all_widgets_hidden: r.get(9)?,
                launch_manager_at_startup: r.get(10)?,
                restore_hidden_widgets: r.get(11)?,
                reduced_motion: r.get(12)?,
                high_contrast: r.get(13)?,
                first_run_complete: r.get(14)?,
                schema_version,
            })
        },
    )
    .map_err(|e| format!("get settings: {e}"))
}

pub fn update_settings(db: &Database, s: &AppSettings) -> Result<AppSettings, String> {
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "UPDATE settings SET startup_enabled=?1, default_hour_cycle=?2, default_locale=?3,
                default_design_id=?4, default_preset_id=?5, manager_x=?6, manager_y=?7,
                manager_width=?8, manager_height=?9, all_widgets_hidden=?10,
                launch_manager_at_startup=?11, restore_hidden_widgets=?12,
                reduced_motion=?13, high_contrast=?14, first_run_complete=?15
         WHERE id = 1",
        params![
            s.startup_enabled,
            s.default_hour_cycle,
            s.default_locale,
            s.default_design_id,
            s.default_preset_id,
            s.manager_x,
            s.manager_y,
            s.manager_width,
            s.manager_height,
            s.all_widgets_hidden,
            s.launch_manager_at_startup,
            s.restore_hidden_widgets,
            s.reduced_motion,
            s.high_contrast,
            s.first_run_complete,
        ],
    )
    .map_err(|e| format!("update settings: {e}"))?;
    drop(conn);
    get_settings(db)
}

// ── Widgets ───────────────────────────────────────────────────────────────

pub fn list_widgets(db: &Database) -> Result<Vec<WidgetRecord>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM widgets ORDER BY created_at")
        .map_err(|e| format!("prepare list: {e}"))?;
    let rows = stmt
        .query_map([], row_to_widget)
        .map_err(|e| format!("query list: {e}"))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r.map_err(|e| format!("row: {e}"))?);
    }
    Ok(out)
}

pub fn get_widget(db: &Database, id: &str) -> Result<Option<WidgetRecord>, String> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM widgets WHERE id = ?1")
        .map_err(|e| format!("prepare get: {e}"))?;
    let mut rows = stmt
        .query_map(params![id], row_to_widget)
        .map_err(|e| format!("query get: {e}"))?;
    rows.next().transpose().map_err(|e| format!("row: {e}"))
}

pub fn insert_widget(db: &Database, w: &WidgetRecord) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    let appearance_json = appearance_to_json(&w.appearance)?;
    let world_rows_json =
        serde_json::to_string(&w.world_rows).map_err(|e| format!("serialize world_rows: {e}"))?;
    conn.execute(
        "INSERT INTO widgets (id, widget_type, design_id, timezone_id, label, hour_cycle,
                show_seconds, show_date, show_timezone_label, appearance, display_id,
                logical_x, logical_y, logical_width, logical_height, scale, opacity,
                locked, hidden, world_rows, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22)",
        params![
            w.id,
            w.widget_type,
            w.design_id,
            w.timezone_id,
            w.label,
            w.hour_cycle,
            w.show_seconds,
            w.show_date,
            w.show_timezone_label,
            appearance_json,
            w.display_id,
            w.logical_x,
            w.logical_y,
            w.logical_width,
            w.logical_height,
            w.scale,
            w.opacity,
            w.locked,
            w.hidden,
            world_rows_json,
            w.created_at,
            w.updated_at,
        ],
    )
    .map_err(|e| format!("insert widget: {e}"))?;
    Ok(())
}

pub fn update_widget(
    db: &Database,
    id: &str,
    patch: &serde_json::Value,
) -> Result<WidgetRecord, String> {
    // Build a dynamic UPDATE from the JSON patch, whitelisting fields.
    // All placeholders are positional `?`; the first is `updated_at`.
    let conn = db.conn.lock().unwrap();
    let mut sql = String::from("UPDATE widgets SET updated_at = ?");
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    params.push(Box::new(now_iso()));

    let mut set = |field: &str, value: serde_json::Value| -> Result<(), String> {
        match field {
            "design_id" | "timezone_id" | "label" | "display_id" => {
                if let Some(s) = value.as_str() {
                    sql.push_str(&format!(", {field} = ?"));
                    params.push(Box::new(s.to_string()));
                }
            }
            "hour_cycle" => {
                if let Some(n) = value.as_i64() {
                    sql.push_str(&format!(", {field} = ?"));
                    params.push(Box::new(n));
                }
            }
            "show_seconds" | "show_date" | "show_timezone_label" | "locked" | "hidden" => {
                if let Some(b) = value.as_bool() {
                    sql.push_str(&format!(", {field} = ?"));
                    params.push(Box::new(b));
                }
            }
            "world_rows" => {
                if let Ok(json) = serde_json::to_string(&value) {
                    sql.push_str(", world_rows = ?");
                    params.push(Box::new(json));
                }
            }
            "logical_x" | "logical_y" | "logical_width" | "logical_height" | "scale"
            | "opacity" => {
                if let Some(f) = value.as_f64() {
                    sql.push_str(&format!(", {field} = ?"));
                    params.push(Box::new(f));
                }
            }
            _ => {}
        }
        Ok(())
    };

    if let Some(obj) = patch.as_object() {
        for (k, v) in obj {
            set(k, v.clone())?;
        }
    }
    sql.push_str(" WHERE id = ?");
    params.push(Box::new(id.to_string()));

    conn.execute(
        &sql,
        rusqlite::params_from_iter(params.iter().map(|b| b.as_ref())),
    )
    .map_err(|e| format!("update widget: {e}"))?;
    drop(conn);
    get_widget(db, id)?.ok_or_else(|| "widget not found after update".to_string())
}

pub fn delete_widget(db: &Database, id: &str) -> Result<(), String> {
    let conn = db.conn.lock().unwrap();
    conn.execute("DELETE FROM widgets WHERE id = ?1", params![id])
        .map_err(|e| format!("delete widget: {e}"))?;
    Ok(())
}

pub fn duplicate_widget(db: &Database, id: &str) -> Result<DuplicateWidgetResult, String> {
    let src = get_widget(db, id)?.ok_or_else(|| "widget not found".to_string())?;
    let new_id = Uuid::new_v4().to_string();
    let mut copy = src.clone();
    copy.id = new_id.clone();
    copy.label = format!("{} (copy)", src.label);
    copy.created_at = now_iso();
    copy.updated_at = now_iso();
    // Offset the copy slightly so it doesn't sit exactly on the original.
    copy.logical_x += 24.0;
    copy.logical_y += 24.0;
    insert_widget(db, &copy)?;
    Ok(DuplicateWidgetResult {
        original_id: id.to_string(),
        new_id,
        widget: copy,
    })
}

pub fn update_widget_geometry(
    db: &Database,
    id: &str,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<WidgetRecord, String> {
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "UPDATE widgets SET logical_x=?1, logical_y=?2, logical_width=?3,
                logical_height=?4, updated_at=?5 WHERE id=?6",
        params![x, y, width, height, now_iso(), id],
    )
    .map_err(|e| format!("update geometry: {e}"))?;
    drop(conn);
    get_widget(db, id)?.ok_or_else(|| "widget not found after geometry update".to_string())
}

// ── Tests ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn test_db() -> Database {
        Database::open_in_memory().unwrap()
    }

    fn sample_widget(id: &str) -> WidgetRecord {
        WidgetRecord {
            id: id.to_string(),
            widget_type: "clock".into(),
            design_id: "minimal-digital".into(),
            timezone_id: "America/Toronto".into(),
            label: "Toronto".into(),
            hour_cycle: 12,
            show_seconds: false,
            show_date: true,
            show_timezone_label: true,
            appearance: AppearanceConfig {
                preset_id: "dark".into(),
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
            },
            display_id: "primary".into(),
            logical_x: 100.0,
            logical_y: 200.0,
            logical_width: 320.0,
            logical_height: 160.0,
            scale: 1.0,
            opacity: 1.0,
            locked: false,
            hidden: false,
            world_rows: Vec::new(),
            created_at: now_iso(),
            updated_at: now_iso(),
        }
    }

    #[test]
    fn insert_and_read_widget() {
        let db = test_db();
        let w = sample_widget("w1");
        insert_widget(&db, &w).unwrap();
        let got = get_widget(&db, "w1").unwrap().unwrap();
        assert_eq!(got.id, "w1");
        assert_eq!(got.timezone_id, "America/Toronto");
        assert_eq!(got.hour_cycle, 12);
        assert_eq!(got.appearance.preset_id, "dark");
    }

    #[test]
    fn update_widget_patch_fields() {
        let db = test_db();
        insert_widget(&db, &sample_widget("w1")).unwrap();
        let updated = update_widget(
            &db,
            "w1",
            &serde_json::json!({ "show_seconds": true, "scale": 1.5 }),
        )
        .unwrap();
        assert_eq!(updated.show_seconds, true);
        assert_eq!(updated.scale, 1.5);
        // untouched fields preserved
        assert_eq!(updated.label, "Toronto");
    }

    #[test]
    fn duplicate_widget_offsets_copy() {
        let db = test_db();
        insert_widget(&db, &sample_widget("w1")).unwrap();
        let res = duplicate_widget(&db, "w1").unwrap();
        assert_ne!(res.new_id, "w1");
        assert_eq!(res.widget.label, "Toronto (copy)");
        assert_eq!(res.widget.logical_x, 124.0); // 100 + 24
    }

    #[test]
    fn delete_widget_removes_row() {
        let db = test_db();
        insert_widget(&db, &sample_widget("w1")).unwrap();
        delete_widget(&db, "w1").unwrap();
        assert!(get_widget(&db, "w1").unwrap().is_none());
    }

    #[test]
    fn geometry_update_persists() {
        let db = test_db();
        insert_widget(&db, &sample_widget("w1")).unwrap();
        let w = update_widget_geometry(&db, "w1", 11.0, 22.0, 400.0, 200.0).unwrap();
        assert_eq!(w.logical_x, 11.0);
        assert_eq!(w.logical_width, 400.0);
    }

    #[test]
    fn settings_roundtrip() {
        let db = test_db();
        let mut s = get_settings(&db).unwrap();
        assert_eq!(s.default_hour_cycle, 12);
        s.default_hour_cycle = 24;
        s.startup_enabled = true;
        let out = update_settings(&db, &s).unwrap();
        assert_eq!(out.default_hour_cycle, 24);
        assert!(out.startup_enabled);
    }
}
