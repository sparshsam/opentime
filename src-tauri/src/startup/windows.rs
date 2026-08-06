//! Windows sign-in startup via the HKCU Run key.

use std::ffi::OsString;
use std::os::windows::ffi::OsStrExt;
use std::ptr;

use windows_sys::Win32::Foundation::ERROR_SUCCESS;
use windows_sys::Win32::System::Registry::{
    RegCloseKey, RegDeleteValueW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW, HKEY,
    HKEY_CURRENT_USER, KEY_QUERY_VALUE, KEY_SET_VALUE, REG_SZ,
};

const RUN_KEY: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";
const VALUE_NAME: &str = "OpenTime";

fn wide(s: &str) -> Vec<u16> {
    OsString::from(s)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

/// The command line OpenTime should be launched with at sign-in.
fn startup_command() -> String {
    // Uses std::env::current_exe — the installed binary's own path, so it
    // works for MSIX/NSIS installs and dev builds alike.
    match std::env::current_exe() {
        Ok(p) => format!("\"{}\"", p.display()),
        Err(_) => "opentime.exe".to_string(),
    }
}

/// Read the real current registration state from the registry.
pub fn is_startup_enabled() -> bool {
    unsafe {
        let mut key: HKEY = ptr::null_mut();
        let path = wide(RUN_KEY);
        let rc = RegOpenKeyExW(
            HKEY_CURRENT_USER,
            path.as_ptr(),
            0,
            KEY_QUERY_VALUE,
            &mut key,
        );
        if rc != ERROR_SUCCESS {
            return false;
        }
        let name = wide(VALUE_NAME);
        let mut buf = [0u16; 1024];
        let mut size = (buf.len() * 2) as u32;
        let mut kind: u32 = 0;
        let qr = RegQueryValueExW(
            key,
            name.as_ptr(),
            ptr::null(),
            &mut kind,
            buf.as_mut_ptr() as *mut u8,
            &mut size,
        );
        let _ = RegCloseKey(key);
        qr == ERROR_SUCCESS && kind == REG_SZ
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn run_key_and_value_are_correct() {
        // The exact HKCU Run key and value name the app registers under.
        assert_eq!(RUN_KEY, "Software\\Microsoft\\Windows\\CurrentVersion\\Run");
        assert_eq!(VALUE_NAME, "OpenTime");
    }

    #[test]
    fn startup_command_is_quoted_executable_path() {
        let cmd = startup_command();
        // Must start and end with quotes around an exe path.
        assert!(cmd.starts_with('"'), "expected quoted path, got {cmd}");
        assert!(cmd.ends_with('"'), "expected quoted path, got {cmd}");
        assert!(cmd.to_lowercase().contains("opentime"), "got {cmd}");
    }

    #[test]
    fn wide_encodes_utf16_with_nul_terminator() {
        let w = wide("Run");
        assert_eq!(w[0], 'R' as u16);
        assert_eq!(w[1], 'u' as u16);
        assert_eq!(w[2], 'n' as u16);
        assert_eq!(w[3], 0); // nul terminator
    }
}

/// Set or clear the Run key entry. Returns the real resulting state.
pub fn set_startup_enabled(enabled: bool) -> Result<bool, String> {
    unsafe {
        let mut key: HKEY = ptr::null_mut();
        let path = wide(RUN_KEY);
        let rc = RegOpenKeyExW(HKEY_CURRENT_USER, path.as_ptr(), 0, KEY_SET_VALUE, &mut key);
        if rc != ERROR_SUCCESS {
            return Err(format!("failed to open Run key (code {rc})"));
        }

        let name = wide(VALUE_NAME);
        let result = if enabled {
            let cmd = wide(&startup_command());
            let bytes = (cmd.len() * 2) as u32;
            RegSetValueExW(
                key,
                name.as_ptr(),
                0,
                REG_SZ,
                cmd.as_ptr() as *const u8,
                bytes,
            )
        } else {
            RegDeleteValueW(key, name.as_ptr())
        };
        let _ = RegCloseKey(key);

        if result != ERROR_SUCCESS {
            // Registration failed — report honestly.
            return Err(format!("startup registration failed (code {result})"));
        }
        Ok(is_startup_enabled())
    }
}
