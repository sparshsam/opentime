//! SQLite connection management and migration runner.

use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

use super::migrations::{latest_version, MIGRATIONS};

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    /// Open (creating if needed) and migrate a database at `path`.
    pub fn open(path: &Path) -> Result<Self, String> {
        let conn = Connection::open(path).map_err(|e| format!("open db: {e}"))?;
        conn.pragma_update(None, "journal_mode", "WAL")
            .map_err(|e| format!("wal: {e}"))?;
        conn.pragma_update(None, "foreign_keys", "ON")
            .map_err(|e| format!("fk: {e}"))?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    /// Open an in-memory database (tests). Migrations still run.
    pub fn open_in_memory() -> Result<Self, String> {
        let conn = Connection::open_in_memory().map_err(|e| format!("mem db: {e}"))?;
        conn.pragma_update(None, "foreign_keys", "ON")
            .map_err(|e| format!("fk: {e}"))?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    fn current_version(&self) -> Result<i64, String> {
        let conn = self.conn.lock().unwrap();
        conn.query_row("PRAGMA user_version", [], |r| r.get(0))
            .map_err(|e| format!("read user_version: {e}"))
    }

    /// Apply any pending migrations. Returns the resulting schema version.
    pub fn run_migrations(&self) -> Result<i64, String> {
        let from = self.current_version()?;
        let to = latest_version();
        for (i, sql) in MIGRATIONS.iter().enumerate() {
            let target = (i as i64) + 1;
            if target > from && target <= to {
                let mut conn = self.conn.lock().unwrap();
                let tx = conn.transaction().map_err(|e| format!("tx begin: {e}"))?;
                tx.execute_batch(sql)
                    .map_err(|e| format!("migration {target}: {e}"))?;
                tx.pragma_update(None, "user_version", target)
                    .map_err(|e| format!("tx version {target}: {e}"))?;
                tx.commit().map_err(|e| format!("tx commit: {e}"))?;
            }
        }
        Ok(to)
    }

    /// Current schema version.
    pub fn schema_version(&self) -> Result<i64, String> {
        self.current_version()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fresh_db_migrates_to_latest() {
        let db = Database::open_in_memory().unwrap();
        assert_eq!(db.schema_version().unwrap(), latest_version());
    }

    #[test]
    fn settings_row_exists_after_migration() {
        let db = Database::open_in_memory().unwrap();
        let conn = db.conn.lock().unwrap();
        let n: i64 = conn
            .query_row("SELECT COUNT(*) FROM settings", [], |r| r.get(0))
            .unwrap();
        assert_eq!(n, 1);
    }

    #[test]
    fn future_tables_exist() {
        let db = Database::open_in_memory().unwrap();
        let conn = db.conn.lock().unwrap();
        for table in ["calendars", "events", "alarms", "timers", "reminders"] {
            let n: i64 = conn
                .query_row(
                    "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?1",
                    [table],
                    |r| r.get(0),
                )
                .unwrap();
            assert_eq!(n, 1, "expected table {table}");
        }
    }
}
