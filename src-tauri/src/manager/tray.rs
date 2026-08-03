//! System tray — menu-driven control of widgets and the manager.
//!
//! Closing the manager minimizes to the tray; quitting is only possible from
//! the tray. Tray actions broadcast events that the app handles.

use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter,
};

use crate::window_manager;

pub fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let add_clock = MenuItem::with_id(app, "add_clock", "Add Clock", true, None::<&str>)?;
    let show_manager = MenuItem::with_id(
        app,
        "show_manager",
        "Show OpenTime Manager",
        true,
        None::<&str>,
    )?;
    let lock_all = MenuItem::with_id(app, "lock_all", "Lock All Widgets", true, None::<&str>)?;
    let unlock_all =
        MenuItem::with_id(app, "unlock_all", "Unlock All Widgets", true, None::<&str>)?;
    let hide_all = MenuItem::with_id(app, "hide_all", "Hide All Widgets", true, None::<&str>)?;
    let show_all = MenuItem::with_id(app, "show_all", "Show All Widgets", true, None::<&str>)?;
    let separator = MenuItem::with_id(app, "sep", "-", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit OpenTime", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &add_clock,
            &show_manager,
            &lock_all,
            &unlock_all,
            &hide_all,
            &show_all,
            &separator,
            &quit,
        ],
    )?;

    // Tray icon: use the bundled 32x32 app icon, or fall back to no icon.
    let tray_icon = app
        .default_window_icon()
        .cloned()
        .or_else(|| Image::from_bytes(include_bytes!("../../icons/32x32.png").as_ref()).ok());

    let mut builder = TrayIconBuilder::with_id("opentime-tray")
        .tooltip("OpenTime")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "add_clock" => {
                let _ = app.emit("tray-add-clock", ());
            }
            "show_manager" => {
                let _ = window_manager::open_manager(app);
            }
            "lock_all" => {
                let _ = app.emit("tray-lock-all", ());
            }
            "unlock_all" => {
                let _ = app.emit("tray-unlock-all", ());
            }
            "hide_all" => {
                let _ = app.emit("tray-hide-all", ());
            }
            "show_all" => {
                let _ = app.emit("tray-show-all", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                let _ = window_manager::open_manager(app);
            }
        });

    if let Some(icon) = tray_icon {
        builder = builder.icon(icon);
    }
    let _tray = builder.build(app)?;

    Ok(())
}
