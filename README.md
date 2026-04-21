<p align="center">
  <img src="./banner.png" alt="Curatrix banner" width="100%" />
</p>

<h1 align="center">CURATRIX 🛡️</h1>

<p align="center"><strong>Local-first project security auditing with AI-powered insights</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/curatrix"><img src="https://img.shields.io/npm/v/curatrix?label=npm&logo=npm&color=gold" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/curatrix"><img src="https://img.shields.io/npm/dm/curatrix?label=downloads&logo=npm&color=gold" alt="npm downloads"></a>
  <a href="https://github.com/debuggpilot-create/Curatrix/actions/workflows/release.yml"><img src="https://img.shields.io/github/actions/workflow/status/debuggpilot-create/Curatrix/release.yml?branch=main&label=ci%2Fcd&color=gold" alt="CI status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-gold" alt="MIT License"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#what-curatrix-scans">What It Scans</a> ·
  <a href="#output-formats">Output</a> ·
  <a href="#fix-workflow">Fix Workflow</a> ·
  <a href="#mcp-integration">MCP</a> ·
  <a href="#configuration">Config</a>
</p>

---

Curatrix is a **TypeScript/Node monorepo** for local-first project security auditing. It scans dependencies, secrets, infrastructure, CI pipelines, and AI-agent surfaces — then produces evidence-rich findings, narrow review-first fixes, and MCP-friendly structured responses for AI tools and IDEs.

## Quick Start

### Install the CLI

```bash
npm install -g curatrix
```

### Run a scan

```bash
curatrix scan .
```

### Output as markdown (great for PRs)

```bash
curatrix scan . --format markdown > curatrix-report.md
```

---

## Packages

| Package | Purpose |
|---|---|
| `curatrix` | CLI for scans, fixes, JSON output, markdown reports, and structured help |
| `curatrix-core` | Core scan engine, issue contracts, config loading, baseline logic, AI audit, and fix orchestration |
| `curatrix-adapters` | External providers and adapter implementations, including OSV integration |
| `curatrix-mcp-server` | MCP stdio server exposing Curatrix as tools for AI agents and IDEs |

---

## What Curatrix Scans

### 📦 Dependencies and Supply Chain

- Weak or floating version ranges in `package.json`
- Risky lifecycle scripts (`preinstall`, `install`, `postinstall`, `prepare`)
- Suspicious install scripts using shell/download/decode patterns
- Missing lockfiles
- OSV-backed vulnerability lookups for npm packages
- Usage-aware severity reduction for direct dependencies
- Transitive dependency depth scanning from `package-lock.json`
- Package reputation checks based on age, author history, and suspicious release patterns
- VEX-aware suppression for known `not_affected` components

### 🔐 Secrets and Git Hygiene

- Regex-based secret detection
- High-entropy token detection
- `.env` ignore hygiene checks
- Git history attribution for recoverable secrets
- Redacted evidence in output

### 🏗️ Infrastructure and CI

- Docker `:latest` usage
- Missing non-root `USER` in Dockerfiles
- Broad `COPY . .` ordering before build steps
- Privileged containers
- Secret logging in CI workflows
- Missing visible test steps in GitHub Actions

### 🤖 AI-Agent Security

- Missing `<SYSTEM>` / `<USER>` delimiters
- Direct prompt concatenation risks
- Unsafe `eval()` and `exec()` usage
- Exposed `0.0.0.0` bind addresses
- Debug mode enabled in agent-related files

---

## Output Formats

Curatrix supports three output formats:

| Format | Use case |
|---|---|
| `text` | Human-readable terminal output with static and AI findings separated |
| `json` | Full structured `ScanResult` payload |
| `markdown` | GitHub-flavored table for PR comments and reports |

```bash
curatrix scan . --format markdown > curatrix-report.md
curatrix scan . --format json
curatrix scan . --format text
```

---

## AI Audit

Curatrix supports optional AI-assisted semantic auditing powered by OpenAI.

```bash
curatrix scan . --enable-ai-audit --ai-key <OPENAI_API_KEY>
```

When enabled, Curatrix samples source and documentation files and asks the OpenAI Responses API for findings related to:

- Malware-like behavior
- Prompt injection
- Suspicious permissions

AI findings are returned with `source: "ai"`, a `remediation` field, and an optional `patch`.

> **Note:** AI audit is opt-in and sends sampled file content to OpenAI when enabled. It is off by default.

