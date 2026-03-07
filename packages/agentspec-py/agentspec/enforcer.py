"""AgentSpec Enforcer - Runtime enforcement engine"""

from __future__ import annotations

import secrets
import string
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

from .types import (
    AgentSpecFile, Violation, ViolationType, ViolationAction,
    EnforcementSeverity, RequestContext, EnforcementResult,
)


def _nanoid(size: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "_-"
    return "".join(secrets.choice(alphabet) for _ in range(size))


def create_context(
    agent_id: str,
    action: str,
    input_data: Any,
    *,
    resource: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    caller: Optional[Dict[str, Optional[str]]] = None,
) -> RequestContext:
    return RequestContext(
        request_id=_nanoid(),
        agent_id=agent_id,
        action=action,
        input=input_data,
        resource=resource,
        metadata=metadata or {},
        caller=caller,
        timestamp=datetime.now(timezone.utc),
    )


def create_violation(
    type: ViolationType,
    message: str,
    severity: EnforcementSeverity = EnforcementSeverity.ERROR,
    *,
    failed_check: Optional[str] = None,
    remediation: Optional[str] = None,
    action: ViolationAction = ViolationAction.LOG,
) -> Violation:
    return Violation(
        id=_nanoid(),
        type=type,
        severity=severity,
        message=message,
        failed_check=failed_check,
        remediation=remediation,
        action=action,
        enforced=False,
    )


class Enforcer:
    """Runtime enforcement engine for AgentSpec files."""

    def __init__(self, spec: AgentSpecFile):
        self.spec = spec
        self._violations: List[Violation] = []

    def check_capability(self, action: str) -> bool:
        if not self.spec.capabilities:
            return False
        for cap in self.spec.capabilities:
            if cap.enabled and (cap.name == action or cap.category == action):
                return True
        return False

    def check_boundary(self, context: RequestContext) -> List[Violation]:
        violations: List[Violation] = []
        if not self.spec.boundaries:
            return violations
        for boundary in self.spec.boundaries:
            if not boundary.enabled:
                continue
            # Boundary enforcement is evaluated against the input
            input_str = str(context.input) if context.input else ""
            if boundary.message and boundary.message.lower() in input_str.lower():
                violations.append(create_violation(
                    type=ViolationType.BOUNDARY_VIOLATION,
                    message=f"Boundary violated: {boundary.name}",
                    severity=EnforcementSeverity.CRITICAL,
                    action=ViolationAction.BLOCK,
                ))
        return violations

    def enforce(self, context: RequestContext) -> EnforcementResult:
        violations: List[Violation] = []

        # Check capabilities
        if not self.check_capability(context.action):
            violations.append(create_violation(
                type=ViolationType.CAPABILITY_LIMIT_EXCEEDED,
                message=f"No capability found for action: {context.action}",
                severity=EnforcementSeverity.ERROR,
                action=ViolationAction.BLOCK,
            ))

        # Check boundaries
        boundary_violations = self.check_boundary(context)
        violations.extend(boundary_violations)

        allowed = not any(
            v.action == ViolationAction.BLOCK for v in violations
        )
        self._violations.extend(violations)

        return EnforcementResult(
            allowed=allowed,
            violations=violations,
        )

    def get_violations(self) -> List[Violation]:
        return list(self._violations)

    def clear_violations(self) -> None:
        self._violations.clear()
