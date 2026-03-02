# AgentSpec Conflict Resolution

## Overview

When merging AgentSpec documents, conflicts arise when two specs define elements differently. This document specifies AgentSpec's deterministic conflict resolution rules.

## Core Principle: Most-Restrictive-Wins

When in doubt, choose the option that restricts agent behavior the most.

This prioritizes safety and compliance over convenience.

---

## Conflict Categories

### 1. Named Element Conflicts

When two specs define capabilities/boundaries/obligations with the same name.

#### Rule 1.1: Same-Named Capability

When merging capabilities with the same name:

```
result.resources = union(parent.resources, child.resources)
result.actions = union(parent.actions, child.actions)
result.limit = min(parent.limit, child.limit)      # Lower limit
result.timeout = min(parent.timeout, child.timeout)
result.conditions = AND(parent.conditions, child.conditions)
```

**Example:**

Parent: `read_database` with limit=100000
Child: `read_database` with limit=1000

**Result:** limit=1000 (more restrictive)

#### Rule 1.2: Same-Named Boundary

When merging boundaries with the same name:

```
result.applies_to = union(parent.applies_to, child.applies_to)
result.deny_patterns = union(parent.deny_patterns, child.deny_patterns)
result.deny_domains = union(parent.deny_domains, child.deny_domains)
result.severity = max_severity(parent.severity, child.severity)
```

**Example:**

Parent: denies [ssn, credit_card]
Child: denies [ssn, credit_card, email]

**Result:** denies [ssn, credit_card, email]

#### Rule 1.3: Same-Named Obligation

When merging obligations with the same name:

```
result.applies_to = union(parent.applies_to, child.applies_to)
result.require = union(parent.require, child.require)       # Both required
result.transparency = max_transparency(parent, child)
result.audit = max_audit(parent, child)
result.consent_required = parent OR child                   # If either true, both
```

---

### 2. Capability vs. Boundary Conflicts

When a boundary denies what a capability allows:

**Rule:** The boundary wins.

```
if boundary.denies(capability.action):
  allow_action = false
```

---

### 3. Multiple Boundary Conflicts

When multiple boundaries apply to the same capability:

**Rule:** Boundary union (logical AND) — if ANY boundary denies, access is denied.

```
if ANY boundary.denies(action):
  deny_action = true
else:
  allow_action = true
```

---

### 4. Obligation Conflicts

When multiple obligations apply to the same capability:

**Rule:** Obligation union (logical AND) — ALL obligations must be satisfied.

```
required_items = union of all obligations.require
if NOT all_required_items_present:
  refuse_action = true
```

---

### 5. Timeout Conflicts

Lower timeout wins:

```
result.timeout = min(parent.timeout, child.timeout)
```

---

### 6. Severity Level Conflicts

Higher severity wins (info < warning < critical):

```
result.severity = max_severity(parent.severity, child.severity)
```

---

### 7. Resource Conflicts

Resources are combined (union):

```
result.resources = union(parent.resources, child.resources)
```

---

### 8. Action Conflicts

Only actions in BOTH specs are allowed (intersection — most restrictive):

```
result.actions = intersection(parent.actions, child.actions)
```

**Example:**

Parent: [read, write, delete]
Child: [read, write]

**Result:** [read, write] (delete removed)

---

### 9. Limit Conflicts

Lower limit wins:

```
result.limit = min(parent.limit, child.limit)
```

Applies to:
- Size limits (100MB, 50MB → 50MB)
- Count limits (1000, 500 → 500)
- Rate limits (100req/hour, 10req/hour → 10req/hour)

---

## Resolution Algorithm

```
Input: List of specs to merge (in order)
Output: Merged spec with all conflicts resolved

Algorithm:
  result = empty spec

  For each spec in merge_order:
    for each capability:
      if capability.name in result:
        result[name] = merge_capability(result[name], capability)
      else:
        result[name] = capability

    for each boundary:
      if boundary.name in result:
        result[name] = merge_boundary(result[name], boundary)
      else:
        result[name] = boundary

    for each obligation:
      if obligation.name in result:
        result[name] = merge_obligation(result[name], obligation)
      else:
        result[name] = obligation

    result.verification.add_all(spec.verification)

  return result
```

---

## Examples

### Example 1: Simple Limit Conflict

```yaml
# spec-a.yaml
capabilities:
  - name: api_access
    limit: 100

# spec-b.yaml (inherits from spec-a.yaml)
capabilities:
  - name: api_access
    limit: 10
```

**Resolution:** Use 10 (lower, more restrictive)

---

### Example 2: Complex Conflict

```yaml
# parent.yaml
capabilities:
  - name: database_access
    resources: [db:prod]
    actions: [read, write]
    limit: 1000000

# child.yaml
capabilities:
  - name: database_access
    resources: [db:cache]
    actions: [read]
    limit: 10000

boundaries:
  - name: no_pii
    applies_to: [database_access]
    deny_patterns: [ssn, email]
```

**Merged result:**
- resources: [db:prod, db:cache]  # Union
- actions: [read]                  # Intersection (write removed)
- limit: 10000                     # Lower limit
- deny_patterns: [ssn, email]

---

## Conflict Prevention Best Practices

### 1. Use Meaningful Names

```yaml
# Good
- name: customer_data_read
- name: customer_data_write

# Bad
- name: access
- name: db
```

### 2. Document Intent

```yaml
- name: api_rate_limit
  description: "Prevents API throttling"
  limit: 1000req/hour
```

### 3. Test Resolution

Use verification rules to ensure conflicts resolve as expected.

### 4. Use Namespaces

```yaml
metadata:
  namespace: team_name
```

---

## Summary

AgentSpec's conflict resolution follows simple, deterministic rules:

1. **Most-restrictive-wins** — Lower limits, higher restrictions
2. **Union on scope** — More resources, more patterns to block
3. **AND for conditions** — All conditions must be met
4. **Deterministic** — Same inputs always produce same output
5. **Safe** — Defaults to denying access when in doubt

These rules ensure that inherited specs are always at least as safe as their parents, preventing security regressions.
