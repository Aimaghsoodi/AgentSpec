"""CrewAI Agents with AgentSpec Enforcement"""

from typing import List
from crewai import Agent, Crew
from agentspec import AgentSpec


class SpecEnforcedCrew:
    """CrewAI crew with AgentSpec enforcement."""

    def __init__(self, specs: List[str], **crew_kwargs):
        self.specs = [AgentSpec.from_file(s) for s in specs]
        self.agents = self._create_agents()
        self.crew = Crew(agents=self.agents, **crew_kwargs)

    def _create_agents(self) -> List[Agent]:
        """Create agents from AgentSpecs."""
        agents = []
        for spec in self.specs:
            agent = Agent(
                role=spec.name,
                goal=f"Execute {spec.name}",
                backstory=f"I am {spec.name}",
                tools=self._get_allowed_tools(spec),
                verbose=True
            )
            agents.append(agent)
        return agents

    def _get_allowed_tools(self, spec: AgentSpec):
        """Get only tools allowed by spec."""
        # Map spec capabilities to tools
        return []

    def kickoff(self):
        """Execute crew with enforcement."""
        return self.crew.kickoff()
