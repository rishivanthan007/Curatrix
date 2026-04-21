# 🤖 Curatrix MCP Setup Guide

Curatrix v0.3.4 ships with a working stdio MCP server through the `curatrix-mcp-server` package. This guide shows how to install it, connect it to common AI clients, verify the connection, and troubleshoot the usual gotchas.

## Installation

### Install from npm

```bash
npm install -g curatrix-mcp-server
```

### Verify the binary

```bash
curatrix-mcp --help
```

If you are running from the repository instead of the published package:

```bash
npm install
npm run build
npm run mcp:start
```

> `curatrix-mcp` runs as a stdio server. When launched directly it may look idle, which is expected until an MCP client sends a request.

## AI Agent Configurations

### Cursor IDE

Recommended for TypeScript and JavaScript development workflows.

#### Setup steps

1. Open Cursor settings for MCP or external tools.
2. Add a new MCP server entry.
3. Paste the JSON below.
4. Save and reload Cursor or restart MCP services.

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

#### Example prompts

- "Run Curatrix on this repo and summarize the highest-risk findings."
- "Use Curatrix to scan this project and tell me which issues are safest to fix first."
- "Apply Curatrix fixes for the low-risk findings and explain what changed."

### Claude Desktop

Recommended for natural-language security review and guided remediation.

#### Setup steps

1. Open the Claude Desktop MCP configuration file.
2. Add the Curatrix server block.
3. Save the file.
4. Restart Claude Desktop completely.

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

#### Example prompts

- "Use Curatrix to scan my repo and explain the results in plain English."
- "Use Curatrix to fix the safe issues and give me a summary of the file changes."
- "Ask Curatrix for dependency findings only and explain the risk."

### VS Code with GitHub Copilot

Recommended for an integrated editor workflow where your MCP extension or client supports stdio servers.

#### Setup steps

1. Open your MCP-enabled extension settings.
2. Add a server entry for Curatrix.
3. Paste the JSON configuration below.
4. Reload the extension or restart VS Code.

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

#### Example prompts

- "Run Curatrix and generate a markdown summary I can paste into a PR."
- "Use Curatrix to inspect this repo for risky install scripts and secret leaks."

### Open WebUI / OpenClaw

Recommended for custom or self-hosted agent setups.

#### Setup steps

1. Open your MCP or tools configuration page.
2. Add Curatrix as a stdio server.
3. Point the command to the published npm package or your local dev entry point.
4. Save and restart the agent runtime.

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

#### Example prompts

- "Use Curatrix to scan this codebase and report only dependency issues."
- "Use Curatrix to apply safe fixes and summarize the diff in plain English."

### Custom MCP Clients

Recommended for programmatic access from your own TypeScript tools.

#### Setup steps

1. Install the MCP server package.
2. Launch it through stdio.
3. Connect using an MCP client SDK.
4. Call `curatrix_scan` or `curatrix_fix` with JSON arguments.

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "curatrix-mcp-server"],
});

const client = new Client({ name: "curatrix-example", version: "1.0.0" });
await client.connect(transport);

const scan = await client.callTool({
  name: "curatrix_scan",
  arguments: { path: process.cwd(), format: "json" },
});

console.log(scan);
```

## Available MCP Tools

| Tool | Parameters | Returns |
| :--- | :--- | :--- |
| `curatrix_scan` | `path?: string`, `format?: "json" | "text"` | Scan summary, issues, correction context |
| `curatrix_fix` | `path?: string`, `issueIds?: string[]`, `autoConfirm?: boolean` | `fixedCount`, `changes`, `skipped`, selected issues |

> Current v0.3.4 MCP support exposes `curatrix_scan` and `curatrix_fix`.

## Tool Schemas

### `curatrix_scan`

#### Input schema

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Project root to scan. Defaults to the current working directory."
    },
    "format": {
      "type": "string",
      "enum": ["json", "text"],
      "description": "Response format. JSON is best for agent use."
    }
  },
  "additionalProperties": false
}
```

#### Example input

```json
{
  "path": "/workspace/project",
  "format": "json"
}
```

#### Example output

```json
{
  "project": {
    "name": "project",
    "root": "/workspace/project"
  },
  "summary": {
    "totalIssues": 3,
    "bySeverity": {
      "low": 0,
      "medium": 1,
      "high": 2,
      "critical": 0
    }
  },
  "issues": [
    {
      "id": "abc123",
      "ruleId": "deps.suspicious-install-script",
      "severity": "high",
      "title": "Suspicious install script detected",
      "why": "Install scripts can execute arbitrary commands during dependency installation.",
      "source": "static",
      "correctionContext": {
        "type": "dependency-review",
        "action": "Review the install script before continuing.",
        "reasoning": "I recommend reviewing this install script because it contains commands that commonly download, decode, or execute risky payloads during install.",
        "confidence": 0.94
      }
    }
  ]
}
```

### `curatrix_fix`

#### Input schema

```json
{
  "type": "object",
  "properties": {
    "path": {
      "type": "string",
      "description": "Project root to fix. Defaults to the current working directory."
    },
    "issueIds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional list of issue IDs to target."
    },
    "autoConfirm": {
      "type": "boolean",
      "description": "If true, apply supported fixes without an interactive confirmation step."
    }
  },
  "additionalProperties": false
}
```

#### Example input

```json
{
  "path": "/workspace/project",
  "issueIds": ["abc123"],
  "autoConfirm": true
}
```

#### Example output

```json
{
  "rootDir": "/workspace/project",
  "fixedCount": 1,
  "changes": [
    {
      "file": "Dockerfile",
      "changeType": "config-patch",
      "diff": "@@ -1,2 +1,3 @@",
      "reasoning": "I added a non-root USER because containers should avoid running as root by default when a safer option is available."
    }
  ],
  "skipped": []
}
```

## Testing Your Connection

1. Install `curatrix-mcp-server` or build it locally.
2. Add the Curatrix MCP config to your client.
3. Restart the client.
4. Ask the client to call `curatrix_scan`.
5. Confirm you receive a response with `summary`, `issues`, and correction context.
6. Ask the client to call `curatrix_fix` on a safe issue and confirm it returns `fixedCount`, `changes`, and `skipped`.

### Expected results

- Curatrix tools appear in the client UI.
- `curatrix_scan` returns project data and issues.
- `curatrix_fix` returns a structured fix summary.
- Paths resolve against your local workspace.

## Troubleshooting

### "Command not found"

- Reinstall with `npm install -g curatrix-mcp-server`
- Verify `curatrix-mcp --help` works in your shell
- Restart the client after installation
- Confirm your PATH includes the npm global bin directory

### "Tools not appearing"

- Re-check the JSON configuration for syntax mistakes
- Confirm your client supports stdio MCP servers
- Restart the client fully after updating the config
- Make sure the command resolves from the environment the client uses

### "MCP server hangs"

This is normal in stdio mode.

> A stdio MCP server waits for the client to send requests. It will appear idle when started manually, but that does not mean it is broken.

### "Permission denied"

For macOS or Linux, fix npm ownership and try again:

```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.config
npm install -g curatrix-mcp-server
```

### "Path does not exist"

- Make sure the `path` argument points at a real project root
- Try omitting `path` so Curatrix uses the current working directory
- Confirm the client launches the server from the workspace you expect
