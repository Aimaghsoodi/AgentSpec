"""AgentSpec Validator - Validate AgentSpec objects"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List

from .types import ValidationResult, ValidationError, ValidationWarning

VALID_RISK_LEVELS = ["critical", "high", "medium", "low", "minimal"]
VALID_ENFORCEMENTS = ["block", "warn", "log", "escalate"]
ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")


def _is_valid_iso_date(s: str) -> bool:
    try:
        datetime.fromisoformat(s)
        return True
    except (ValueError, TypeError):
        return False


def validate_agent(agent: Any) -> List[ValidationError]:
    errors: List[ValidationError] = []
    if not agent or not isinstance(agent, dict):
        errors.append(ValidationError(
            path="agent", message="Agent must be an object",
            code="MISSING_REQUIRED_FIELD",
        ))
        return errors
    if not agent.get("id"):
        errors.append(ValidationError(
            path="agent.id", message="Agent id is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    elif not ID_PATTERN.match(str(agent["id"])):
        errors.append(ValidationError(
            path="agent.id", message="Agent id has invalid format",
            code="INVALID_FORMAT",
        ))
    if not agent.get("name"):
        errors.append(ValidationError(
            path="agent.name", message="Agent name is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if agent.get("createdAt") and not _is_valid_iso_date(str(agent["createdAt"])):
        errors.append(ValidationError(
            path="agent.createdAt", message="Invalid date format for createdAt",
            code="INVALID_DATE_FORMAT",
        ))
    if agent.get("updatedAt") and not _is_valid_iso_date(str(agent["updatedAt"])):
        errors.append(ValidationError(
            path="agent.updatedAt", message="Invalid date format for updatedAt",
            code="INVALID_DATE_FORMAT",
        ))
    return errors


def validate_capability(cap: Any) -> List[ValidationError]:
    errors: List[ValidationError] = []
    if not cap or not isinstance(cap, dict):
        errors.append(ValidationError(
            path="capability", message="Capability must be an object",
            code="MISSING_REQUIRED_FIELD",
        ))
        return errors
    if not cap.get("id"):
        errors.append(ValidationError(
            path="capability.id", message="Capability id is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if not cap.get("name"):
        errors.append(ValidationError(
            path="capability.name", message="Capability name is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if not cap.get("category"):
        errors.append(ValidationError(
            path="capability.category", message="Capability category is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if cap.get("enabled") is None:
        errors.append(ValidationError(
            path="capability.enabled", message="Capability enabled is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    risk = cap.get("riskLevel") or cap.get("risk_level")
    if not risk:
        errors.append(ValidationError(
            path="capability.riskLevel", message="Capability riskLevel is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    elif risk not in VALID_RISK_LEVELS:
        errors.append(ValidationError(
            path="capability.riskLevel",
            message=f"Invalid risk level: {risk}",
            code="INVALID_ENUM_VALUE",
        ))
    return errors


def validate_boundary(bound: Any) -> List[ValidationError]:
    errors: List[ValidationError] = []
    if not bound or not isinstance(bound, dict):
        errors.append(ValidationError(
            path="boundary", message="Boundary must be an object",
            code="MISSING_REQUIRED_FIELD",
        ))
        return errors
    if not bound.get("id"):
        errors.append(ValidationError(
            path="boundary.id", message="Boundary id is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if not bound.get("name"):
        errors.append(ValidationError(
            path="boundary.name", message="Boundary name is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if not bound.get("type"):
        errors.append(ValidationError(
            path="boundary.type", message="Boundary type is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if bound.get("enabled") is None:
        errors.append(ValidationError(
            path="boundary.enabled", message="Boundary enabled is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    enforcement = bound.get("enforcement")
    if not enforcement:
        errors.append(ValidationError(
            path="boundary.enforcement",
            message="Boundary enforcement is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    elif enforcement not in VALID_ENFORCEMENTS:
        errors.append(ValidationError(
            path="boundary.enforcement",
            message=f"Invalid enforcement mode: {enforcement}",
            code="INVALID_ENUM_VALUE",
        ))
    return errors


def validate_spec(spec: Any) -> ValidationResult:
    errors: List[ValidationError] = []
    warnings: List[ValidationWarning] = []

    if not spec or not isinstance(spec, dict):
        return ValidationResult(
            valid=False,
            errors=[ValidationError(
                path="", message="Spec must be an object", code="INVALID_SPEC",
            )],
            warnings=[],
        )

    if not spec.get("version"):
        errors.append(ValidationError(
            path="version", message="Version is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if not spec.get("capabilities"):
        errors.append(ValidationError(
            path="capabilities", message="Capabilities array is required",
            code="MISSING_REQUIRED_FIELD",
        ))
    if not spec.get("boundaries"):
        errors.append(ValidationError(
            path="boundaries", message="Boundaries array is required",
            code="MISSING_REQUIRED_FIELD",
        ))

    if spec.get("agent"):
        agent_data = spec["agent"]
        if hasattr(agent_data, "model_dump"):
            agent_data = agent_data.model_dump(by_alias=True)
        errors.extend(validate_agent(agent_data))

    if isinstance(spec.get("capabilities"), list):
        for cap in spec["capabilities"]:
            if hasattr(cap, "model_dump"):
                cap = cap.model_dump(by_alias=True)
            errors.extend(validate_capability(cap))

    if isinstance(spec.get("boundaries"), list):
        for bound in spec["boundaries"]:
            if hasattr(bound, "model_dump"):
                bound = bound.model_dump(by_alias=True)
            errors.extend(validate_boundary(bound))

    return ValidationResult(valid=len(errors) == 0, errors=errors, warnings=warnings)
