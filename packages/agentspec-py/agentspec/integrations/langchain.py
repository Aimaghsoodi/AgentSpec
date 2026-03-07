"""AgentSpec LangChain Integration"""

from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional

from ..enforcer import Enforcer, create_context
from ..types import AgentSpecFile, Violation

try:
    from langchain_core.callbacks import BaseCallbackHandler

    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    BaseCallbackHandler = object  # type: ignore[misc,assignment]


class AgentSpecLangChainGuard(BaseCallbackHandler):  # type: ignore[misc]
    """LangChain callback that enforces AgentSpec boundaries."""

    def __init__(
        self,
        spec: AgentSpecFile,
        on_violation: Optional[Callable[[Violation], None]] = None,
    ):
        if HAS_LANGCHAIN:
            super().__init__()
        self.enforcer = Enforcer(spec)
        self.on_violation = on_violation
        self.violations: List[Violation] = []

    def on_tool_start(
        self, serialized: Dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        tool_name = serialized.get("name", "unknown")
        ctx = create_context(
            agent_id="langchain-agent", action=tool_name, input_data=input_str,
        )
        result = self.enforcer.enforce(ctx)
        if not result.allowed:
            self.violations.extend(result.violations)
            if self.on_violation:
                for v in result.violations:
                    self.on_violation(v)

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        ctx = create_context(
            agent_id="langchain-agent", action="llm_call", input_data=prompts,
        )
        result = self.enforcer.enforce(ctx)
        if not result.allowed:
            self.violations.extend(result.violations)

    def get_violations(self) -> List[Violation]:
        return list(self.violations)

    def clear(self) -> None:
        self.violations.clear()
        self.enforcer.clear_violations()
