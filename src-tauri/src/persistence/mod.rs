//! SQLite persistence for OpenTime.
//!
//! A single connection guarded by a mutex, versioned via `PRAGMA user_version`
//! and an ordered migration list. The schema is forward-looking: it already
//! models future calendars / alarms / timers / reminders in reserved tables
//! (empty for v0.1–v0.3) so later versions migrate, not rebuild.

pub mod db;
pub mod migrations;
pub mod models;
pub mod queries;

pub use db::Database;
