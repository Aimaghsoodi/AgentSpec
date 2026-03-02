# @agentspec/enforcer

Runtime enforcement library for AgentSpec - execute and validate agent specifications.

## What is @agentspec/enforcer?

The enforcer applies AgentSpec specifications at runtime. It checks permissions before actions, tracks resource usage, logs audit trails, and prevents spec violations.

## Installation

npm install @agentspec/enforcer

## Quick Start

import { Enforcer } from "@agentspec/enforcer";
import { AgentSpec } from "@goalos/agentspec-core";

const spec = await AgentSpec.fromFile("claude.agent");
const enforcer = new Enforcer(spec);

// Check permission before action
if (enforcer.canExecute("write", "code")) {
  // Safe to execute
  await writeCode(changes);
  enforcer.recordAction("write", "code", { files: 3 });
} else {
  throw new Error("Permission denied by spec");
}

// Get audit log
const log = enforcer.getAuditLog();
console.log("Actions taken:", log);

## API

### Enforcer

class Enforcer:
  spec: AgentSpec
  context: ExecutionContext

Methods:
  - canExecute(action, resource, context?) - Check if allowed
  - checkBoundaries(context) - Verify within limits
  - recordAction(action, resource, metadata) - Log action
  - recordViolation(action, reason) - Log violation attempt
  - getAuditLog() - Get full action log
  - getMetrics() - Resource usage stats
  - reset() - Clear tracking data
  - enforce(fn) - Wrap function with enforcement

### Checks

Pre-check (before action):

enforcer.preCheck({
  action: "write",
  resource: "code",
  metadata: { files: 5, lines: 1000 }
});

Post-check (after action):

enforcer.postCheck({
  action: "write",
  resource: "code",
  result: { success: true, filesWritten: 5 },
});

## Examples

### Enforcing Token Limits

const enforcer = new Enforcer(spec);

const currentUsage = enforcer.getMetrics();
const tokenSpent = currentUsage.tokens;
const maxTokens = spec.boundaries.maxTokenSpend;

if (tokenSpent >= maxTokens) {
  throw new Error("Token limit exceeded");
}

### Enforcing Retries

const retries = enforcer.getMetrics().retries;
const maxRetries = spec.boundaries.maxRetries;

if (retries >= maxRetries) {
  throw new Error("Retry limit exceeded");
}

### Wrapped Function Execution

const writeCodeEnforced = enforcer.enforce(async (changes) => {
  return await writeCode(changes);
}, { action: "write", resource: "code" });

// Automatic checking and logging
await writeCodeEnforced(myChanges);

### Audit Trail

const log = enforcer.getAuditLog();

log.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.action} ${entry.resource}`);
  console.log(`  Allowed: ${entry.allowed}`);
  console.log(`  Metadata: ${JSON.stringify(entry.metadata)}`);
});

## Violation Handling

Violations are logged but not thrown by default:

enforcer.on("violation", (violation) => {
  console.error("Spec violation:", violation);
  // Send to monitoring, trigger alert, etc.
});

Or throw:

enforcer.setThrowOnViolation(true);
// Now enforcer throws on any violation

## Metrics

enforcer.getMetrics() returns:

{
  actions: 42,
  violations: 0,
  tokens: 45000,
  maxTokens: 100000,
  retries: 3,
  maxRetries: 5,
  requestSize: 4096,
  maxRequestSize: 8192,
  startTime: "2024-03-01T12:00:00Z",
  lastAction: "2024-03-01T12:30:45Z"
}

## Context Passing

Enforcement can use execution context:

enforcer.setContext({
  userId: "user123",
  sessionId: "sess_abc",
  ipAddress: "192.168.1.1",
  timestamp: new Date().toISOString(),
});

Context is included in all audit logs.

## Testing

npm test

Includes:
- Permission checks
- Boundary enforcement
- Metric tracking
- Audit logging
- Violation detection

## Development

npm run dev - Development mode
npm run build - Build
npm test - Test
npm run lint - Lint

## Documentation

- Main README: ../../README.md
- AgentSpec Spec: ../../spec/agentspec-lang-v0.1.md
- Core Library: ../agentspec-core/README.md
- Quickstart: ../../spec/agentspec-quickstart.md

## License

MIT - See LICENSE
