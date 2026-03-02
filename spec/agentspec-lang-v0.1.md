# AgentSpec Language Specification v0.1

## Introduction

AgentSpec is a declarative language for defining what AI agents can do, what they cannot do, what they must do, and how to verify compliance. It enables organizations to compose agent behavior specifications through inheritance, enforce safety constraints, and maintain transparency about agent capabilities and limitations.

## Core Concepts

### Capabilities
Capabilities grant agents access to resources and actions. A capability is a positive permission defining:
- What resources can be accessed (files, databases, APIs, etc.)
- What actions can be performed (read, write, execute, create, delete, etc.)
- Usage limits (size, rate, timeout constraints)
- Conditional applicability (time-of-day, user-role, environment, etc.)

### Boundaries
Boundaries constrain capabilities, preventing certain actions even if the agent has a capability. They implement:
- Pattern-based denial (regex patterns that block requests)
- Domain-based denial (healthcare, financial, legal data off-limits)
- Conditional denial (deny if certain conditions are met)
- Context requirements (additional context needed before allowing access)

### Obligations
Obligations define what agents MUST do when using capabilities:
- Citation requirements (cite information sources)
- Transparency requirements (explain reasoning, disclose limitations)
- Audit requirements (log accesses, sign transactions)
- Consent requirements (obtain user permission before acting)

### Verification
Verification rules enable testing and validation:
- Capability tests (verify capabilities work correctly)
- Boundary tests (verify boundaries block intended patterns)
- Obligation tests (verify requirements are met)
- Integration tests (verify end-to-end compliance)

## Document Structure

AgentSpec documents are YAML files with:
- **metadata** — Name, version, author, description
- **spec** — Contains capabilities, boundaries, obligations, verification
- **inherits_from** — Optional list of parent specs to inherit from

## Inheritance

AgentSpec supports classical inheritance:
- Child specs inherit all parent elements
- Same-named elements are merged (not replaced)
- Most-restrictive-wins: lower limits, more patterns, higher obligations
- Depth-first, left-to-right resolution order

## Key Features

- **Composability** — Build complex policies through inheritance
- **Clarity** — Human-readable YAML with formal semantics
- **Enforcement** — Boundaries are hard constraints
- **Transparency** — Obligations require agent accountability
- **Extensibility** — Domain-specific extensions supported
- **Deterministic** — Conflict resolution follows clear rules

See the accompanying files for detailed specifications:
- agentspec-lang-v0.1.md — Complete language specification
- inheritance-model.md — Detailed inheritance semantics
- conflict-resolution.md — Formal conflict resolution rules
- schema/ — JSON Schemas for validation
- examples/ — 10 realistic example specs
