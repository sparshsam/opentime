//! Shell monitor — detects Explorer restart / shell recreation and triggers
//! widget reattachment.
//!
//! When Explorer restarts, the WorkerW that hosted our widgets is destroyed
//! and recreated. The monitor periodically checks whether attached widgets'
//! parent windows are still valid and re-runs the desktop-layer attach routine
//! when they are not. A lightweight poll (a few seconds) is deliberate: it
//! avoids undocumented window-message hooking and is cheap when nothing has
//! changed.

use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

#[cfg(windows)]
use crate::desktop_layer::{is_attached_valid, reattach, DesktopLayerResult};

/// Registry of widget HWNDs that must stay attached to the desktop layer.
/// The main thread owns creation/destruction; the monitor only reads.
static WIDGETS: std::sync::Mutex<Vec<usize>> = std::sync::Mutex::new(Vec::new());
static RUNNING: AtomicBool = AtomicBool::new(false);

/// Register a widget window for shell-monitor supervision.
pub fn register(hwnd: usize) {
    let mut w = WIDGETS.lock().unwrap();
    if !w.contains(&hwnd) {
        w.push(hwnd);
    }
}

/// Unregister a widget window (before it is destroyed).
pub fn unregister(hwnd: usize) {
    let mut w = WIDGETS.lock().unwrap();
    w.retain(|&h| h != hwnd);
}

/// Start the background monitor thread.
pub fn start(interval: Duration) {
    if RUNNING.swap(true, Ordering::SeqCst) {
        return; // already running
    }
    thread::Builder::new()
        .name("opentime-shell-monitor".into())
        .spawn(move || loop {
            thread::sleep(interval);
            sweep();
        })
        .ok();
}

fn sweep() {
    #[cfg(windows)]
    {
        let widgets = {
            let w = WIDGETS.lock().unwrap();
            w.clone()
        };
        for hwnd in widgets {
            if !is_attached_valid(hwnd) {
                // Explorer recreated the desktop surface — reattach.
                match reattach(hwnd) {
                    DesktopLayerResult::Attached | DesktopLayerResult::Fallback => {
                        register(hwnd); // ensure still supervised
                    }
                    DesktopLayerResult::NotSupported => {}
                }
            }
        }
    }
    #[cfg(not(windows))]
    {
        let _guard = WIDGETS.lock().unwrap();
        drop(_guard);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn register_unregister_are_safe() {
        register(0xDEAD);
        register(0xDEAD); // duplicate is ignored
        unregister(0xDEAD);
        unregister(0xDEAD); // no-op
    }

    #[test]
    fn start_is_idempotent() {
        start(Duration::from_millis(50));
        start(Duration::from_millis(50));
        RUNNING.store(false, Ordering::SeqCst);
    }
}
