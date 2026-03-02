# AgentSpec Quickstart

Define, compose, and enforce agent capabilities and boundaries.

## Installation

```bash
npm install @agentspec/core @agentspec/enforcer
# or Python
pip install agentspec
```

## Your First AgentSpec

Create a basic agent specification:

```yaml
# my-agent.yaml
name: "Data Analysis Agent"
version: "1.0.0"

description: |
  An agent that analyzes data and generates reports.
  Can read CSV files and create charts.

capabilities:
  data_access:
    - read: csv
    - read: json
    - read: spreadsheet
  analysis:
    - compute: statistics
    - generate: visualizations
  output:
    - write: markdown_report
    - write: pdf_report

boundaries:
  # What this agent CANNOT do
  data_modification:
    - cannot_write: databases
    - cannot_delete: any
  
  external_calls:
    - cannot_access: external_apis
    - cannot_make: http_requests
  
  resource_limits:
    max_memory: 2GB
    max_execution_time: 5m
    max_file_size: 100MB

obligations:
  # What this agent MUST do
  audit:
    - must_log: all_queries
    - must_track: file_access
  
  compliance:
    - must_respect: data_privacy
    - must_validate: inputs
  
  transparency:
    - must_explain: assumptions
    - must_cite: sources

verification:
  # How to test this agent
  tests:
    - name: "Can read CSV"
      input: "sample.csv"
      expected: "success"
    
    - name: "Cannot modify database"
      input: "drop table users"
      expected: "blocked"
    
    - name: "Must cite sources"
      output_requires: "citations"
```

Load and validate:

```typescript
import { AgentSpec, Enforcer } from '@agentspec/core';

// Load spec
const spec = AgentSpec.fromFile('my-agent.yaml');

// Validate syntax and structure
const validation = spec.validate();
if (!validation.valid) {
  console.error('Invalid spec:', validation.errors);
}

// Create enforcer
const enforcer = new Enforcer(spec);

// Enforce capabilities
const allowed = enforcer.canExecute({
  action: 'read',
  resource: 'data.csv'
});

console.log('Can execute:', allowed); // true

// This will be blocked
const blocked = enforcer.canExecute({
  action: 'write',
  resource: 'database'
});

console.log('Can execute:', blocked); // false
```

## Composition and Inheritance

Compose multiple specs:

```yaml
# company-base.yaml - All company agents
name: "Company Base Policy"
version: "1.0.0"

capabilities:
  core:
    - read: company_data
    - generate: reports

boundaries:
  security:
    - cannot_access: employee_records
    - cannot_export: to_external

obligations:
  compliance:
    - must_log: all_access
    - must_respect: data_retention
```

Inherit and extend:

```yaml
# data-analyst-role.yaml
inherits_from: "company-base.yaml"

name: "Data Analyst Agent"
version: "1.0.0"

# Additional capabilities
capabilities:
  analysis:
    - compute: statistics
    - generate: dashboards
  data_access:
    - read: customer_data  # Company policy allows this, refined here

# More restrictive boundaries
boundaries:
  security:
    - cannot_delete: any
    - cannot_share: externally
    max_report_size: 50MB

# Extended obligations
obligations:
  audit:
    - must_explain: outliers
    - must_validate: assumptions
```

## Pattern Matching and Testing

```typescript
// Test capabilities
const spec = AgentSpec.fromFile('analyst.yaml');
const enforcer = new Enforcer(spec);

// Verify capabilities work
const tests = spec.getVerificationTests();
for (const test of tests) {
  const result = await enforcer.runTest(test);
  console.log(`${test.name}: ${result.passed ? 'PASS' : 'FAIL'}`);
}

// Create a matcher for requests
const matcher = enforcer.createMatcher();

// Check if request is allowed
const request = {
  action: 'read',
  resource: 'customer_data',
  user: 'analyst_001'
};

const decision = matcher.evaluate(request);
console.log('Decision:', decision); // { allowed: true, reason: '...' }
```

## CLI

```bash
# Validate a spec
agentspec validate my-agent.yaml

# Test a spec
agentspec test my-agent.yaml

# Check capability
agentspec check-capability data_access my-agent.yaml

# Generate enforcement code
agentspec enforce my-agent.yaml --output enforcer.ts

# Compile to multiple formats
agentspec compile my-agent.yaml --targets ts,py,json

# Check inheritance/composition
agentspec show-inheritance role-spec.yaml
```

## Python

```python
from agentspec import AgentSpec, Enforcer

# Load spec
spec = AgentSpec.from_file('my-agent.yaml')

# Validate
if not spec.validate():
    print("Invalid spec")
    exit(1)

# Create enforcer
enforcer = Enforcer(spec)

# Check capability
can_read = enforcer.can_execute(
    action='read',
    resource='data.csv'
)

# Run tests
tests = spec.get_verification_tests()
for test in tests:
    result = enforcer.run_test(test)
    print(f"{test.name}: {'PASS' if result.passed else 'FAIL'}")
```

## Real-World Examples

See `../spec/examples/` for realistic configurations:

- `basic-assistant.yaml` - Simple assistant
- `company-base-policy.yaml` - Company-wide base policy
- `retail-division.yaml` - Division inheriting from company base
- `compliance-agent.yaml` - Strict compliance requirements
- `data-analyst.yaml` - Data scientist with limits
- `code-review-bot.yaml` - Code review automation
- `financial-advisor.yaml` - Financial guidance with obligations

## Next Steps

- Read [Full Language Reference](agentspec-lang-v0.1.md)
- Study [Inheritance Model](../inheritance-model.md)
- Review [Conflict Resolution](../conflict-resolution.md)
- Explore [Enforcement](agentspec-enforcement.md)
- Check [CLI Reference](agentspec-cli-reference.md)