---

## Fix Workflow

Curatrix uses a **review-first fix model** — scan first, preview, then apply.

```bash
# Find issues
curatrix scan .

# Preview a fix
curatrix fix . --issue <id> --dry-run

# Apply it
curatrix fix . --issue <id> --apply
```

**Currently supported deterministic fixes:**

- Adding `.env` to `.gitignore`
- Adding a non-root `USER` to Dockerfiles
- Replacing `0.0.0.0` with `127.0.0.1`
- Wrapping prompts with `<SYSTEM>` and `<USER>` delimiters

Curatrix can also apply simple AI-generated unified diff patches and run `npm install ...` when a remediation explicitly provides that command.

---

## Configuration

**Project config:** `.curatrixrc.json`  
**Global config:** `~/.curatrix/config.json`  
**Ignored rules:** `.curatrixignore.json`

```json
{
  "modules": {
    "dependencies": true,
    "secrets": true,
    "infrastructure": true,
    "aiAgent": false
  },
  "severityOverrides": {
    "deps.missing-lockfile": "critical"
  },
  "baselineDir": ".curatrix-baselines",
  "maxDepth": 4,
  "vexFile": ".curatrix.vex.json"
}
```

---

## Baselines

Track findings over time with local baseline snapshots.

```bash
curatrix scan . --baseline set
curatrix scan . --baseline compare
```

Baseline compare classifies issues as `new` or `unchanged`, and reports a resolved count based on fingerprints no longer present.

---

## MCP Integration

Curatrix ships with an **MCP stdio server** for AI agents and IDEs like Cursor and Windsurf.

### Client config

```json
{
  "mcpServers": {
    "curatrix": {
      "command": "npx",
      "args": ["-y", "curatrix-mcp-server"]
    }
  }
}
```
### Direct Binary
```json
{
  "mcpServers": {
    "curatrix": {
      "command": "curatrix-mcp"
    }
  }
}
```
### MCP Tools

| Tool | Purpose |
|---|---|
| `curatrix_scan` | Run a Curatrix scan and return structured results |
| `curatrix_fix` | Apply supported fixes and return a structured change summary |

### `correctionContext`

The MCP server adds `correctionContext` to issues so AI agents can explain or act on findings more safely.

```json
{
  "ruleId": "deps.provider-vulnerability",
  "severity": "high",
  "correctionContext": {
    "type": "dependency-update",
    "action": "Upgrade or replace the vulnerable dependency after reviewing the advisory.",
    "reasoning": "I recommend updating this dependency because the current version is tied to a reported vulnerability and the safer version reduces known risk.",
    "confidence": 0.8
  }
}
```

---

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run link         # link CLI globally for local testing
npm run mcp:start    # start MCP server with tsx
npm run pack:dry     # dry-run pack to inspect the CLI bundle
```

### Monorepo structure

```
Curatrix/
├─ packages/
│  ├─ core/          # scan engine, types, fix logic, AI audit
│  ├─ cli/           # end-user CLI, banner, output formatters
│  ├─ adapters/      # OSV provider, adapter stubs
│  └─ mcp-server/    # MCP stdio server
├─ fixtures/         # test fixtures
├─ tests/            # node:test integration + MCP contract tests
├─ docs/
├─ banner.png
└─ README.md
```

---

## Testing

```bash
npm test
```

Covers:

- Dependency and infrastructure findings
- AI-agent findings
- Deterministic fix preview and apply
- Baseline save and compare
- Git-history secret attribution
- Config toggles and ignored rules
- Transitive CVE depth and VEX suppression
- MCP correction context and fix summary contracts

---

## Current Limitations

Not yet implemented:

- SQLite-backed history and trends
- SBOM generation
- License compliance checks
- Malware / YARA scanning
- Remote MCP transport (SSE)
- Plugin runtime / sandbox system
- A `list_rules` MCP tool
- Richer ecosystem support beyond npm

Known caveats:

- AI audit is opt-in and sends sampled file content to OpenAI when enabled
- Dependency usage correlation is lightweight string/import matching, not full AST
- The patch applier is intentionally simple and optimized for narrow safe cases

---

## Contributing

1. Fork the repo
2. Create a branch
3. Make your changes
4. Run `npm run build` and `npm test`
5. Open a pull request

---

## License

[MIT](./LICENSE)

---

<p align="center">Built with 🛡️ for developers who ship secure code</p>