# AgentSpec

**Declarative Agent Behavior Specifications**

[![CI](https://github.com/Aimaghsoodi/AgentSpec/actions/workflows/ci.yml/badge.svg)](https://github.com/Aimaghsoodi/AgentSpec/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## What is AgentSpec?

AgentSpec is a declarative specification language for defining, documenting, and enforcing AI agent behavior. It gives you a machine-readable contract for what an agent can do, what it must never do, and how it should escalate when uncertain.

Every AI agent has implicit behavior rules scattered across system prompts, code comments, and tribal knowledge. AgentSpec makes them explicit, testable, and enforceable.

---

## Quick Start

### Install

```bash
npm install @agentspec/core
```

### Define a Spec

```typescript
import { AgentSpec } from '@agentspec/core';
import type { AgentSpecFile } from '@agentspec/core';

const spec: AgentSpecFile = {
  version: '1.0',
  agent: {
    id: 'customer-bot',
    name: 'Customer Service Bot',
    description: 'Handles customer inquiries and support tickets',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  capabilities: [
    {
      id: 'cap_answer',
      name: 'answer_questions',
      description: 'Answer product and billing questions',
      category: 'customer_service',
      enabled: true,
      riskLevel: 'low'
    },
    {
      id: 'cap_refund',
      name: 'process_refund',
      description: 'Process refunds up to $100',
      category: 'financial',
      enabled: true,
      riskLevel: 'high',
      requiresApproval: true,
      approvalFrom: 'manager'
    }
  ],
  boundaries: [
    {
      id: 'bound_no_large_refund',
      name: 'no_large_refunds',
      description: 'Cannot process refunds over $100',
      type: 'financial',
      enabled: true,
      condition: {
        type: 'comparison',
        field: 'refund_amount',
        comparison: 'greater_than',
        value: 100
      },
      actions: ['block', 'escalate'],
      priority: 1,
      enforcement: 'strict',
      severity: 'high'
    }
  ],
  obligations: [
    {
      id: 'obl_log',
      description: 'Log every customer interaction',
      trigger: { type: 'field', field: 'interaction_complete' },
      action: 'log_interaction',
      priority: 1,
      enforcement: 'post_response'
    }
  ],
  escalationRules: [
    {
      id: 'esc_angry',
      description: 'Escalate angry customers to human agent',
      trigger: {
        type: 'comparison',
        field: 'sentiment_score',
        comparison: 'less_than',
        value: -0.5
      },
      escalateTo: 'human-support',
      action: 'pause_and_notify'
    }
  ]
};
```

---

## Validation

Validate that a spec is well-formed and internally consistent:

```typescript
import { validateSpec } from '@agentspec/core';

const result = validateSpec(spec);

if (result.valid) {
  console.log('Spec is valid');
} else {
  result.errors.forEach(err => {
    console.error(`${err.path}: ${err.message}`);
  });
}
```

---

## Linting

Catch best-practice violations, missing boundaries, and potential issues:

```typescript
import { lintSpec } from '@agentspec/core';

const lint = lintSpec(spec);

console.log(`Score: ${lint.score}/100`);

lint.errors.forEach(issue => {
  console.error(`[ERROR] ${issue.code}: ${issue.message}`);
});

lint.warnings.forEach(issue => {
  console.warn(`[WARN] ${issue.code}: ${issue.message}`);
});

lint.suggestions.forEach(issue => {
  console.info(`[SUGGESTION] ${issue.code}: ${issue.message}`);
});
```

### Lint Rules

| Code | Description |
|------|-------------|
| `MISSING_DESCRIPTION` | Agent or capability missing description |
| `NO_BOUNDARIES` | Spec has no boundaries defined |
| `NO_ESCALATION` | Spec has no escalation rules |
| `HIGH_RISK_NO_BOUNDARY` | High-risk capability without matching boundary |
| `DUPLICATE_CAPABILITY_NAME` | Two capabilities with the same name |
| `EMPTY_ACTIONS` | Boundary has no actions defined |
| `NO_OBLIGATIONS` | Spec has no obligations defined |

---

## Diffing

Compare two spec versions to detect changes:

```typescript
import { diffSpecs } from '@agentspec/core';

const diff = diffSpecs(oldSpec, newSpec);

console.log(`Total changes: ${diff.summary.totalChanges}`);
console.log(`Breaking changes: ${diff.summary.breakingChanges}`);

diff.changes.forEach(change => {
  console.log(`${change.type} at ${change.path.join('.')}: ${change.severity}`);
});
```

### Change Types

| Type | Severity |
|------|----------|
| Capability removed | `breaking` |
| Boundary added | `non-breaking` |
| Boundary removed | `breaking` |
| Obligation modified | `non-breaking` |
| Agent metadata changed | `non-breaking` |

---

## Condition Expressions

AgentSpec uses a powerful condition system for boundaries, obligations, and escalation rules:

```typescript
// Simple comparison
const condition = {
  type: 'comparison' as const,
  field: 'amount',
  comparison: 'greater_than' as const,
  value: 1000
};

// Logical combination
const complex = {
  type: 'logical' as const,
  operator: 'and' as const,
  conditions: [
    { type: 'comparison', field: 'amount', comparison: 'greater_than', value: 100 },
    { type: 'comparison', field: 'category', comparison: 'equals', value: 'financial' }
  ]
};

// Regex matching
const pattern = {
  type: 'regex' as const,
  field: 'email',
  value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
};
```

### Supported Operators

`equals` · `not_equals` · `greater_than` · `less_than` · `greater_or_equal` · `less_or_equal` · `contains` · `not_contains` · `starts_with` · `ends_with` · `matches` · `in` · `not_in`

---

## Serialization

```typescript
import { serializeSpec, deserializeSpec } from '@agentspec/core';

// Serialize to JSON
const json = serializeSpec(spec, { format: 'json', pretty: true });

// Deserialize from JSON
const restored = deserializeSpec(json, 'json');
```

---

## Runtime Enforcement

The `@agentspec/enforcer` package provides runtime boundary checking:

```bash
npm install @agentspec/enforcer
```

```typescript
import { Enforcer } from '@agentspec/enforcer';

const enforcer = new Enforcer(spec);

// Check if an action is allowed
const result = enforcer.check('process_refund', { refund_amount: 50 });
console.log(result.allowed); // true

const blocked = enforcer.check('process_refund', { refund_amount: 200 });
console.log(blocked.allowed);    // false
console.log(blocked.violations); // boundary violations
```

---

## Packages

| Package | Description |
|---------|-------------|
| [`@agentspec/core`](./packages/agentspec-core/) | Core library — parse, validate, lint, diff, serialize specs |
| [`@agentspec/enforcer`](./packages/agentspec-enforcer/) | Runtime enforcement — check actions against spec boundaries |
| [`agentspec`](./packages/agentspec-cli/) | CLI tool — lint, validate, diff from the terminal |

---

## Core Concepts

### Capabilities
What the agent **can do**. Each capability has a name, category, risk level, and optional constraints like rate limits and approval requirements.

### Boundaries
What the agent **must never do**. Hard limits with conditions, enforcement levels, and severity ratings. When violated, boundaries trigger actions like `block`, `alert`, `log`, or `escalate`.

### Obligations
What the agent **must always do**. Triggered actions like logging, disclosure, or compliance checks that run `pre_response`, `post_response`, or `always`.

### Escalation Rules
When to **hand off to humans**. Conditions that trigger escalation with configurable actions: `pause_and_notify`, `notify_and_continue`, or `block_and_notify`.

### Inheritance
Compose specs from organization-wide policies down to individual agents. Child specs inherit parent capabilities, boundaries, and obligations.

---

## Development

```bash
git clone https://github.com/Aimaghsoodi/AgentSpec.git
cd AgentSpec
pnpm install
pnpm build
pnpm test    # 136 tests
```

---

## API Reference

### Validation
`validateSpec(spec)` — returns `{ valid, errors, warnings }`

### Linting
`lintSpec(spec)` — returns `{ valid, errors, warnings, suggestions, score }`

### Diffing
`diffSpecs(oldSpec, newSpec)` — returns `{ changes, summary }`

### Conditions
`evaluateCondition(condition, context)` — evaluate a condition expression against a context object

### Serialization
`serializeSpec(spec, options?)` · `deserializeSpec(data, format)`

### Utilities
`generateId(prefix?)` · `createCapability(input)` · `createBoundary(input)` · `createObligation(input)`

---

## License

MIT — see [LICENSE](./LICENSE).
