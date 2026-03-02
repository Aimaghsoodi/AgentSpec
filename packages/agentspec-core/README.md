# @goalos/agentspec-core

Core library for AgentSpec - define and enforce agent capabilities and boundaries.

## What is @goalos/agentspec-core?

AgentSpec is a formal specification language for defining what agents can and cannot do. It supports:

- Capability definitions (what actions are allowed)
- Boundary declarations (hard limits on behavior)
- Obligation rules (what must happen)
- Hierarchical composition (specs can inherit from others)
- Conflict resolution (deterministic handling of competing rules)
- Formal verification (prove specs are consistent)

## Installation

npm install @goalos/agentspec-core

## Quick Start

import { AgentSpec } from "@goalos/agentspec-core";

const spec = AgentSpec.parse(`
agent: claude-research
version: 1.0

capabilities:
  read:
    - documents
    - web_search
    - academic_databases
  write:
    - draft_documents
    - save_research_notes

boundaries:
  must_not:
    - contact_external_apis
    - modify_existing_documents
    - access_user_personal_data
  max_token_spend: 100000
  max_retries: 3
  max_request_size: 8KB

obligations:
  must:
    - cite_all_sources
    - flag_uncertain_claims
    - report_search_queries
`);

const canRead = spec.canCapability("read", "documents");  // true
const canModify = spec.canCapability("write", "documents"); // false

await spec.toFile("claude-research.agent");

## YAML Specification Format

agent: <agent-name>
version: <version>

capabilities:
  read: [list of readable resources]
  write: [list of writable resources]
  execute: [list of executable actions]

boundaries:
  must_not: [forbidden actions]
  max_token_spend: <number>
  max_retries: <number>
  max_request_size: <string>
  time_limit: <string>

obligations:
  must: [required actions]
  must_verify: [verification requirements]

inherits:
  - parent_spec.agent

## API

### AgentSpec

class AgentSpec:
  - name: string
  - version: string
  - capabilities: Capabilities
  - boundaries: Boundaries
  - obligations: Obligations
  - parent?: AgentSpec

Methods:
  - parse(yaml) - Parse YAML specification
  - canCapability(action, resource) - Check if allowed
  - isWithinBoundary(action) - Check boundary compliance
  - canExecute(action) - Full permission check
  - getConflicts() - Find conflicting rules
  - verify() - Prove spec is consistent
  - inherit(parent) - Inherit from parent spec
  - toYAML() - Serialize to YAML
  - toJSON() - Serialize to JSON
  - toFile(path) - Save to file
  - fromFile(path) - Load from file

## Examples

### Claude for Coding

agent: claude-coding
version: 1.0

capabilities:
  read:
    - source_code
    - file_system
    - git_history
  write:
    - source_code
    - comments
    - test_files
  execute:
    - run_tests
    - linter
    - formatter

boundaries:
  must_not:
    - push_to_main
    - delete_files
    - access_secrets
  max_file_size: 1MB

obligations:
  must:
    - include_tests
    - follow_style_guide
    - write_comments

### Research Assistant with Inheritance

agent: advanced-research
version: 1.0

inherits:
  - base-research.agent

capabilities:
  read:
    - paywalled_academic_databases

boundaries:
  max_token_spend: 200000

### Enforcing Resource Limits

const spec = AgentSpec.parse(specYaml);

if (!spec.isWithinBoundary({ type: "token_spend", value: 5000 })) {
  throw new Error("Would exceed token limit");
}

## Conflict Resolution

When specs inherit, conflicts are resolved using:
1. Most specific rule wins
2. Explicit deny overrides allow
3. Child overrides parent
4. Documented in conflict report

Example:

# parent.agent
capabilities:
  write: [all_documents]

# child.agent (inherits: parent.agent)
boundaries:
  must_not: [sensitive_documents]

Result: Can write documents except sensitive ones (child boundary applies)

## Verification

Specs can be formally verified:

const conflicts = spec.getConflicts();
if (conflicts.length > 0) {
  console.error("Spec has conflicts:", conflicts);
}

const verified = spec.verify();
if (!verified.valid) {
  console.error("Spec is inconsistent:", verified.errors);
}

## Testing

npm test

Includes:
- Spec parsing
- Permission checking
- Conflict detection
- Inheritance resolution
- Verification

## Documentation

- Main README: ../../README.md
- AgentSpec Language: ../../spec/agentspec-lang-v0.1.md
- CLI Reference: ../../spec/agentspec-cli-reference.md
- Quickstart: ../../spec/agentspec-quickstart.md

## License

MIT - See LICENSE
