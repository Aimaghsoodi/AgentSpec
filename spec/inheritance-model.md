# AgentSpec Inheritance Model

## Overview

The AgentSpec inheritance model enables composition of agent specifications through classical object-oriented-style inheritance.

## Key Principles

### 1. Depth-First, Left-to-Right Traversal

When resolving `inherits_from`, AgentSpec uses depth-first, left-to-right (DFS-LR) traversal.

### 2. Most-Restrictive-Wins

When specifications conflict, the **most restrictive** version wins:
- Stricter boundaries override looser ones
- Lower capability limits override higher ones
- More obligations are required (both parent AND child)

### 3. Name-Based Merging

Elements with the same name are considered the same entity and merged according to type.

## Resolution Algorithm

### Phase 1: Build Dependency Graph

1. For each spec in `inherits_from`:
   - Recursively load parent spec
   - Build dependency graph
   - Detect cycles (error if found)

2. Perform topological sort using DFS-LR

### Phase 2: Merge Specifications

For each spec in order:
- Merge capabilities
- Merge boundaries
- Merge obligations
- Merge verification

## Merging Rules

### Capability Merging

```
merged.resources = union(parent.resources, child.resources)
merged.actions = union(parent.actions, child.actions)
merged.limit = min(parent.limit, child.limit)          # More restrictive
merged.timeout = min(parent.timeout, child.timeout)
merged.conditions = AND(parent.conditions, child.conditions)
```

### Boundary Merging

```
merged.applies_to = union(parent.applies_to, child.applies_to)
merged.deny_patterns = union(parent.deny_patterns, child.deny_patterns)
merged.deny_domains = union(parent.deny_domains, child.deny_domains)
merged.severity = max_severity(parent, child)          # More restrictive
```

### Obligation Merging

```
merged.applies_to = union(parent.applies_to, child.applies_to)
merged.require = union(parent.require, child.require)  # Both required
merged.transparency = max_transparency(parent, child)
merged.audit = max_audit(parent, child)
```

## Example: Retail Division Inheriting from Company Base

```
company-base.yaml
├── capabilities: [internal_communication, directory_access]
├── boundaries: [protect_pii, no_unauthorized_communication]
└── obligations: [log_communication, audit_access]

retail-division.yaml inherits from company-base.yaml
├── capabilities: [customer_database_access]  # Added
├── boundaries: [pci_compliance]              # Added
└── obligations: [customer_consent]           # Added

Final merged result:
├── capabilities:
│   ├── internal_communication (from parent)
│   ├── directory_access (from parent)
│   └── customer_database_access (from child)
├── boundaries:
│   ├── protect_pii (from parent)
│   ├── no_unauthorized_communication (from parent)
│   └── pci_compliance (from child)
└── obligations:
    ├── log_communication (from parent)
    ├── audit_access (from parent)
    └── customer_consent (from child)
```

## Handling Cycles

The inheritance resolution algorithm detects cycles:

```
# a.yaml inherits from b.yaml
# b.yaml inherits from a.yaml
# ERROR: Circular inheritance detected
```

## Multiple Inheritance

When a spec inherits from multiple parents, resolution follows DFS-LR order.

## Override Behavior

Child specs can override parent specs by using the same element name:

```yaml
# Parent
- name: query_database
  limit: 100000

# Child (overrides with more restrictive limit)
- name: query_database
  limit: 1000
```

The child's more restrictive limit wins.

## Practical Patterns

### Team Hierarchy

```
company-base.yaml
├── engineering-team.yaml
│   ├── backend-agent.yaml
│   └── frontend-agent.yaml
└── marketing-team.yaml
    └── campaign-agent.yaml
```

### Environment-Specific Policies

```
policy-base.yaml
├── policy-dev.yaml      (loose for development)
├── policy-staging.yaml  (medium restrictions)
└── policy-prod.yaml     (strict for production)
```

## Summary

The AgentSpec inheritance model provides:

1. **Clarity** — Formal, well-defined resolution algorithm
2. **Safety** — Most-restrictive-wins ensures security
3. **Composability** — Specs can be hierarchically organized
4. **Predictability** — Deterministic DFS-LR resolution order
5. **Conflict-free** — Automated merging with clear rules
