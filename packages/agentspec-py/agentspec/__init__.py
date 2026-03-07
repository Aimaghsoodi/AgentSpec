"""AgentSpec - Declarative Agent Behavior Contracts"""

from .types import (
    AgentSpecFile, AgentMetadata, Capability, Boundary, Obligation,
    EscalationRule, VerificationConfig, AuditConfig, TestCase,
    ValidationResult, ValidationError, ValidationWarning,
    LintResult, LintIssue, DiffResult, DiffChange, DiffSummary,
    Violation, RequestContext, EnforcementResult,
    RiskLevel, Severity, EnforcementSeverity, EnforcementMode,
    ViolationType, ViolationAction,
)
from .parser import parse_spec, parse_json, parse_yaml, detect_format
from .validator import validate_spec, validate_agent, validate_capability, validate_boundary
from .linter import lint_spec, lint_security, lint_performance, lint_documentation
from .differ import diff_specs, categorize_diff, get_changed_elements, format_diff_as_markdown
from .enforcer import Enforcer, create_context, create_violation

__version__ = "0.1.0"
