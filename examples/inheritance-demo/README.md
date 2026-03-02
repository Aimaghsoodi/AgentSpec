# AgentSpec Inheritance Demo

Demonstrate spec inheritance from company-level down to individual agents.

## What This Does

- Shows hierarchical spec inheritance
- Company-wide policies
- Division-specific constraints
- Team-level customizations

## Example Hierarchy

```
Company Base (company-base.agentspec.yaml)
  ├─ Safety requirements
  ├─ Data handling rules
  └─ Compliance obligations

    └─ Engineering Division (engineering-division.agentspec.yaml)
         ├─ Inherits company policies
         └─ Adds code generation rules

         └─ Frontend Team (frontend-team.agentspec.yaml)
              ├─ Inherits company + division
              └─ Adds frontend-specific tools
```

## Files

- `company-base.agentspec.yaml` - Organization-wide spec
- `engineering-division.agentspec.yaml` - Inherits from company
- `frontend-team.agentspec.yaml` - Inherits from division

## Usage

```yaml
inherits:
  - ../company-base.agentspec.yaml

capabilities:
  # Adds to inherited capabilities
  - action: frontend_testing
```

## Benefits

- DRY (Don't Repeat Yourself)
- Consistent policies across org
- Easy to update at any level
- Clear authority structure

## See Also

- Spec files: *.agentspec.yaml in this directory
