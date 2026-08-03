//! Non-Windows startup stub — reports disabled and no-ops.

pub fn is_startup_enabled() -> bool {
    false
}

pub fn set_startup_enabled(_enabled: bool) -> Result<bool, String> {
    // Non-Windows: no sign-in startup mechanism implemented.
    Ok(false)
}
