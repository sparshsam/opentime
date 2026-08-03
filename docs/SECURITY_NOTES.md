# Security & Privacy Architecture

> Generated from [SECURITY_PRIVACY_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/SECURITY_PRIVACY_STANDARD.md)
> **Project:** OpenTime

---

## Core Commitments

1. **No telemetry by default** — All analytics and usage tracking are opt-in
2. **No ads** — The application displays no advertising
3. **No dark patterns** — No confirmshaming, roach motels, preselected opt-ins, or forced actions
4. **Data minimization** — Collect only what is directly necessary for stated features
5. **Safe defaults** — Every security-sensitive decision defaults to the safest option

## Permissions

Request permissions at point of use with a clear explanation of why they are needed:

| Permission | When to Request | Rationale |
|---|---|---|
| Camera | When user opens camera feature | Not on launch |
| Microphone | When user starts recording | Not on launch |
| Location | When user enables a location feature | Per-session, not persistent |
| Notifications | After user has seen value | Not on first launch |

## Secrets Management

| Secret Type | Storage Location |
|---|---|
| Authentication tokens | Platform credential store (Keychain, Keystore) |
| API keys | Environment variables (server) or public + server-side guard (client) |
| Database credentials | Server-side environment variables only |
| Encryption keys | Platform secure enclave |

## Environment Variables

Document all required environment variables in `.env.example` (placeholder values only). Never commit real secrets.

## Privacy Policy

Include a privacy policy that states:
- Exactly what data is collected and why
- How long each data type is retained
- Which third-party services receive data
- How users can request data deletion
- How users can export their data

## Logging Rules

- Logs never contain secrets, passwords, tokens, or PII
- Logs are stored on-device by default
- Server logs have documented retention (30–90 days maximum)
- Crash reports are opt-in and contain no user data

## Authentication

- Authentication is always optional for local-only features
- OAuth 2.0 / OIDC preferred over password-based auth
- Session tokens survive app restart
- MFA supported where provider allows

## Manual Tasks

- [ ] Implement permission request dialogs with platform API calls
- [ ] Integrate authentication flow (OAuth, sign-in button)
- [ ] Set up credential store integration (Keychain / Keystore)
- [ ] Write privacy policy content
- [ ] Add telemetry opt-in/opt-out toggle in settings
- [ ] Implement safe defaults (all tracking off)
- [ ] Add rate limiting to API endpoints (if applicable)
- [ ] Audit dependencies for vulnerabilities
- [ ] Set up automated dependency scanning in CI
- [ ] Test account deletion flow (self-service)
- [ ] Verify crash reports contain no PII
- [ ] Review that no dark patterns exist in the UI

---

*See [SECURITY_PRIVACY_STANDARD](https://github.com/sparshsam/kovina/blob/main/standards/shared/SECURITY_PRIVACY_STANDARD.md) for full requirements.*
