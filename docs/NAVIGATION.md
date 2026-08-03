# Navigation Architecture

> Generated from [NAVIGATION_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/NAVIGATION_STANDARD.md)
> **Profile:** desktop

---

## Navigation Hierarchy

This project uses the **three-tier navigation model** defined by the Kovina Navigation Standard:

| Tier | Purpose | Example |
|---|---|---|
| **Primary** | App-wide structure (tab bar, sidebar, rail) | Navigation rail or sidebar on the left edge |
| **Secondary** | Section-level sub-navigation | Sidebar sub-items or inline tabs |
| **Tertiary** | Contextual (back, breadcrumbs, inline links) | Back button, breadcrumbs |

## Platform-Specific Implementation

### Windows / Linux
- Left-side navigation rail or sidebar
- Pivot / tab controls for section-level navigation
- Back via breadcrumbs or app-provided back button
- Keyboard shortcuts documented and discoverable

### macOS
- Sidebar (NSSplitView) for primary navigation
- Toolbar items for section-level actions
- Menu bar: File, Edit, View, Window, Help
- Multiple windows with independent navigation state

## Scaffolded Structure

The scaffold includes placeholders for:

- **Navigation rail** — Left-edge icon + label navigation (expandable/collapsible)
- **Sidebar** — Section-level sub-navigation
- **Command palette** — Ctrl+K triggered (optional, for apps with 8+ routes)
- **Breadcrumbs** — For deep content navigation

Navigation component files should be placed in:
```
src/
└── components/
    ├── NavigationRail.tsx    # Primary navigation
    ├── Sidebar.tsx           # Secondary section navigation
    ├── Breadcrumbs.tsx       # Context/navigation path
    └── CommandPalette.tsx    # Ctrl+K command search (optional)
```

## Deep Link Routes

Reserve the following route patterns for deep linking:

```
/{primary-section}[/{sub-section}][/{resource}[/{resource-id}]]
```

| Route | Purpose |
|---|---|
| /settings | Application settings |
| /search | Search interface |
| /help | Help and documentation |
| /about | Application information |

## Back Behavior Rules

- Back returns to the previous screen preserving its full state
- Back dismisses modals and sheets
- Back does not reset form input — warn before navigating back with unsaved changes
- Back stack is cleared on navigation to a primary destination

## Manual Tasks

- [ ] Define route tree matching the platform's routing system
- [ ] Register deep links: Universal Links (iOS), App Links (Android), protocol handler (Windows/macOS)
- [ ] Implement back stack business logic
- [ ] Set up command palette (Ctrl+K/Cmd+K) if the app has 8+ navigable routes
- [ ] Add navigation state persistence (active section survives app restart)
- [ ] Add accessibility labels to all navigation elements
- [ ] Test navigation with screen reader
- [ ] Verify deep links work from cold start

---

*See [NAVIGATION_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/NAVIGATION_STANDARD.md) for full requirements.*
