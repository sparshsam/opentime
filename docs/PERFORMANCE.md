# Performance Architecture

> Generated from [PERFORMANCE_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/PERFORMANCE_STANDARD.md)
> **Project:** OpenTime

---

## Performance Budgets

### Desktop (Windows / macOS)

| Metric | Target |
|---|---|
| Cold start to interactive | ≤ 2 seconds |
| Warm start to interactive | ≤ 0.5 seconds |
| Memory (typical working set) | ≤ 200 MB |
| Frame rate | 60 fps minimum |

## Startup Budgets

| Scenario | Target |
|---|---|
| Cold start (first launch) | ≤ 2 seconds |
| Warm start (subsequent) | ≤ 0.5 seconds |

## Interaction Latency

| Interaction | Target |
|---|---|
| Tap / click feedback | < 100ms |
| Navigation transition | < 300ms |
| Data load (local) | < 100ms |
| Data load (synced) | < 300ms first paint |

## Bundle Size

| Asset | Budget |
|---|---|
| Initial JavaScript | ≤ 10 MB (distribution size) |
| Route chunks | Code-split per route |
| Font files | Subsetted, `font-display: swap` |

## Optimization Checklist

### Images
- [ ] Serve at display dimensions — never larger
- [ ] Use modern formats (WebP, AVIF)
- [ ] Lazy-load below-the-fold images
- [ ] Specify dimensions in markup to prevent layout shift

### Fonts
- [ ] Preload fonts in document `<head>`
- [ ] Use `font-display: swap` to prevent invisible text (FOIT)
- [ ] Subset fonts to remove unused glyphs

### Code
- [ ] Routes are code-split (each route loads independently)
- [ ] Heavy libraries are lazy-loaded
- [ ] Lists beyond 100 items use virtualization
- [ ] Animations use GPU-composited properties only (transform, opacity)

### Caching
- [ ] Cache API responses with appropriate TTL
- [ ] Cache is separate from user data storage
- [ ] App shell is cached for offline startup
- [ ] Previously viewed content is available offline

## Profiling Checklist

- [ ] Profile on a mid-range device (not developer machine)
- [ ] Profile in release mode (not debug)
- [ ] Measure cold and warm startup
- [ ] Check frame rate during scroll and navigation
- [ ] Verify memory stability over 30 minutes of usage
- [ ] Check bundle size before every release
- [ ] Add Web Vitals monitoring (web)
- [ ] CI runs performance regression checks

## Manual Tasks

- [ ] Implement code splitting per route
- [ ] Set up image optimization pipeline
- [ ] Configure font loading strategy (preload, subset, swap)
- [ ] Add virtualized list component for long lists
- [ ] Set up performance regression CI checks
- [ ] Test on low-end device (≤ 3 GB RAM mobile, ≤ 8 GB RAM desktop)
- [ ] Document performance budgets in `docs/PERFORMANCE_BUDGETS.md`

---

*See [PERFORMANCE_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/PERFORMANCE_STANDARD.md) for full requirements.*
