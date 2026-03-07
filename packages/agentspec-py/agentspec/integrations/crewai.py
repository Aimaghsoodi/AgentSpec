"""AgentSpec CrewAI Integration"""

from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional

from ..enforcer import Enforcer, create_context
from ..types import AgentSpecFile, Violation


class AgentSpecCrewAIGuard:
    """CrewAI step callback that enforces AgentSpec boundaries."""

    def __init__(
        self,
        spec: AgentSpecFile,
        on_violation: Optional[Callable[[Violation], None]] = None,
    ):
        self.enforcer = Enforcer(spec)
        self.on_violation = on_violation
        self.violations: List[Violation] = []

    def step_callback(self, step_output: Any) -> None:
        ctx = create_context(
            agent_id="crewai-agent",
            action="step",
            input_data=str(step_output) if step_output else "",
        )
        result = self.enforcer.enforce(ctx)
        if not result.allowed:
            self.violations.extend(result.violations)
            if self.on_violation:
                for v in result.violations:
                    self.on_violation(v)

    def get_violations(self) -> List[Violation]:
        return list(self.violations)

    def clear(self) -> None:
        self.violations.clear()
        self.enforcer.clear_violations()
