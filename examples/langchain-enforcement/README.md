# LangChain Agent with AgentSpec Enforcement

Enforce AgentSpec constraints in LangChain agents automatically.

## What This Does

- Load AgentSpec YAML
- Enforce capabilities at runtime
- Block boundary violations
- Verify obligations

## Installation

```bash
pip install langchain agentspec
```

## Usage

```python
from agentspec_langchain import EnforcedAgent

agent = EnforcedAgent(
    spec_file="agent.agentspec.yaml",
    tools=[...],
    llm=OpenAI()
)

# Automatically enforced
result = agent.run("Query users table")
```

## How It Works

1. Load AgentSpec from YAML
2. Before each tool call, check:
   - Is this tool in capabilities?
   - Does it violate boundaries?
3. During execution:
   - Log as obligation audit trail
4. After execution:
   - Verify obligations were met

## Example

```python
spec = AgentSpec.from_file("customer-support.yaml")

agent = EnforcedAgent(
    spec=spec,
    tools=[refund_tool, escalate_tool, answer_tool],
    llm=llm
)

# Automatically enforced
agent.run("Process refund of $50")  # OK
agent.run("Process refund of $500")  # BLOCKED (exceeds boundary)
```

## See Also

- Implementation: `agent_with_spec.py`
- Spec example: ../system-prompt-to-spec/converted.agentspec.yaml
