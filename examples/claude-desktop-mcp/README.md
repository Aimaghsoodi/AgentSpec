# Claude Desktop + AgentSpec MCP

Connect AgentSpec to Claude Desktop via MCP.

## What This Does

- Claude can read AgentSpec files
- Query agent capabilities
- Check enforcement status
- Verify constraints

## Setup

Edit Claude Desktop config:

```json
{
  "mcpServers": {
    "agentspec": {
      "command": "agentspec-mcp"
    }
  }
}
```

## Usage

In Claude:

```
What are the capabilities of my customer support agent?
Show me the boundaries for the finance agent
Check if this action violates the spec
```

## See Also

- Config: `claude_desktop_config.json`
