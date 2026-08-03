# Platform Assets — OpenTime

> Platform-specific asset requirements for distribution.
> Part of the [Kovina](https://kovina.org) ecosystem.

---

## Asset Source

All platform-specific assets should be generated from a single SVG source file.

| Asset | Location |
|-------|----------|
| SVG source | `assets/branding/icon.svg` |
| Design tokens | `assets/design-tokens.css` |
| Brand notes | `BRAND_NOTES.md` |

---

## Desktop Platform Assets

### Windows (.ico)

- [ ] `icon.ico` — Multi-resolution ICO containing 16×16, 32×32, 48×48, 256×256
- [ ] Store tile logo — 300×300 (Microsoft Store)
- [ ] Store square logo — 150×150 (Microsoft Store)
- [ ] Store wide logo — 310×150 (Microsoft Store)

### macOS (.icns)

- [ ] `icon.icns` — Multi-resolution ICNS containing:
  - 16×16, 32×32, 64×64, 128×128, 256×256, 512×512, 1024×1024
- [ ] Alternatively: `iconset/` directory with individual PNGs for each size

### Linux (.png)

- [ ] `icon-16.png`, `icon-32.png` — 16×16, 32×32 (system tray, window manager)
- [ ] `icon-48.png` — 48×48 (file manager, launcher)
- [ ] `icon-128.png` — 128×128 (app grid)
- [ ] `icon-256.png` — 256×256 (high-DPI launchers)
- [ ] `icon.svg` — SVG icon for modern Linux desktops (GNOME, KDE)

### Tauri Configuration

```toml
# In tauri.conf.json or Cargo.toml bundle config:
# icon = ["assets/icons/icon.ico", "assets/icons/icon.icns", "assets/icons/icon-32.png"]
```

---

## Generic Asset Requirements

### SVG Source

- [ ] Single SVG master icon — 1024×1024 viewBox, vector paths only
- [ ] Compatible with modern SVG renderers (Inkscape, Figma, etc.)
- [ ] No embedded raster images
- [ ] Include `viewBox` attribute
- [ ] Monochrome or limited color palette matching brand

### PNG Fallbacks

- [ ] 1024×1024 PNG from SVG source
- [ ] 512×512 PNG
- [ ] 256×256 PNG
- [ ] 128×128 PNG
- [ ] 64×64 PNG
- [ ] 32×32 PNG
- [ ] 16×16 PNG

### Favicon (Web)

- [ ] `favicon.ico` — 16×16, 32×32 multi-size
- [ ] `favicon.svg` — SVG favicon (modern browsers)
- [ ] `apple-touch-icon.png` — 180×180
- [ ] `icon-192.png` — PWA manifest (192×192)
- [ ] `icon-512.png` — PWA manifest (512×512)

### Social

- [ ] `social-card.png` — 1200×630 (Open Graph)
- [ ] `social-card-dark.png` — Dark variant (if applicable)
- [ ] `twitter-card.png` — 1200×600 (if different from OG)

---

## Naming Conventions

```
assets/icons/
  icon.svg                     # SVG master
  icon-{size}.png            # e.g. icon-1024.png, icon-512.png
  favicon.ico                  # Multi-size favicon
  favicon.svg                  # SVG favicon
  apple-touch-icon.png         # iOS safari

assets/branding/
  logo.svg                     # Full logo (wordmark + icon)
  icon.svg                     # App icon source
  design-tokens.css            # Color and spacing tokens

assets/store/
  feature-graphic.png          # Store feature graphic
  screenshot-01.png            # Store screenshots
```

---

*Generate platform assets when preparing for distribution. Update this checklist
for new platforms or asset requirements.*
