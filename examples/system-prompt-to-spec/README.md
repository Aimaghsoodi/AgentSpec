# System Prompt to AgentSpec Conversion

Convert existing system prompts to structured AgentSpec files.

## What This Does

- Parses system prompts
- Extracts capabilities, boundaries, obligations
- Creates machine-readable AgentSpec YAML
- Enables framework-agnostic enforcement

## Benefits

- Portable across agent frameworks
- Machine-readable by tools
- Enable automatic enforcement
- Better team coordination

## Quick Start

```bash
agentspec convert prompt.txt > agent.agentspec.yaml
```

## Files Included

- `example-system-prompt.txt` - Sample system prompt
- `converted.agentspec.yaml` - Converted AgentSpec

## Conversion Process

See the example files to understand the structure:
1. Raw system prompt (before)
2. Structured AgentSpec (after)

## Use Cases

- Document agent capabilities formally
- Enable enforcement in multiple frameworks
- Team collaboration on agent specs
- Audit trail for agent behavior
