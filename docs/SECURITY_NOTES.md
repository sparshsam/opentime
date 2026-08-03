# Security & Privacy Architecture

> OpenTime's security posture. Because OpenTime is local-first and makes no
> network requests, most of the standard web-app threat surface does not apply.

## Core commitments

1. **No telemetry** — no usage tracking, no crash reporting, no analytics.
2. **No ads.**
3. **No dark patterns** — no confirmshaming, no preselected opt-ins.
4. **Data minimization** — only what the stated features need (widgets +
   settings), stored locally.
5. **Safe defaults** — privacy and security settings default to the safest
   option.

## Permissions

OpenTime requests **no** OS permissions at runtime:

| Permission | Status |
|---|---|
| Camera | Not used |
| Microphone | Not used |
| Location | Not used |
| Notifications | Not used |
| Network | None for core functionality |

The webview may request network for page resources (bundled assets only); the
application makes no API calls.

## Attack surface

Because there is no server, no account, and no cloud, the attack surface is the
local application:

- **No remote code paths** — no fetch to remote endpoints for core features.
- **No third-party SDKs** — no analytics SDKs, no ad SDKs.
- **SQL injection** — all SQL uses prepared statements with bound parameters
  (`rusqlite` params); no string interpolation of user input into SQL.
- **Command surface** — a narrow, whitelisted set of Tauri commands. Every
  command validates its inputs (IANA timezone ids, design ids, dimension
  ranges) before touching the database.
- **No arbitrary shell execution** — no `Command::new` in the codebase.
- **Webview hardening** — a strict Content-Security-Policy is set in
  `tauri.conf.json` (default-src 'self', no remote origins, no inline script).
- **Least privilege** — the app only reads/writes its own app-data directory.

## Data storage

- All data in one SQLite database in the app-data directory.
- No secrets, tokens, or credentials are ever stored.
- Logging is minimal and contains no PII.

## Privacy policy

See [PRIVACY.md](../PRIVACY.md) for the user-facing policy.

## Manual tasks

- [x] Write privacy policy content
- [x] Set CSP in tauri.conf.json
- [x] Confirm no telemetry/ads/dark patterns in UI
- [ ] Audit dependencies for vulnerabilities before public release
- [ ] Set up automated dependency scanning in CI
- [ ] Validate the built MSIX requests only expected capabilities

---

*See [SECURITY_PRIVACY_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/SECURITY_PRIVACY_STANDARD.md) for the underlying standard.*
