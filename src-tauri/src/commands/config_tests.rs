//! Configuration consistency tests.
//!
//! These verify the build-time configuration is internally consistent and
//! matches the crate version — runnable anywhere, no Windows session needed.

use std::path::PathBuf;

fn crate_root() -> PathBuf {
    // CARGO_MANIFEST_DIR points at src-tauri/.
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
}

fn read_conf() -> serde_json::Value {
    let p = crate_root().join("tauri.conf.json");
    let text = std::fs::read_to_string(&p).expect("tauri.conf.json must exist");
    serde_json::from_str(&text).expect("tauri.conf.json must be valid JSON")
}

#[test]
fn tauri_conf_version_matches_crate_version() {
    let conf = read_conf();
    let conf_version = conf["version"]
        .as_str()
        .expect("version must be a string in tauri.conf.json");
    assert_eq!(
        conf_version, env!("CARGO_PKG_VERSION"),
        "tauri.conf.json version {} must match Cargo.toml version {}",
        conf_version,
        env!("CARGO_PKG_VERSION")
    );
}

#[test]
fn package_identifier_is_stable() {
    let conf = read_conf();
    assert_eq!(
        conf["identifier"].as_str().expect("identifier required"),
        "org.kovina.opentime"
    );
}

#[test]
fn product_name_is_opentime() {
    let conf = read_conf();
    assert_eq!(
        conf["productName"].as_str().expect("productName required"),
        "OpenTime"
    );
}

#[test]
fn bundle_is_active_with_windows_targets() {
    let conf = read_conf();
    assert_eq!(
        conf["bundle"]["active"].as_bool().unwrap_or(false),
        true,
        "bundling must be active"
    );
    let targets = conf["bundle"]["targets"]
        .as_array()
        .expect("bundle.targets must be an array");
    let target_strs: Vec<&str> = targets
        .iter()
        .filter_map(|t| t.as_str())
        .collect();
    assert!(
        target_strs.iter().any(|t| *t == "nsis"),
        "NSIS must be a bundle target (got {target_strs:?})"
    );
    assert!(
        target_strs.iter().any(|t| *t == "msi"),
        "MSI must be a bundle target (got {target_strs:?})"
    );
}

#[test]
fn nsis_installs_per_user() {
    let conf = read_conf();
    let install_mode = conf["bundle"]["windows"]["nsis"]["installMode"]
        .as_str()
        .expect("nsis.installMode required");
    assert_eq!(
        install_mode, "currentUser",
        "OpenTime installs per-user (no admin needed)"
    );
}

#[test]
fn bundle_icons_referenced_exist() {
    let conf = read_conf();
    let icons = conf["bundle"]["icon"]
        .as_array()
        .expect("bundle.icon must be an array");
    let root = crate_root();
    for icon in icons {
        let rel = icon.as_str().expect("icon entry must be a string");
        let full = root.join(rel);
        assert!(
            full.exists(),
            "bundled icon {rel} referenced in tauri.conf.json is missing at {full:?}"
        );
    }
}

#[test]
fn windows_store_assets_exist_for_msix() {
    // Both Light and Dark MSIX tile sets must be present for packaging.
    let root = crate_root().join("../assets/platforms/windows/MicrosoftStore");
    for variant in ["Light", "Dark"] {
        let dir = root.join(variant);
        for tile in [
            "Square44x44Logo.png",
            "Square150x150Logo.png",
            "StoreLogo.png",
            "SplashScreen.png",
        ] {
            assert!(
                dir.join(tile).exists(),
                "missing MSIX asset {variant}/{tile}"
            );
        }
    }
}

#[test]
fn app_ico_has_all_required_frames() {
    // The bundled icon.ico must contain 16, 24, 32, 48, 64, 96, 256 (7 frames)
    // so title bar/taskbar icons are sharp at every DPI. Missing 96 was the
    // historical blur-at-scale bug.
    let p = crate_root().join("icons/icon.ico");
    let bytes = std::fs::read(&p).expect("icons/icon.ico must exist");
    assert!(bytes.len() >= 6, "ico too short to have a header");
    let count = u16::from_le_bytes([bytes[4], bytes[5]]) as usize;
    let mut sizes = std::collections::BTreeSet::new();
    for i in 0..count {
        let off = 6 + i * 16;
        if off + 1 >= bytes.len() {
            break;
        }
        let w = bytes[off] as u32;
        // In ICO, 0 encodes 256.
        sizes.insert(if w == 0 { 256 } else { w });
    }
    for required in [16u32, 24, 32, 48, 64, 96, 256] {
        assert!(
            sizes.contains(&required),
            "icon.ico missing {required}px frame; has {sizes:?}"
        );
    }
}
