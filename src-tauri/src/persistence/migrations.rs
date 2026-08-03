//! Ordered SQLite migrations, driven by `PRAGMA user_version`.
//!
//! Each migration is a full transaction. `user_version` starts at 0 and is
//! bumped to `migrations.len()` after applying the list. Tests exercise both
//! the empty-DB path and the version-1 → latest path.

pub const MIGRATIONS: &[&str] = &[
    // ── v1: initial schema ──────────────────────────────────────────────
    r#"
    CREATE TABLE settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        startup_enabled INTEGER NOT NULL DEFAULT 0,
        default_hour_cycle INTEGER NOT NULL DEFAULT 12,
        default_locale TEXT NOT NULL DEFAULT 'en',
        default_design_id TEXT NOT NULL DEFAULT 'minimal-digital',
        default_preset_id TEXT NOT NULL DEFAULT 'dark',
        manager_x INTEGER,
        manager_y INTEGER,
        manager_width INTEGER NOT NULL DEFAULT 1080,
        manager_height INTEGER NOT NULL DEFAULT 720,
        all_widgets_hidden INTEGER NOT NULL DEFAULT 0,
        launch_manager_at_startup INTEGER NOT NULL DEFAULT 0,
        restore_hidden_widgets INTEGER NOT NULL DEFAULT 1,
        reduced_motion INTEGER NOT NULL DEFAULT 0,
        high_contrast INTEGER NOT NULL DEFAULT 0,
        first_run_complete INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE widgets (
        id TEXT PRIMARY KEY,
        widget_type TEXT NOT NULL DEFAULT 'clock',
        design_id TEXT NOT NULL DEFAULT 'minimal-digital',
        timezone_id TEXT NOT NULL DEFAULT 'UTC',
        label TEXT NOT NULL DEFAULT '',
        hour_cycle INTEGER NOT NULL DEFAULT 12,
        show_seconds INTEGER NOT NULL DEFAULT 0,
        show_date INTEGER NOT NULL DEFAULT 0,
        show_timezone_label INTEGER NOT NULL DEFAULT 1,
        appearance TEXT NOT NULL DEFAULT '{}',
        display_id TEXT NOT NULL DEFAULT 'primary',
        logical_x REAL NOT NULL DEFAULT 0,
        logical_y REAL NOT NULL DEFAULT 0,
        logical_width REAL NOT NULL DEFAULT 320,
        logical_height REAL NOT NULL DEFAULT 160,
        scale REAL NOT NULL DEFAULT 1,
        opacity REAL NOT NULL DEFAULT 1,
        locked INTEGER NOT NULL DEFAULT 0,
        hidden INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE INDEX idx_widgets_display ON widgets(display_id);
    CREATE INDEX idx_widgets_hidden ON widgets(hidden);

    -- Future-reserved tables (empty for v0.1–v0.3; schema present so later
    -- features migrate instead of rebuild). Deliberately minimal.
    CREATE TABLE calendars (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'local'
    );
    CREATE TABLE events (
        id TEXT PRIMARY KEY,
        calendar_id TEXT NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        starts_at TEXT NOT NULL,
        ends_at TEXT,
        all_day INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE alarms (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL DEFAULT '',
        due_at TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE timers (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL DEFAULT '',
        duration_ms INTEGER NOT NULL,
        state TEXT NOT NULL DEFAULT 'idle',
        target_at TEXT
    );
    CREATE TABLE reminders (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        remind_at TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1
    );

    INSERT INTO settings (id) VALUES (1);
    "#,
    // ── v2: world-clock panel rows ───────────────────────────────────────
    r#"
    ALTER TABLE widgets ADD COLUMN world_rows TEXT NOT NULL DEFAULT '[]';
    "#,
];

pub fn latest_version() -> i64 {
    MIGRATIONS.len() as i64
}
