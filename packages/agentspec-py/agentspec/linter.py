"""AgentSpec Linter - Static analysis of AgentSpec files"""

from __future__ import annotations

from datetime import datetime
from typing import List

from .types import AgentSpecFile, LintIssue, LintResult, LintSeverity


def _is_valid_iso_date(s: str) -> bool:
    try:
        datetime.fromisoformat(s)
        return True
    except (ValueError, TypeError):
        return False


def lint_spec(spec: AgentSpecFile) -> LintResult:
    errors: List[LintIssue] = []
    warnings: List[LintIssue] = []
    suggestions: List[LintIssue] = []

    if not spec.version:
        errors.append(LintIssue(
            code="MISSING_VERSION",
            message="Spec is missing a version field",
            severity=LintSeverity.ERROR, location="version",
        ))

    if not spec.agent:
        errors.append(LintIssue(
            code="MISSING_AGENT",
            message="Spec is missing an agent field",
            severity=LintSeverity.ERROR, location="agent",
        ))
    else:
        if spec.agent.created_at and not _is_valid_iso_date(spec.agent.created_at):
            errors.append(LintIssue(
                code="INVALID_DATE_FORMAT",
                message="Agent createdAt has invalid date format",
                severity=LintSeverity.ERROR, location="agent.createdAt",
            ))
        if spec.agent.updated_at and not _is_valid_iso_date(spec.agent.updated_at):
            errors.append(LintIssue(
                code="INVALID_DATE_FORMAT",
                message="Agent updatedAt has invalid date format",
                severity=LintSeverity.ERROR, location="agent.updatedAt",
            ))

    if not spec.capabilities or len(spec.capabilities) == 0:
        errors.append(LintIssue(
            code="NO_CAPABILITIES",
            message="Spec has no capabilities defined",
            severity=LintSeverity.ERROR, location="capabilities",
        ))

    if not spec.boundaries or len(spec.boundaries) == 0:
        errors.append(LintIssue(
            code="NO_BOUNDARIES",
            message="Spec has no boundaries defined",
            severity=LintSeverity.ERROR, location="boundaries",
        ))

    # Duplicate capability IDs
    if spec.capabilities:
        cap_ids: set = set()
        for cap in spec.capabilities:
            if cap.id in cap_ids:
                errors.append(LintIssue(
                    code="DUPLICATE_ID",
                    message=f"Duplicate capability ID: {cap.id}",
                    severity=LintSeverity.ERROR,
                    location=f"capabilities.{cap.id}",
                ))
            cap_ids.add(cap.id)

    # Duplicate boundary IDs
    if spec.boundaries:
        bound_ids: set = set()
        for bound in spec.boundaries:
            if bound.id in bound_ids:
                errors.append(LintIssue(
                    code="DUPLICATE_ID",
                    message=f"Duplicate boundary ID: {bound.id}",
                    severity=LintSeverity.ERROR,
                    location=f"boundaries.{bound.id}",
                ))
            bound_ids.add(bound.id)

    # High-risk capabilities without corresponding boundary
    if spec.capabilities:
        for cap in spec.capabilities:
            risk = cap.risk_level
            risk_val = risk.value if hasattr(risk, "value") else str(risk)
            if risk_val in ("critical", "high"):
                has_boundary = any(
                    b.type == cap.category
                    for b in (spec.boundaries or [])
                )
                if not has_boundary:
                    errors.append(LintIssue(
                        code="HIGH_RISK_NO_BOUNDARY",
                        message=f'High-risk capability "{cap.id}" has no corresponding boundary',
                        severity=LintSeverity.ERROR,
                        location=f"capabilities.{cap.id}",
                    ))

    score = max(0, 100 - len(errors) * 15 - len(warnings) * 5 - len(suggestions) * 2)
    return LintResult(
        valid=len(errors) == 0,
        errors=errors, warnings=warnings, suggestions=suggestions,
        score=score,
    )


def lint_security(spec: AgentSpecFile) -> List[LintIssue]:
    issues: List[LintIssue] = []
    if spec.capabilities:
        for cap in spec.capabilities:
            risk = cap.risk_level
            risk_val = risk.value if hasattr(risk, "value") else str(risk)
            if risk_val == "critical":
                issues.append(LintIssue(
                    code="CRITICAL_CAPABILITY",
                    message=f"Critical capability detected: {cap.id}",
                    severity=LintSeverity.WARNING,
                    location=f"capabilities.{cap.id}",
                ))
    if spec.audit and not spec.audit.enabled:
        issues.append(LintIssue(
            code="AUDIT_DISABLED",
            message="Audit logging is disabled",
            severity=LintSeverity.WARNING, location="audit",
        ))
    return issues


def lint_performance(spec: AgentSpecFile) -> List[LintIssue]:
    issues: List[LintIssue] = []
    if spec.boundaries and len(spec.boundaries) > 50:
        issues.append(LintIssue(
            code="TOO_MANY_BOUNDARIES",
            message=f"Spec has {len(spec.boundaries)} boundaries, which may impact performance",
            severity=LintSeverity.WARNING, location="boundaries",
        ))
    if spec.capabilities and len(spec.capabilities) > 100:
        issues.append(LintIssue(
            code="TOO_MANY_CAPABILITIES",
            message=f"Spec has {len(spec.capabilities)} capabilities, which may impact performance",
            severity=LintSeverity.WARNING, location="capabilities",
        ))
    return issues


def lint_documentation(spec: AgentSpecFile) -> List[LintIssue]:
    issues: List[LintIssue] = []
    if spec.agent and not spec.agent.description:
        issues.append(LintIssue(
            code="MISSING_DESCRIPTION",
            message="Agent is missing a description",
            severity=LintSeverity.WARNING, location="agent.description",
        ))
    if spec.capabilities:
        for cap in spec.capabilities:
            if not cap.description:
                issues.append(LintIssue(
                    code="MISSING_DESCRIPTION",
                    message=f'Capability "{cap.id}" is missing a description',
                    severity=LintSeverity.WARNING,
                    location=f"capabilities.{cap.id}.description",
                ))
    return issues
