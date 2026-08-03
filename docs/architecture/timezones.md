# Timezone Handling

OpenTime uses **IANA timezone identifiers** (e.g. `America/Toronto`,
`Asia/Kolkata`, `Europe/London`) as the persisted identity of every clock's
zone. It never persists a bare UTC offset as a timezone — offsets change with
DST, and half-hour / quarter-hour zones (`+05:30`, `+05:45`) would be
indistinguishable from offsets alone.

## Rendering

All formatting goes through **Luxon** (`DateTime`) and **Intl**, both of which
consume IANA zone ids directly and handle:

- daylight-saving transitions
- zones without DST (India, UTC)
- half-hour offsets (Kolkata `+05:30`)
- quarter-hour offsets (Kathmandu `+05:45`)
- date changes across zones
- leap years, midnight boundaries

The `shared/time.ts` module exposes pure helpers (`formatTime`,
`formatDate`, `zoneAbbreviation`, `dayDifference`, `utcOffsetMinutesFor`,
`hasDst`) that are unit-tested against fixed instants.

## Search (offline)

The `timezone/` module bundles a curated IANA index with city, country, and
alias metadata. Search matches city, country, zone id, and common aliases
(e.g. "New York", "Delhi" → `Asia/Kolkata`). No network is involved.

Multiple cities sharing one zone (Mumbai + Delhi → `Asia/Kolkata`) are modeled
as aliases on a single canonical entry, so the persisted id stays valid.

## Correctness after system events

- **Sleep / resume**: the frontend scheduler re-reads `Date.now()` on resume
  and immediately emits a corrected tick.
- **Manual system-time changes**: same mechanism — every tick derives from
  `Date.now()`, never from accumulated increments, so clocks correct instantly.
- **Timezone database updates**: provided by the platform's ICU/Intl data.

## Coordinated updates

Each window runs one `TimeScheduler`. Clocks without seconds tick once per
minute; clocks with seconds tick every second. All widgets in a window share
the same instant, so there is no cross-widget timer drift.
