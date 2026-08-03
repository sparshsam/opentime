# Design Notes

> Architecture decisions, design patterns, and trade-offs for OpenTime's
> design system (v0.2.0).

## Design System Overview

OpenTime's clock rendering is **configuration-driven**: every design is a
registry entry (metadata + a renderer component key), and every colour or
proportional choice comes from an `AppearanceConfig` token set. There are no
per-colour variants of any component.

### Design registry (`src/designs/index.ts`)

Each design declares:

- `id`, `family` (`digital` | `analog` | `world-clock`), `name`, `description`
- `capabilities` — which of seconds / date / timezone-label / background /
  animation the design supports
- `supportedAppearance` — the subset of `AppearanceConfig` fields it honours

The renderers (`DigitalClock`, `AnalogClock`, `WorldClockPanel`) switch on the
design id and read only the supported tokens. Adding a design is a registry
entry plus a small renderer branch — not a new component per colour.

### Appearance tokens (`src/shared/types.ts`)

`AppearanceConfig` is design-independent: primary/secondary/hand/marker/
background/border colours, opacity, corner radius, shadow strength, alignment,
spacing, scale, numeral style, and font style. The registry controls which
tokens each design exposes in the editor.

### Presets (`src/shared/presets.ts`)

Eight curated presets (Light, Dark, Warm, Cool, Monochrome, High Contrast,
Transparent, Soft Glass) map to token values and carry a declared contrast
ratio. The editor warns — but does not block — on low-contrast pairings, so no
design silently produces unreadable defaults.

### Typography (`src/shared/fonts.ts`)

Seven curated style labels (geometric sans, humanist sans, serif, monospace,
segmented, rounded, condensed) each map to a single bundled, OFL-licensed
family. Fonts ship with the app; there is no runtime download. The segmented
style (DSEG7) powers the Classic LED design.

## Architecture Decisions

### ADR-001: Configuration-driven designs instead of per-variant components

**Date:** 2026-08-03
**Status:** Accepted

**Context:** The gallery requires many designs with colour and proportional
variations. Naively, each would be a React component per design × preset.

**Decision:** One registry of design metadata; renderers read token values.
Colour variation is data, not components.

**Consequences:** Adding a design is cheap; the gallery preview shares the exact
render path as the live widget; the manager's appearance editor exposes exactly
what each design supports.

### ADR-002: Single coordinated time source

**Date:** 2026-08-03
**Status:** Accepted

**Context:** Many widgets must show consistent time without per-clock timer
drift or excessive CPU.

**Decision:** One `TimeScheduler` per window advances a single `now` value;
clocks without seconds tick once per minute, clocks with seconds tick each
second. Every tick re-reads `Date.now()` — never accumulated increments — so
clocks correct instantly after sleep or manual time changes.

**Consequences:** Seconds-disabled clocks idle at one wake per minute; there is
no cross-widget drift; reduced-motion and sleep/resume are handled centrally.

### ADR-003: Bundled, OFL-licensed fonts only

**Date:** 2026-08-03
**Status:** Accepted

**Context:** The spec forbids online font downloads and requires legally
redistributable fonts.

**Decision:** Bundle Inter, Source Sans 3, Source Serif 4, JetBrains Mono,
Nunito, Oswald, and DSEG7 — all SIL OFL 1.1 — with third-party notices.

**Consequences:** Offline by construction; ~3 MB added to the bundle; no font
license risk. See `src/assets/fonts/THIRD_PARTY_NOTICES.md`.

## Trade-offs

- **Flat icons vs subtle gradients.** The Kovina app-icon standard favours flat
  filled shapes; Microsoft's Windows guidance permits subtle monochrome
  gradients. OpenTime follows the Kovina standard for cross-platform
  consistency.
- **Curated vs exhaustive design list.** The registry is deliberately curated
  (14 designs) rather than open-ended, to keep default readability and
  performance predictable.
