"""Tests for AgentSpec linter"""

import pytest

from agentspec.types import AgentSpecFile, AgentMetadata, Capability, Boundary
from agentspec import lint_spec, lint_security, lint_documentation


def _make_spec(**overrides) -> AgentSpecFile:
    defaults = {
        "version": "1.0",
        "agent": AgentMetadata(
            id="test", name="Test",
            created_at="2024-01-01T00:00:00Z",
            updated_at="2024-01-01T00:00:00Z",
        ),
        "capabilities": [
            Capability(
                id="c1", name="read", category="data",
                enabled=True, risk_level="low",
            )
        ],
        "boundaries": [
            Boundary(
                id="b1", name="deny", type="data", enabled=True,
                condition={"type": "field", "field": "x"},
                actions=["block"], priority=1, enforcement="block",
            )
        ],
    }
    defaults.update(overrides)
    return AgentSpecFile(**defaults)


def test_lint_valid_spec():
    result = lint_spec(_make_spec())
    assert result.valid is True
    assert result.score > 0


def test_lint_missing_version():
    spec = _make_spec(version="")
    result = lint_spec(spec)
    assert any(i.code == "MISSING_VERSION" for i in result.errors)


def test_lint_duplicate_ids():
    spec = _make_spec(capabilities=[
        Capability(id="dup", name="a", category="x", enabled=True, risk_level="low"),
        Capability(id="dup", name="b", category="y", enabled=True, risk_level="low"),
    ])
    result = lint_spec(spec)
    assert any(i.code == "DUPLICATE_ID" for i in result.errors)


def test_lint_security():
    spec = _make_spec(capabilities=[
        Capability(
            id="c1", name="admin", category="system",
            enabled=True, risk_level="critical",
        ),
    ])
    issues = lint_security(spec)
    assert any(i.code == "CRITICAL_CAPABILITY" for i in issues)


def test_lint_documentation():
    spec = _make_spec()
    spec.agent.description = None
    issues = lint_documentation(spec)
    assert any(i.code == "MISSING_DESCRIPTION" for i in issues)
