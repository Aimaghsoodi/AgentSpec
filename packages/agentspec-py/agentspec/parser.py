"""AgentSpec Parser - Parse YAML/JSON into AgentSpecFile"""

from __future__ import annotations

import json
from typing import Literal, Optional

import yaml

from .types import AgentSpecFile

FormatType = Literal["json", "yaml", "xml"]


def parse_json(input_str: str) -> AgentSpecFile:
    try:
        data = json.loads(input_str)
        return AgentSpecFile(**data)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON: {e}")


def parse_yaml(input_str: str) -> AgentSpecFile:
    try:
        data = yaml.safe_load(input_str)
        if not isinstance(data, dict):
            raise ValueError("YAML did not produce an object")
        return AgentSpecFile(**data)
    except yaml.YAMLError as e:
        raise ValueError(f"Failed to parse YAML: {e}")


def detect_format(input_str: str) -> FormatType:
    trimmed = input_str.strip()
    if trimmed.startswith("{") or trimmed.startswith("["):
        return "json"
    if trimmed.startswith("<"):
        return "xml"
    if ":" in trimmed:
        return "yaml"
    return "json"


def parse_spec(input_str: str, format: Optional[FormatType] = None) -> AgentSpecFile:
    fmt = format or detect_format(input_str)
    if fmt == "json":
        return parse_json(input_str)
    elif fmt == "yaml":
        return parse_yaml(input_str)
    else:
        raise ValueError(f"Unsupported format: {fmt}")
