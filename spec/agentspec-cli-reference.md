# AgentSpec CLI Reference

Command-line interface for AgentSpec.

## Installation

```bash
npm install -g @agentspec/cli
# or
npm install --save-dev @agentspec/cli
npx agentspec <command>
```

## Commands

### init

Create a new AgentSpec.

```bash
agentspec init

# With options
agentspec init --name "Data Analyst" --version 1.0.0
```

Creates `agentspec.yaml` in current directory.

### validate

Validate a spec file.

```bash
agentspec validate agent.yaml

# Verbose output
agentspec validate agent.yaml --verbose

# Multiple files
agentspec validate *.yaml
```

Checks:
- Valid YAML syntax
- Required fields present
- Valid capability/boundary names
- No conflicting rules
- Inheritance chain valid

### test

Run verification tests.

```bash
agentspec test agent.yaml

# Run specific test
agentspec test agent.yaml --test "can_read_csv"

# Show test details
agentspec test agent.yaml --verbose

# Generate test report
agentspec test agent.yaml --report tests.json
```

### check-capability

Check if a capability is allowed.

```bash
agentspec check-capability data_access agent.yaml

# Check specific action
agentspec check-capability data_access \
  --action read \
  --resource customer_data \
  agent.yaml
```

### check-boundary

Check if an action is within boundaries.

```bash
agentspec check-boundary agent.yaml \
  --action write \
  --resource database \
  --user analyst

# Verbose (show why)
agentspec check-boundary agent.yaml \
  --action delete \
  --resource any \
  --verbose
```

### enforce

Generate enforcement code.

```bash
# Generate TypeScript enforcer
agentspec enforce agent.yaml --output enforcer.ts

# Generate Python enforcer
agentspec enforce agent.yaml --language python --output enforcer.py

# Generate JSON enforcer (for runtime)
agentspec enforce agent.yaml --format json --output enforcer.json
```

### compile

Compile spec to multiple formats.

```bash
# All formats
agentspec compile agent.yaml

# Specific formats
agentspec compile agent.yaml --targets ts,py,json

# Output directory
agentspec compile agent.yaml --output ./generated/
```

Generates:
- TypeScript type definitions
- Python Pydantic models
- JSON Schema
- Markdown documentation
- OpenAPI spec

### show-inheritance

Visualize inheritance chain.

```bash
agentspec show-inheritance role.yaml

# Show full tree
agentspec show-inheritance role.yaml --tree

# Export as JSON
agentspec show-inheritance role.yaml --format json
```

Example output:
```
Role Inheritance

role.yaml
  └── inherits_from: company-base.yaml
      └── inherits_from: global-policy.yaml

Effective spec merges:
  1. global-policy.yaml (most general)
  2. company-base.yaml (middle)
  3. role.yaml (most specific)
```

### diff

Show differences between two specs.

```bash
agentspec diff v1.yaml v2.yaml

# Show what was added
agentspec diff v1.yaml v2.yaml --added

# Show what was removed
agentspec diff v1.yaml v2.yaml --removed

# Show what changed
agentspec diff v1.yaml v2.yaml --changed
```

### lint

Lint a spec for best practices.

```bash
agentspec lint agent.yaml

# Show all issues
agentspec lint agent.yaml --strict

# Specific rules
agentspec lint agent.yaml --rules capabilities,boundaries

# Fix automatically
agentspec lint agent.yaml --fix
```

### docs

Generate documentation.

```bash
# Generate Markdown docs
agentspec docs agent.yaml --output README.md

# Generate HTML docs
agentspec docs agent.yaml --format html --output docs.html

# Generate with examples
agentspec docs agent.yaml --include-examples --include-tests
```

### merge

Merge multiple specs.

```bash
# Merge two specs
agentspec merge base.yaml role.yaml --output merged.yaml

# Merge multiple
agentspec merge base.yaml *.yaml --output merged.yaml

# Strategy
agentspec merge base.yaml role.yaml \
  --strategy most_restrictive \
  --output merged.yaml
```

Strategies:
- `most_restrictive` - Take most strict rules from each
- `latest_wins` - Later specs override earlier
- `error_on_conflict` - Fail if conflicting

## Global Options

```bash
# Specific config file
agentspec --config ~/.agentspec/config.yaml validate agent.yaml

# Verbose output
agentspec --verbose validate agent.yaml

# JSON output
agentspec --json test agent.yaml

# Color output
agentspec --color validate agent.yaml

# No color
agentspec --no-color validate agent.yaml
```

## Configuration

`~/.agentspec/config.yaml`:

```yaml
defaults:
  language: typescript
  format: yaml
  output_dir: ./generated

validation:
  strict: true
  warn_on_missing: true
  max_inheritance_depth: 5

testing:
  timeout: 5000
  parallel: true

cli:
  colors: true
  verbose: false
```

## Examples

```bash
# Typical workflow
agentspec init
agentspec validate agent.yaml
agentspec test agent.yaml
agentspec enforce agent.yaml --output enforcer.ts
agentspec docs agent.yaml --output README.md

# Check specific capability
agentspec check-capability data_access agent.yaml

# Show inheritance
agentspec show-inheritance role.yaml --tree

# Merge with base
agentspec merge company-base.yaml role.yaml --output final.yaml

# Lint before commit
agentspec lint agent.yaml --strict

# Generate docs
agentspec docs agent.yaml --format html --output docs/
```

## Tips

- Use `--json` for scripting
- Combine with `jq` for filtering
- Use `--verbose` to debug issues
- Run `test` before deploying
- Keep base policies simple, inherit in roles
