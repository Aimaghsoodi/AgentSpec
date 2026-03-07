"""Tests for AgentSpec enforcer"""

import pytest

from agentspec import Enforcer, create_context, create_violation
from agentspec.types import (
    AgentSpecFile, AgentMetadata, Capability, Boundary,
    ViolationType, EnforcementSeverity,
)


def _make_spec() -> AgentSpecFile:
    return AgentSpecFile(
        version="1.0",
        agent=AgentMetadata(id="test", name="Test Agent"),
        capabilities=[
            Capability(
                id="read", name="read", category="data",
                enabled=True, risk_level="low",
            ),
            Capability(
                id="write", name="write", category="data",
                enabled=True, risk_level="medium",
            ),
        ],
        boundaries=[
            Boundary(
                id="b1", name="no-delete", type="data",
                enabled=True, enforcement="block",
                actions=["block"], priority=1,
            ),
        ],
    )


def test_enforcer_allowed():
    enforcer = Enforcer(_make_spec())
    ctx = create_context(agent_id="agent-1", action="read", input_data="test")
    result = enforcer.enforce(ctx)
    assert result.allowed is True


def test_enforcer_denied():
    enforcer = Enforcer(_make_spec())
    ctx = create_context(agent_id="agent-1", action="delete", input_data="test")
    result = enforcer.enforce(ctx)
    assert result.allowed is False
    assert len(result.violations) > 0


def test_create_context():
    ctx = create_context(
        agent_id="agent-1", action="read", input_data="hello",
        resource="/data", metadata={"key": "val"},
    )
    assert ctx.agent_id == "agent-1"
    assert ctx.action == "read"
    assert ctx.resource == "/data"


def test_create_violation():
    v = create_violation(
        type=ViolationType.BOUNDARY_VIOLATION,
        message="Test violation",
        severity=EnforcementSeverity.ERROR,
    )
    assert v.type == ViolationType.BOUNDARY_VIOLATION
    assert v.message == "Test violation"
    assert v.enforced is False


def test_enforcer_tracks_violations():
    enforcer = Enforcer(_make_spec())
    ctx1 = create_context(agent_id="a", action="delete", input_data="x")
    ctx2 = create_context(agent_id="a", action="destroy", input_data="y")
    enforcer.enforce(ctx1)
    enforcer.enforce(ctx2)
    assert len(enforcer.get_violations()) >= 2
    enforcer.clear_violations()
    assert len(enforcer.get_violations()) == 0
