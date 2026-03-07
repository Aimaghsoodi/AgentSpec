"""AgentSpec OpenAI Integration"""

from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional

from ..enforcer import Enforcer, create_context, create_violation
from ..types import AgentSpecFile, Violation


class AgentSpecOpenAIGuard:
    """Wraps OpenAI client to enforce AgentSpec boundaries before API calls."""

    def __init__(
        self,
        client: Any,
        spec: AgentSpecFile,
        on_violation: Optional[Callable[[Violation], None]] = None,
    ):
        self.client = client
        self.enforcer = Enforcer(spec)
        self.on_violation = on_violation
        self.violations: List[Violation] = []

    def chat_completion(self, **kwargs: Any) -> Any:
        ctx = create_context(
            agent_id="openai-agent",
            action="chat_completion",
            input_data=kwargs.get("messages", []),
        )
        result = self.enforcer.enforce(ctx)
        if not result.allowed:
            self.violations.extend(result.violations)
            if self.on_violation:
                for v in result.violations:
                    self.on_violation(v)
            raise PermissionError(
                f"AgentSpec enforcement blocked request: {result.violations[0].message}"
            )
        return self.client.chat.completions.create(**kwargs)

    def get_violations(self) -> List[Violation]:
        return list(self.violations)

    def clear(self) -> None:
        self.violations.clear()
        self.enforcer.clear_violations()
