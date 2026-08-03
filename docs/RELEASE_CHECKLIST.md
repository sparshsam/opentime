# Release Checklist

> Kovina release process for OpenTime.
> Current version: 0.3.0

Follow this checklist for every release (v0.1.0, v0.2.0, v0.3.0 completed;
next release starts fresh).

## Pre-release

### Tests
- [x] `npm run typecheck` passes
- [x] `npm run lint` passes (eslint, flat config)
- [x] `npx prettier --check src` passes
- [x] `npm test` (Vitest) passes — all frontend unit + component tests
- [x] `cargo test --manifest-path src-tauri/Cargo.toml` passes — Rust unit tests
- [x] Manual smoke test completed (see `docs/qa/windows-manual-validation.md`)

### Build
- [x] `npm run build` succeeds (production frontend)
- [x] `cargo build --release` succeeds (optimized binary)
- [ ] Windows MSIX/NSIS bundle built and installed on a Windows 10/11 machine
      (requires Windows tooling; not producible from a Linux/WSL host)
- [ ] Debug symbols stripped in release build
- [ ] Bundle size acceptable

### Documentation Audit
- [x] README.md current (v0.3.0)
- [x] CHANGELOG.md updated with the new version
- [x] CLAUDE.md reflects current state
- [x] AGENTS.md is current
- [x] docs/architecture/* current (desktop-layer, timezones, widget-lifecycle)
- [x] docs/DESIGN_NOTES.md has ADRs for new decisions
- [x] docs/DATA.md documents the schema
- [x] docs/qa/windows-manual-validation.md current

### Code Quality
- [x] No known regressions
- [x] Version bumped in all manifests (package.json, Cargo.toml,
      tauri.conf.json, .kovina/project.json)
- [x] Changelog entries verified against commits

## Release

- [x] Version bumped in all manifests
- [x] Git tag created (`v0.1.0`, `v0.2.0`, `v0.3.0`)
- [x] CHANGELOG.md finalized with release date
- [x] Release notes drafted
- [ ] Build artifacts prepared on a Windows host (`npm run tauri build`)
- [ ] Release candidate tested on Windows

## Post-release

- [ ] Release published
- [ ] GitHub release created with tag
- [ ] Version bumped for next development cycle

---

*This checklist documents the v0.3.0 state. The Windows bundle and on-Windows
manual validation remain as manual tasks requiring a Windows host.*
