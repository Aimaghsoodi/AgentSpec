"""Tests for AgentSpec parser"""

import json

import pytest
import yaml

from agentspec import parse_spec, parse_json, parse_yaml, detect_format

SAMPLE_SPEC = {
    "version": "1.0",
    "agent": {
        "id": "test-agent",
        "name": "Test Agent",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    },
    "capabilities": [
        {
            "id": "cap1",
            "name": "read",
            "category": "data",
            "enabled": True,
            "riskLevel": "low",
        }
    ],
    "boundaries": [
        {
            "id": "bound1",
            "name": "no-pii",
            "type": "data",
            "enabled": True,
            "condition": {"type": "field", "field": "has_pii"},
            "actions": ["block"],
            "priority": 1,
            "enforcement": "block",
        }
    ],
}


def test_parse_json():
    spec = parse_json(json.dumps(SAMPLE_SPEC))
    assert spec.version == "1.0"
    assert spec.agent.name == "Test Agent"
    assert len(spec.capabilities) == 1


def test_parse_yaml():
    spec = parse_yaml(yaml.dump(SAMPLE_SPEC))
    assert spec.version == "1.0"
    assert len(spec.boundaries) == 1


def test_detect_format_json():
    assert detect_format('{"version": "1.0"}') == "json"


def test_detect_format_yaml():
    assert detect_format("version: 1.0\nagent:") == "yaml"


def test_parse_spec_auto():
    spec = parse_spec(json.dumps(SAMPLE_SPEC))
    assert spec.version == "1.0"


def test_parse_invalid_json():
    with pytest.raises(ValueError, match="Failed to parse JSON"):
        parse_json("{invalid json")
