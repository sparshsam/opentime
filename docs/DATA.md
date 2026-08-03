# Data Architecture

> OpenTime is local-first. The primary copy of user data lives on the user's
> device in a single SQLite database. There is no cloud sync, no account, and
> no remote data path.

## Database location

The SQLite database lives in the Tauri app-data directory:

```
%APPDATA%\org.kovina.opentime\opentime.sqlite   (Windows)
~/.local/share/org.kovina.opentime/opentime.sqlite  (Linux)
```

The database uses **WAL journal mode** and foreign keys enforced. The
connection is a single `rusqlite::Connection` guarded by a `Mutex`.

## Data classification

| Class | Examples | Storage rule |
|---|---|---|
| **User data** | Widgets, positions, settings, labels | Primary copy on device. |
| **Cached content** | (none — no remote data) | N/A |
| **Operational state** | Manager window position | Local only, not synced. |
| **Authentication** | (none — no accounts) | N/A |

## Schema versioning

Versioning uses `PRAGMA user_version`. Migrations are an ordered list in
`src-tauri/src/persistence/migrations.rs`; each runs inside a transaction and
bumps `user_version`. A fresh database migrates to the latest version
automatically at startup. No migration deletes user data.

## Current schema (v2)

### `settings`

Singleton row (`id = 1`) holding application-level settings.

| Column | Type | Notes |
|---|---|---|
| `startup_enabled` | INTEGER | Sign-in startup intended state |
| `default_hour_cycle` | INTEGER | 12 or 24 |
| `default_locale` | TEXT | e.g. `en` |
| `default_design_id` | TEXT | e.g. `minimal-digital` |
| `default_preset_id` | TEXT | e.g. `dark` |
| `manager_x`, `manager_y` | INTEGER (nullable) | Manager window position |
| `manager_width`, `manager_height` | INTEGER | Manager size |
| `all_widgets_hidden` | INTEGER | Temporary hide-all flag |
| `launch_manager_at_startup` | INTEGER | Open manager at sign-in |
| `restore_hidden_widgets` | INTEGER | Restore hidden widgets on launch |
| `reduced_motion`, `high_contrast` | INTEGER | Accessibility flags |
| `first_run_complete` | INTEGER | Onboarding state |

### `widgets`

One row per clock widget.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID v4 |
| `widget_type` | TEXT | `clock` |
| `design_id` | TEXT | Design registry id |
| `timezone_id` | TEXT | **IANA id**, never a bare offset |
| `label` | TEXT | User-facing name |
| `hour_cycle` | INTEGER | 12 or 24 |
| `show_seconds` | INTEGER | Gates update frequency |
| `show_date` | INTEGER | |
| `show_timezone_label` | INTEGER | |
| `appearance` | TEXT | JSON `AppearanceConfig` |
| `display_id` | TEXT | Monitor identifier |
| `logical_x`, `logical_y` | REAL | **Logical** pixels (DPI-safe) |
| `logical_width`, `logical_height` | REAL | Logical size |
| `scale` | REAL | Display scale |
| `opacity` | REAL | 0..1 |
| `locked` | INTEGER | Lock position |
| `hidden` | INTEGER | Hidden state |
| `world_rows` | TEXT | JSON array of `WorldClockRow` (panel design) |
| `created_at`, `updated_at` | TEXT | Timestamps |

### Future-reserved tables

The schema already includes empty `calendars`, `events`, `alarms`, `timers`,
and `reminders` tables so later versions (v0.4+) migrate rather than rebuild.
No features use them yet.

## Access model

- The **Rust core** owns the database and exposes a narrow set of validated
  commands (`get_settings`, `list_widgets`, `create_widget`, ...).
- The **frontend** calls those commands through `src/persistence/api.ts`; it
  never touches the database directly.
- Every command validates its inputs (IANA ids, design ids, dimensions) before
  writing.

## Privacy

- No usage data is collected or transmitted.
- The only local storage is the SQLite database.
- Full local-data deletion = deleting the database file.

---

*See [DATA_STORAGE_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/DATA_STORAGE_STANDARD.md) for the underlying standard.*
