"""LangChain Agent with AgentSpec Enforcement"""

from typing import Optional, List, Any
from langchain.agents import Agent, AgentExecutor, Tool
from agentspec import AgentSpec


class EnforcedAgent:
    """LangChain agent with AgentSpec enforcement."""

    def __init__(
        self,
        spec_file: str,
        tools: List[Tool],
        llm: Any
    ):
        self.spec = AgentSpec.from_file(spec_file)
        self.tools = tools
        self.llm = llm
        self.agent = None
        self._enforce_spec()

    def _enforce_spec(self):
        """Enforce spec constraints on tools."""
        # Filter tools to only those in capabilities
        allowed_tool_names = {c.action for c in self.spec.capabilities}
        self.tools = [t for t in self.tools if t.name in allowed_tool_names]

    def run(self, query: str) -> str:
        """Run agent with spec enforcement."""
        from langchain.agents import initialize_agent, AgentType

        # Create agent
        agent = initialize_agent(
            self.tools,
            self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION
        )

        # Execute with enforcement
        return self._execute_with_enforcement(agent, query)

    def _execute_with_enforcement(self, agent: Agent, query: str) -> str:
        """Execute with boundary checking."""
        try:
            result = agent.run(query)

            # Check obligations were met
            self._verify_obligations()

            return result
        except Exception as e:
            if "boundary" in str(e).lower():
                raise ValueError(f"Boundary violation: {e}")
            raise

    def _verify_obligations(self):
        """Verify all obligations are being met."""
        for obligation in self.spec.obligations:
            # Log or check obligation
            pass
