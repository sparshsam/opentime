# Release Checklist

> Kovina release process for OpenTime.
> Current version: 0.1.0 | Generated: 2026-08-03

## Pre-release

### Tests
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Edge cases covered
- [ ] Manual smoke test completed

### Build
- [ ] Build succeeds on target platform(s)
- [ ] No warnings in build output
- [ ] Binary/source size acceptable
- [ ] Debug symbols stripped (release build)

### Documentation Audit
- [ ] README.md is current
- [ ] CHANGELOG.md updated with new version
- [ ] CLAUDE.md reflects current state
- [ ] AGENTS.md is current
- [ ] ROADMAP.md updated
- [ ] DESIGN_NOTES.md has ADRs for any new decisions

### Code Quality
- [ ] No known regressions
- [ ] Deprecated code removed
- [ ] TODOs reviewed (remaining are intentional)
- [ ] Changelog entries verified against commits

## Release

- [ ] Version bumped in all manifests
- [ ] Git tag created (`v0.1.0`)
- [ ] CHANGELOG.md finalized with release date
- [ ] Release notes drafted
- [ ] Build artifacts prepared
- [ ] Release candidate tested

## Post-release

- [ ] Release published
- [ ] Release announced (if applicable)
- [ ] GitHub release created with tag
- [ ] Version bumped for next development cycle

---

*Follow this checklist for every release. Check off items as completed.*
