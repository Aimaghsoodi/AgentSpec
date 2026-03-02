# AgentSpec: Declarative Agent Behavior Specifications

[![npm version](https://img.shields.io/npm/v/@agentspec/core.svg)](https://www.npmjs.com/package/@agentspec/core)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**Your AI agents are powerful. But can you prove what they will and won't do?**

AgentSpec is a declarative specification language for defining, documenting, and enforcing AI agent behavior. It gives you a machine-readable contract for what an agent can do, what it must never do, and how it should escalate when uncertain.

## Why AgentSpec?

Every AI agent has implicit behavior rules scattered across system prompts, code comments, and tribal knowledge. AgentSpec makes them explicit, testable, and enforceable.

- **Capabilities** — What the agent can do (actions, tools, APIs)
- **Boundaries** — What the agent must never do (hard limits, safety rails)
- **Obligations** — What the agent must always do (logging, disclosure, compliance)
- **Escalation Rules** — When to hand off to humans or other agents
- **Inheritance** — Compose specs from organization-wide policies down to individual agents

## Quick Start

```bash
npm install @agentspec/core
```

```typescript
import { AgentSpec } from '@agentspec/core';

// Parse a spec file
const spec = AgentSpec.parse(`
  version: "1.0"
  agent:
    name: "customer-service-bot"
    role: "Customer support assistant"
  capabilities:
    - name: "answer_questions"
      description: "Answer product questions"
  boundaries:
    - name: "no_refunds"
      description: "Cannot process refunds over $100"
      condition:
        field: "refund_amount"
        operator: "greater_than"
        value: 100
`);

// Validate the spec
const result = spec.validate();
console.log(result.valid); // true

// Check if an action is allowed
const check = spec.checkAction('process_refund', { refund_amount: 50 });
console.log(check.allowed); // true
```

## Packages

| Package | Description |
|---------|-------------|
| [`@agentspec/core`](./packages/agentspec-core/) | Core library — parse, validate, lint, diff specs |
| [`@agentspec/enforcer`](./packages/agentspec-enforcer/) | Runtime enforcement — check actions against specs |
| [`agentspec`](./packages/agentspec-cli/) | CLI tool — lint, validate, diff from the terminal |

## Spec Format

AgentSpec files use YAML with the `.agentspec.yaml` extension:

```yaml
version: "1.0"
agent:
  name: "code-review-bot"
  role: "Automated code reviewer"
  version: "2.1.0"

capabilities:
  - name: "review_pull_requests"
    description: "Review PRs for code quality"
    tools: ["github_api", "static_analysis"]

boundaries:
  - name: "no_merge"
    description: "Cannot merge PRs without human approval"
    severity: "critical"

obligations:
  - name: "log_all_reviews"
    description: "Must log every review decision"
    trigger: "on_review_complete"

escalation_rules:
  - name: "security_finding"
    description: "Escalate security issues to security team"
    condition:
      field: "finding_type"
      operator: "equals"
      value: "security"
    target: "security-team"
```

## Part of OpenClaw

AgentSpec is part of the [OpenClaw](https://github.com/Aimaghsoodi) ecosystem for sovereign AI agents:

- **[GoalOS](https://github.com/Aimaghsoodi/GoalOS)** — Structured intent graphs for AI alignment
- **[FailSafe](https://github.com/Aimaghsoodi/FailSafe)** — AI failure intelligence platform
- **AgentSpec** — Declarative agent behavior specifications

## License

MIT
