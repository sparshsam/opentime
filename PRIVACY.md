# Privacy Policy

> **Last updated:** 2026-08-03
> **Applies to:** OpenTime (0.3.0)

---

## Privacy Philosophy

OpenTime is part of the [Kovina](https://kovina.org) ecosystem, where privacy
is a foundational principle. OpenTime is a **local-first** application: it
makes no network requests for core functionality, collects no telemetry, and
requires no account.

## What OpenTime Does Not Do

- **No telemetry.** The app never phones home. No usage statistics, crash
  reports, or analytics are sent anywhere.
- **No accounts.** OpenTime works fully without signing in. There is no
  authentication.
- **No ads.** There are no advertisements.
- **No cloud dependency.** Your clocks and settings live only on your device.
- **No unnecessary network access.** The only network-related code path is the
  webview itself; OpenTime makes no network requests for its core features.

## Data Storage

All data is stored locally on your device in a single SQLite database:

```
%APPDATA%\org.kovina.opentime\opentime.sqlite   (Windows)
```

This database contains only:

- Your clock widgets (timezone, design, label, position, appearance)
- Application settings (hour cycle, startup preference, manager window size)

Nothing in this data is transmitted anywhere.

## Third-Party Services

None. OpenTime does not integrate with any third-party service. Bundled fonts
are licensed under the SIL Open Font License and ship with the app — they are
never downloaded at runtime.

## Data Security

- Data is stored locally in WAL-mode SQLite.
- No data is ever sent over a network by OpenTime itself.
- The app does not request unnecessary filesystem or system permissions.

## Your Rights

- **You own your data.** Full stop.
- **You can delete your data** at any time by deleting the database file
  (this resets OpenTime to first run).
- **No data is sold, traded, or shared** with any party for any purpose.

## Changes to This Policy

If this privacy policy changes, the version number and date at the top of this
document will be updated. Significant changes may be communicated through
release notes.

## Contact

- **Project:** OpenTime
- **Author/Maintainer:** Kovina
- **Repository:** https://github.com/Kovina/opentime

---

*This privacy policy reflects the Kovina privacy pledge — built to be owned, understood, and kept.*

*Part of the [Kovina](https://kovina.org) ecosystem.*
