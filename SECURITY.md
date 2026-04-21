# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.3.x | ✅ Active |
| < 0.3 | ❌ Not supported |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues privately via GitHub's [Security Advisories](https://github.com/debuggpilot-create/Curatrix/security/advisories/new) feature.

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You can expect an acknowledgement within **48 hours** and a resolution or status update within **7 days**.

## Scope

Issues in scope:
- Remote code execution via scan inputs
- Secret leakage through Curatrix output or logs
- Supply chain issues in Curatrix's own dependencies
- AI audit data exposure (file content sent to OpenAI)

Out of scope:
- Vulnerabilities in projects *scanned by* Curatrix (that's what Curatrix finds)
- Issues requiring physical access to the machine

## Notes on AI Audit

When `--enable-ai-audit` is used, Curatrix sends sampled file content (up to 12 files, truncated to 3500 chars each) to the OpenAI Responses API. Do not enable AI audit on repositories containing unredacted secrets or sensitive PII. This is a known caveat documented in the codebase.
