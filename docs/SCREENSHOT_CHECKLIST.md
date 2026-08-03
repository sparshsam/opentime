# Screenshot Checklist — OpenTime

> Screenshot requirements for documentation, stores, and social sharing.
> Part of the [Kovina](https://kovina.org) ecosystem.

---

## General Assets (All Projects)

- [ ] **App icon** — 1024×1024 PNG, centered on solid or transparent background
- [ ] **Social card** — 1200×630 PNG for Open Graph / Twitter Card sharing
- [ ] **Feature graphic** — Theme-aware hero image for documentation home

<!-- TODO: Add or generate each screenshot as the UI stabilizes -->

---

## Desktop Screenshots

- [ ] **Main window** — 1280×800, default state with sample content
- [ ] **Feature detail** — Close-up of primary feature area
- [ ] **Settings / Preferences** — Configuration window or panel
- [ ] **Empty state** — App when no data/content is loaded
- [ ] **Light mode variant** — Main window in light mode (if supported)
- [ ] **Dark mode variant** — Main window in dark mode

---

## Store / Distribution Screenshots

## Store Screenshots

- [ ] **Store feature graphic** — 1280×680 (Steam, Microsoft Store)
- [ ] **Store screenshots** — Minimum 4, maximum 10 (1280×800 or native res)
- [ ] **Store capsule** — Small/medium/large capsule art (Steam)
- [ ] **Library hero** — Library banner image (Steam)

---

## Naming Convention

```
assets/screenshots/
  screenshot-{feature}-{mode}.png    # e.g. screenshot-main-dark.png
assets/social/
  social-card.png                         # 1200×630
  social-card-{lang}.png               # Localized social cards
```

## Tools

<!-- TODO: List screenshot tools and settings -->

- **Screenshot dimensions:** Capture at 2x resolution, export at 1x for docs
- **Format:** PNG for screenshots, PNG for social cards
- **Background:** Dark mode (Kovina default), light mode where applicable

---

*Keep screenshots up to date as the UI evolves. Update this checklist with each release.*
