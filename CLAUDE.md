# OpenTime — Agent Notes

> Calm, privacy-first desktop time companion. Clocks, world clocks, and more.
> **Version:** 0.1.0 — Experimental

**Brand:** Kovina ecosystem (Open* product family)
**Repo:** github.com/Kovina/opentime

## Key Files

- `PRIVACY.md` — Privacy policy and data practices
- `AGENTS.md` — Agent operating notes
- `docs/ROADMAP.md` — Development roadmap
- `docs/DESIGN_NOTES.md` — Architecture decisions and design rationale
- `docs/RELEASE_CHECKLIST.md` — Release process checklist
- `BRAND_NOTES.md` — Brand identity documentation
- `assets/design-tokens.css` — Design tokens and visual foundation

## Tech Stack

<!-- TODO: List key technologies, frameworks, and tools -->

- **Category:** Utilities
- **Primary Platform:** desktop
- **App Type:** Desktop App
<!-- TODO: Add language, framework, and database details -->

## Quick Start

```bash
git clone https://github.com/Kovina/opentime.git
cd opentime
npm install          # Install JS dependencies
npm run tauri dev    # Run in development mode
npm run tauri build  # Production build
```

## Tests

```bash
npm test           # Run tests
npm run test:watch # Watch mode
```

## Project Structure

```
opentime/
├── src/                 # Source code
├── tests/               # Test suites and fixtures
├── docs/                # Documentation
│   ├── ABOUT.md         # Project overview and philosophy
│   └── ROADMAP.md       # Development roadmap
├── assets/              # Brand and media assets
│   ├── design-tokens.css # Design tokens
│   ├── branding/        # Logos and brand assets
│   ├── icons/           # App icons
│   ├── screenshots/     # App screenshots
│   └── social/          # Social media cards
├── BRAND_NOTES.md       # Brand identity documentation
├── PRIVACY.md           # Privacy policy
├── CLAUDE.md            # This file — agent instructions
├── AGENTS.md            # Agent operating notes
└── .kovina/             # Kovina project metadata
```

## Kovina Standards

Before making design or architecture decisions, read the Kovina standards:

- **Brand Standards:** `BRAND_NOTES.md`
- **Design Tokens:** `assets/design-tokens.css`
- **Design Playbook:** https://kovina.org/design

## Design Constraints

- Kovina design philosophy — built to be owned, understood, and kept
- Local-first by default — no data collection without user consent
<!-- TODO: Add project-specific constraints -->

## Architecture Decisions

See [docs/DESIGN_NOTES.md](docs/DESIGN_NOTES.md) for Architecture Decision Records.

---

*This project is part of the [Kovina](https://kovina.org) ecosystem.*
