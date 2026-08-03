# Performance Architecture

> OpenTime is designed to run all day on the desktop. This document describes
> how it stays idle-cheap and how it should be measured.

## Design for low idle cost

The dominant cost driver is clock rendering frequency. OpenTime is engineered
around a **coordinated time source**:

- One `TimeScheduler` per window advances a single `now` value.
- Clocks **without seconds** tick once per minute, aligned to the minute
  boundary.
- Clocks **with seconds** tick once per second.
- No timer exists per clock — the scheduler is the only timer, and every clock
  renders from the same instant, so there is no cross-widget drift.

This means an idle OpenTime with seconds-disabled clocks performs one React
re-render per minute per window, regardless of how many clocks a window shows.

## What consumes CPU when it should not

- **Seconds** — every second-updating clock wakes its window every second.
  The manager warns when 8+ such clocks exist.
- **Animations** — the Flip design animates digit changes; this is gated by
  `prefers-reduced-motion`.
- **Hidden widgets** — hidden widget windows do not render (the window is
  hidden); the scheduler in a hidden window still ticks, but at the minimum
  rate.

## Rendering

- Digital clocks render a small, static DOM tree; only the time text changes
  per tick. React reconciliation is cheap because the tree is tiny.
- Analog clocks render one SVG; hand angles are recomputed from the shared
  `now`. No animation loop — hands only move when `now` changes.
- The world-clock panel renders N rows; N is typically small (< 20).

## Fonts

- Fonts are bundled (no runtime download) and use `font-display: swap`.
- Variable fonts cover many weights in one file.

## Measurement plan

Measure on a mid-range Windows machine, in a **release** build:

| Scenario | What to record |
|---|---|
| Idle CPU, 1 clock, seconds off | % CPU over 10 minutes |
| Idle CPU, 10 clocks, seconds off | % CPU over 10 minutes |
| Idle CPU, 10 clocks, seconds on | % CPU over 10 minutes |
| Memory, 1 clock | working set after 30 min |
| Memory, 10 clocks | working set after 30 min |
| Sleep → resume | time for clocks to correct |
| Extended run | memory growth over 24 h |
| Seconds + animations enabled | CPU with several Flip clocks |
| Add/remove widgets 50× | no window/thread leaks (check task manager) |

Record results in `docs/qa/windows-manual-validation.md` as part of the manual
validation checklist.

## Budgets

| Metric | Target |
|---|---|
| Idle CPU (seconds off) | < 0.5% per window |
| Memory (1 clock) | < 100 MB working set |
| Memory (10 clocks) | < 250 MB working set |
| Startup to tray-ready | < 2 s |
| Bundle (JS) | < 500 KB gzipped |

---

*See [PERFORMANCE_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/PERFORMANCE_STANDARD.md) for the underlying standard.*
