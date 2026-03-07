"""Tests for AgentSpec validator"""

import pytest

from agentspec import validate_spec, validate_agent, validate_capability, validate_boundary


def test_validate_valid_spec():
    result = validate_spec({
        "version": "1.0",
        "agent": {"id": "test", "name": "Test"},
        "capabilities": [
            {"id": "c1", "name": "read", "category": "data", "enabled": True, "riskLevel": "low"}
        ],
        "boundaries": [
            {"id": "b1", "name": "deny", "type": "security", "enabled": True, "enforcement": "block"}
        ],
    })
    assert result.valid is True


def test_validate_missing_version():
    result = validate_spec({"capabilities": [], "boundaries": []})
    assert result.valid is False
    assert any(e.code == "MISSING_REQUIRED_FIELD" for e in result.errors)


def test_validate_agent():
    errors = validate_agent({"id": "test", "name": "Test"})
    assert len(errors) == 0


def test_validate_agent_missing_id():
    errors = validate_agent({"name": "Test"})
    assert any(e.path == "agent.id" for e in errors)


def test_validate_capability():
    errors = validate_capability({
        "id": "c1", "name": "read", "category": "data",
        "enabled": True, "riskLevel": "low",
    })
    assert len(errors) == 0


def test_validate_invalid_risk_level():
    errors = validate_capability({
        "id": "c1", "name": "r", "category": "d",
        "enabled": True, "riskLevel": "invalid",
    })
    assert any(e.code == "INVALID_ENUM_VALUE" for e in errors)


def test_validate_empty_spec():
    result = validate_spec(None)
    assert result.valid is False
    assert any(e.code == "INVALID_SPEC" for e in result.errors)
