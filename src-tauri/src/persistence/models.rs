//! Serde models for persisted OpenTime data. Field names match the frontend
//! `src/shared/types.ts` so IPC payloads round-trip without transformation.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppearanceConfig {
    pub preset_id: String,
    pub primary_color: Option<String>,
    pub secondary_color: Option<String>,
    pub hand_color: Option<String>,
    pub marker_color: Option<String>,
    pub background_color: Option<String>,
    pub border_color: Option<String>,
    pub opacity: f64,
    pub corner_radius: i64,
    pub shadow_strength: f64,
    pub alignment: String,
    pub spacing: i64,
    pub scale: f64,
    pub numeral_style: String,
    pub font_style: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldClockRow {
    pub timezone_id: String,
    pub label: String,
    pub show_date: bool,
    pub show_utc_offset: bool,
    pub show_abbreviation: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetRecord {
    pub id: String,
    pub widget_type: String,
    pub design_id: String,
    pub timezone_id: String,
    pub label: String,
    pub hour_cycle: i64, // 12 | 24
    pub show_seconds: bool,
    pub show_date: bool,
    pub show_timezone_label: bool,
    pub appearance: AppearanceConfig,
    pub display_id: String,
    pub logical_x: f64,
    pub logical_y: f64,
    pub logical_width: f64,
    pub logical_height: f64,
    pub scale: f64,
    pub opacity: f64,
    pub locked: bool,
    pub hidden: bool,
    pub world_rows: Vec<WorldClockRow>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub startup_enabled: bool,
    pub default_hour_cycle: i64,
    pub default_locale: String,
    pub default_design_id: String,
    pub default_preset_id: String,
    pub manager_x: Option<i64>,
    pub manager_y: Option<i64>,
    pub manager_width: i64,
    pub manager_height: i64,
    pub all_widgets_hidden: bool,
    pub launch_manager_at_startup: bool,
    pub restore_hidden_widgets: bool,
    pub reduced_motion: bool,
    pub high_contrast: bool,
    pub schema_version: i64,
    pub first_run_complete: bool,
}

/// A future-reserved calendar entry (schema present, no features yet).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReservedCalendarEntry {
    pub id: String,
    pub title: String,
    pub starts_at: String,
    pub ends_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
    pub display_id: String,
    pub name: String,
    pub x: i64,
    pub y: i64,
    pub width: i64,
    pub height: i64,
    pub scale_factor: f64,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWidgetInput {
    pub design_id: String,
    pub timezone_id: String,
    pub label: Option<String>,
    pub hour_cycle: Option<i64>,
    pub show_seconds: Option<bool>,
    pub show_date: Option<bool>,
    pub show_timezone_label: Option<bool>,
    pub display_id: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateWidgetInput {
    pub id: String,
    pub patch: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateWidgetResult {
    pub original_id: String,
    pub new_id: String,
    pub widget: WidgetRecord,
}
