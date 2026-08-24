# Security Policy

Thank you for helping keep **opentime** and the OpenApps collection safe. We take
security seriously and appreciate coordinated, responsible disclosure.

## Reporting a Vulnerability

**Please do NOT open a public issue for security vulnerabilities.**

Use GitHub's private vulnerability reporting instead:

1. Open the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Complete the form with as much detail as you can provide.

Reports are visible only to the repository owner and are handled confidentially.
If private vulnerability reporting is unavailable, contact the maintainer via
their GitHub profile: https://github.com/sparshsam

### What to include

- A clear summary of the vulnerability
- The affected component, file, endpoint, or version
- Step-by-step reproduction instructions (or a minimal proof of concept)
- The impact if exploited
- A suggested fix or mitigation, if you have one
- Any relevant CWE or CVSS score

## Scope

**In scope:**

- All source code, configuration, and CI/CD workflows in this repository
- Production deployments built from this repository
- Associated API servers, MCP servers, and integrations

**Out of scope:**

- Vulnerabilities in third-party dependencies — these are tracked automatically
  by Dependabot alerts; report them upstream unless you have a working exploit
  against this repository's specific use of the dependency
- Issues requiring physical access to a user's device
- Self-XSS or social-engineering attacks against individual users

## Response Expectations

- We will acknowledge your report within 3 business days.
- We will confirm the vulnerability and assess impact with you.
- We follow coordinated disclosure: fixes ship first, details are published
  after users have had a reasonable window to update.

## Supported Versions

Security fixes are applied to the latest release. Verify you are running the
most recent version before reporting.
