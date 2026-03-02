# CrewAI Agents with AgentSpec Enforcement

Define and enforce AgentSpec constraints in CrewAI crews.

## What This Does

- Create CrewAI agents from AgentSpec
- Enforce role boundaries
- Verify inter-agent constraints
- Audit capability usage

## Usage

```python
from agentspec_crewai import SpecEnforcedCrew

crew = SpecEnforcedCrew(
    specs=["agent1.yaml", "agent2.yaml"],
    processes=[...],
    llm=llm
)

result = crew.kickoff()
```

## Example

```python
crew = SpecEnforcedCrew(
    specs=[
        "support-agent.yaml",  # Can answer, escalate
        "finance-agent.yaml"   # Can process refunds
    ]
)

# Agent 1 tries to access finance tools → BLOCKED
# Agent 2 tries to override support → BLOCKED
```

## See Also

- Implementation: `crew_with_spec.py`
