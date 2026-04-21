# Contributing to Curatrix

Thanks for your interest in contributing. Curatrix is a TypeScript/Node monorepo — please read this before opening a PR.

## Setup

```bash
git clone https://github.com/debuggpilot-create/Curatrix.git
cd Curatrix
npm install
npm run build
npm test
```

## Project Structure

| Directory | Role |
|---|---|
| `packages/core` | Scan engine, issue types, fix logic, AI audit |
| `packages/cli` | CLI entry, banner, output formatters |
| `packages/adapters` | OSV provider, adapter stubs |
| `packages/mcp-server` | MCP stdio server |
| `fixtures/` | Test fixture projects |
| `tests/` | Integration and MCP contract tests |

## Development Workflow

```bash
npm run build        # build all packages
npm test             # build + run all tests
npm run lint         # tsc type-check (no emit)
npm run link         # link CLI globally for local testing
npm run mcp:start    # start MCP server with tsx
```

## Guidelines

**Code style**
- TypeScript strict mode — no `any` unless unavoidable and documented
- ESM only — no CommonJS `require()`
- Keep packages lean — avoid adding dependencies without discussion

**Issues and rules**
- New scan rules go in the appropriate module inside `packages/core/src/`
- Every new rule needs a `ruleId`, `category`, `severity`, `title`, `why`, and at least one test fixture case
- Rule IDs follow the pattern `<module>.<rule-slug>` (e.g. `deps.missing-lockfile`)

**Fix engine**
- Only add deterministic fixes for narrow, safe cases
- Always create `.bak` backups before patching
- Document the fix in the `fix_pipeline` section of `PROJECT_CONTEXT.md` if you update it

**Tests**
- Tests live in `tests/` and use `node:test`
- Add fixture projects to `fixtures/` for new scan behaviors
- MCP contract tests should cover any new tool shape changes

## Pull Request Checklist

- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] `npm run lint` passes with no errors
- [ ] New behavior is covered by at least one test
- [ ] Docs updated if public API changed

## Reporting Issues

Open a GitHub issue with:
- Curatrix version (`curatrix --version`)
- Node version (`node --version`)
- The command you ran
- Expected vs actual behavior
- Relevant output (redact any secrets)

## License

By contributing, you agree your contributions will be licensed under the [MIT License](./LICENSE).
