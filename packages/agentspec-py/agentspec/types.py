"""
AgentSpec type definitions.

Pydantic v2 models mirroring the AgentSpec specification for defining,
documenting, and enforcing AI agent behavior.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional, Sequence, Union

from pydantic import BaseModel, Field, field_validator


# ============================================================
# ENUMS
# ============================================================


class RiskLevel(str, Enum):
    """Risk classification for capabilities."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    MINIMAL = "minimal"


class Severity(str, Enum):
    """Severity level for boundaries and violations."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EnforcementSeverity(str, Enum):
    """Severity levels used by the enforcement engine."""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class EnforcementMode(str, Enum):
    """Enforcement mode for boundaries."""

    BLOCK = "block"
    WARN = "warn"
    LOG = "log"
    ESCALATE = "escalate"


class ObligationEnforcement(str, Enum):
    """When an obligation should be enforced."""

    PRE_RESPONSE = "pre_response"
    POST_RESPONSE = "post_response"
    ALWAYS = "always"


class ViolationAction(str, Enum):
    """Action to take when a violation is detected."""

    BLOCK = "block"
    ALERT = "alert"
    LOG = "log"
    REDACT = "redact"
    ESCALATE = "escalate"


class EscalationAction(str, Enum):
    """Action to take when escalating."""

    PAUSE_AND_NOTIFY = "pause_and_notify"
    NOTIFY_AND_CONTINUE = "notify_and_continue"
    BLOCK_AND_NOTIFY = "block_and_notify"


class CheckType(str, Enum):
    """Types of verification checks."""

    PII = "pii"
    SENTIMENT = "sentiment"
    TOPIC = "topic"
    TOXICITY = "toxicity"
    LENGTH = "length"
    FORMAT = "format"
    RATE_LIMIT = "rate_limit"
    CUSTOM = "custom"


class AuditLogLevel(str, Enum):
    """What to log in the audit trail."""

    ALL = "all"
    VIOLATIONS = "violations"
    ESCALATIONS = "escalations"
    NONE = "none"


class AuditExportFormat(str, Enum):
    """Export format for audit logs."""

    JSON = "json"
    CSV = "csv"
    JSONL = "jsonl"


class ComparisonOperator(str, Enum):
    """Operators for comparison conditions."""

    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_OR_EQUAL = "greater_or_equal"
    LESS_OR_EQUAL = "less_or_equal"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"
    MATCHES = "matches"
    IN = "in"
    NOT_IN = "not_in"


class DiffChangeType(str, Enum):
    """Type of change in a diff."""

    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"


class DiffSeverity(str, Enum):
    """Whether a diff change is breaking."""

    BREAKING = "breaking"
    NON_BREAKING = "non-breaking"


class ViolationType(str, Enum):
    """Types of enforcement violations."""

    BOUNDARY_VIOLATION = "boundary_violation"
    CAPABILITY_LIMIT_EXCEEDED = "capability_limit_exceeded"
    OBLIGATION_NOT_MET = "obligation_not_met"
    PII_DETECTED = "pii_detected"
    SENTIMENT_VIOLATION = "sentiment_violation"
    TOPIC_VIOLATION = "topic_violation"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    CUSTOM_VIOLATION = "custom_violation"


# ============================================================
# CONDITION EXPRESSIONS
# ============================================================


class FieldCondition(BaseModel):
    """Condition that checks whether a field is truthy."""

    type: Literal["field"] = "field"
    field: str
    negate: bool = False


class ComparisonCondition(BaseModel):
    """Condition that compares a field against a value."""

    type: Literal["comparison"] = "comparison"
    field: str
    comparison: ComparisonOperator
    value: Any
    negate: bool = False


class RegexCondition(BaseModel):
    """Condition that matches a field against a regular expression."""

    type: Literal["regex"] = "regex"
    field: str
    value: str
    flags: Optional[str] = None
    negate: bool = False


class CustomCondition(BaseModel):
    """Custom condition evaluated by a user-provided callback."""

    type: Literal["custom"] = "custom"
    custom: str
    negate: bool = False


class LogicalCondition(BaseModel):
    """Condition that combines sub-conditions with AND/OR logic."""

    type: Literal["logical"] = "logical"
    operator: Literal["and", "or"]
    conditions: List[ConditionExpression]
    negate: bool = False


ConditionExpression = Union[
    FieldCondition,
    ComparisonCondition,
    LogicalCondition,
    RegexCondition,
    CustomCondition,
]

# Rebuild LogicalCondition to resolve the forward reference
LogicalCondition.model_rebuild()


# ============================================================
# AGENT METADATA
# ============================================================


class AgentMetadata(BaseModel):
    """Metadata describing an agent."""

    id: str
    name: str
    description: Optional[str] = None
    created_at: Optional[str] = Field(default=None, alias="createdAt")
    updated_at: Optional[str] = Field(default=None, alias="updatedAt")
    metadata: Optional[Dict[str, Any]] = None

    model_config = {"populate_by_name": True}


# ============================================================
# CAPABILITY
# ============================================================


class RateLimit(BaseModel):
    """Rate limiting configuration."""

    max_calls: int = Field(alias="maxCalls")
    window_seconds: int = Field(alias="windowSeconds")
    burst_limit: Optional[int] = Field(default=None, alias="burstLimit")
    cooldown_seconds: Optional[int] = Field(default=None, alias="cooldownSeconds")

    model_config = {"populate_by_name": True}


class CapabilityScope(BaseModel):
    """Scope restrictions for a capability."""

    domains: Optional[List[str]] = None
    resources: Optional[List[str]] = None
    data_types: Optional[List[str]] = Field(default=None, alias="dataTypes")
    max_tokens: Optional[int] = Field(default=None, alias="maxTokens")
    allowed_formats: Optional[List[str]] = Field(default=None, alias="allowedFormats")

    model_config = {"populate_by_name": True, "extra": "allow"}


class Capability(BaseModel):
    """A capability defines what an agent CAN do."""

    id: str
    name: str
    description: Optional[str] = None
    category: str = ""
    enabled: bool = True
    risk_level: RiskLevel = Field(default=RiskLevel.LOW, alias="riskLevel")
    scope: Optional[CapabilityScope] = None
    constraints: Optional[List[str]] = None
    rate_limit: Optional[RateLimit] = Field(default=None, alias="rateLimit")
    requires_approval: Optional[bool] = Field(default=None, alias="requiresApproval")
    approval_from: Optional[str] = Field(default=None, alias="approvalFrom")
    conditions: Optional[ConditionExpression] = None
    priority: Optional[int] = None

    # Legacy field for simpler specs
    action: Optional[str] = None

    model_config = {"populate_by_name": True}


# ============================================================
# BOUNDARY
# ============================================================


class BoundaryExemption(BaseModel):
    """An exemption to a boundary rule."""

    description: str
    conditions: ConditionExpression


class Boundary(BaseModel):
    """A boundary defines what an agent MUST NOT do."""

    id: str = ""
    name: str = ""
    description: Optional[str] = None
    type: str = ""
    enabled: bool = True
    condition: Optional[ConditionExpression] = None
    actions: List[str] = Field(default_factory=list)
    priority: int = 0
    enforcement: EnforcementMode = EnforcementMode.BLOCK
    severity: Optional[Severity] = None
    message: Optional[str] = None
    exemptions: Optional[List[BoundaryExemption]] = None

    # Legacy fields for simpler specs
    action: Optional[str] = None
    constraint: Optional[str] = None
    reason: Optional[str] = None

    model_config = {"populate_by_name": True}


# ============================================================
# OBLIGATION
# ============================================================


class Obligation(BaseModel):
    """An obligation defines what an agent MUST do."""

    id: str
    description: str = ""
    trigger: Optional[ConditionExpression] = None
    action: str = ""
    priority: int = 0
    enforcement: Optional[ObligationEnforcement] = None
    failure_action: Optional[ViolationAction] = Field(default=None, alias="failureAction")

    model_config = {"populate_by_name": True}


# ============================================================
# ESCALATION
# ============================================================


class EscalationRule(BaseModel):
    """A rule defining when and how to escalate."""

    id: str
    description: str = ""
    trigger: Optional[ConditionExpression] = None
    escalate_to: str = Field(default="", alias="escalateTo")
    action: EscalationAction = EscalationAction.PAUSE_AND_NOTIFY
    timeout: Optional[int] = None
    fallback_action: Optional[str] = Field(default=None, alias="fallbackAction")
    priority: Optional[int] = None
    message: Optional[str] = None

    model_config = {"populate_by_name": True}


# ============================================================
# VERIFICATION
# ============================================================


class Check(BaseModel):
    """A verification check definition."""

    id: str
    type: CheckType
    config: Optional[Dict[str, Any]] = None
    action: ViolationAction = ViolationAction.LOG
    description: Optional[str] = None


class VerificationConfig(BaseModel):
    """Configuration for pre/post-response and on-action checks."""

    pre_response: Optional[List[Check]] = Field(default=None, alias="preResponse")
    post_response: Optional[List[Check]] = Field(default=None, alias="postResponse")
    on_action: Optional[List[Check]] = Field(default=None, alias="onAction")

    model_config = {"populate_by_name": True}


# ============================================================
# AUDIT
# ============================================================


class AuditDestination(BaseModel):
    """Where to send audit logs."""

    type: Literal["file", "stdout", "webhook"]
    path: Optional[str] = None
    url: Optional[str] = None
    headers: Optional[Dict[str, str]] = None


class AuditConfig(BaseModel):
    """Audit logging configuration."""

    enabled: bool = True
    log_level: AuditLogLevel = Field(default=AuditLogLevel.ALL, alias="logLevel")
    format: str = "json"
    retention: Optional[str] = None
    export_format: Optional[AuditExportFormat] = Field(default=None, alias="exportFormat")
    destination: Optional[AuditDestination] = None

    model_config = {"populate_by_name": True}


# ============================================================
# TEST CASES
# ============================================================


class TestInput(BaseModel):
    """Input for a test case."""

    action: Optional[str] = None
    text: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    agent_id: Optional[str] = Field(default=None, alias="agentId")

    model_config = {"populate_by_name": True}


class TestExpectation(BaseModel):
    """Expected results of a test case."""

    allowed: Optional[bool] = None
    violations: Optional[List[str]] = None
    obligations: Optional[List[str]] = None
    escalations: Optional[List[str]] = None
    checks_passed: Optional[List[str]] = Field(default=None, alias="checksPassed")
    checks_failed: Optional[List[str]] = Field(default=None, alias="checksFailed")

    model_config = {"populate_by_name": True}


class TestCase(BaseModel):
    """A test case for validating spec behavior."""

    id: str
    description: str = ""
    input: TestInput
    expect: TestExpectation


# ============================================================
# AGENTSPEC FILE -- Top-level specification document
# ============================================================


class AgentSpecFile(BaseModel):
    """
    The top-level AgentSpec document.

    System prompts are suggestions. AgentSpec is a contract.
    """

    version: str = ""
    agent: Optional[AgentMetadata] = None
    capabilities: List[Capability] = Field(default_factory=list)
    boundaries: List[Boundary] = Field(default_factory=list)
    obligations: Optional[List[Obligation]] = None
    escalation_rules: Optional[List[EscalationRule]] = Field(
        default=None, alias="escalationRules"
    )
    verification: Optional[VerificationConfig] = None
    audit: Optional[AuditConfig] = None
    tests: Optional[List[TestCase]] = None
    metadata: Optional[Dict[str, Any]] = None
    inherits: Optional[List[str]] = None

    # Legacy fields for simpler spec formats
    spec_version: Optional[str] = Field(default=None, alias="specVersion")
    name: Optional[str] = None
    description: Optional[str] = None

    model_config = {"populate_by_name": True}

    def model_post_init(self, __context: Any) -> None:
        """Normalize legacy spec formats after initialization."""
        # If specVersion is set but version is not, use specVersion
        if self.spec_version and not self.version:
            self.version = self.spec_version


# ============================================================
# VALIDATION RESULT TYPES
# ============================================================


class ValidationError(BaseModel):
    """A validation error."""

    path: str
    message: str
    code: str
    schema_path: Optional[str] = Field(default=None, alias="schemaPath")

    model_config = {"populate_by_name": True}


class ValidationWarning(BaseModel):
    """A validation warning."""

    path: str
    message: str
    code: Optional[str] = None


class ValidationResult(BaseModel):
    """Result of validating an AgentSpec document."""

    valid: bool
    errors: List[ValidationError] = Field(default_factory=list)
    warnings: List[ValidationWarning] = Field(default_factory=list)


# ============================================================
# LINTING RESULT TYPES
# ============================================================


class LintSeverity(str, Enum):
    """Severity of a lint issue."""

    ERROR = "error"
    WARNING = "warning"
    SUGGESTION = "suggestion"


class LintIssue(BaseModel):
    """A lint issue found during static analysis."""

    code: str
    message: str
    location: Optional[str] = None
    severity: LintSeverity
    fix: Optional[str] = None


class LintResult(BaseModel):
    """Result of linting an AgentSpec document."""

    valid: bool
    errors: List[LintIssue] = Field(default_factory=list)
    warnings: List[LintIssue] = Field(default_factory=list)
    suggestions: List[LintIssue] = Field(default_factory=list)
    score: int = 100


# ============================================================
# DIFF TYPES
# ============================================================


class DiffChange(BaseModel):
    """A single change between two specs."""

    type: DiffChangeType
    path: List[str]
    old_value: Optional[Any] = Field(default=None, alias="oldValue")
    new_value: Optional[Any] = Field(default=None, alias="newValue")
    severity: DiffSeverity

    model_config = {"populate_by_name": True}


class DiffSummary(BaseModel):
    """Summary statistics for a diff."""

    total_changes: int = Field(alias="totalChanges")
    additions: int = 0
    removals: int = 0
    modifications: int = 0
    breaking_changes: int = Field(default=0, alias="breakingChanges")
    non_breaking_changes: int = Field(default=0, alias="nonBreakingChanges")

    model_config = {"populate_by_name": True}


class DiffResult(BaseModel):
    """Result of diffing two AgentSpec documents."""

    changes: List[DiffChange] = Field(default_factory=list)
    summary: DiffSummary


# ============================================================
# ENFORCEMENT TYPES
# ============================================================


class Violation(BaseModel):
    """A runtime enforcement violation."""

    id: str
    type: ViolationType
    severity: EnforcementSeverity
    message: str
    failed_check: Optional[str] = None
    remediation: Optional[str] = None
    action: ViolationAction = ViolationAction.LOG
    enforced: bool = False


class RequestContext(BaseModel):
    """Context for an enforcement request."""

    request_id: str = ""
    agent_id: str = ""
    action: str = ""
    resource: Optional[str] = None
    input: Any = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None
    caller: Optional[Dict[str, Optional[str]]] = None


class EnforcementResult(BaseModel):
    """Result of running enforcement checks."""

    allowed: bool
    violations: List[Violation] = Field(default_factory=list)
    audit_entries: List[Dict[str, Any]] = Field(default_factory=list)
