# AGENTSPEC — Complete Claude Code Implementation Prompt

You are building **AgentSpec** — an open-source declarative language and runtime for defining AI agent behavior contracts. Think of it as **"Terraform for AI agent permissions"** — a machine-readable, composable, testable specification that defines what an AI agent **can do**, **must not do**, **must always do**, and **when to escalate**.

System prompts are natural language suggestions that get ignored, diluted, or contradicted. AgentSpec is a structured, enforceable contract with inheritance, conflict resolution, runtime enforcement, audit logging, and built-in testing.

You are building this as a production-ready, publishable open-source project. Every package must be fully functional, tested, documented, and ready for npm/PyPI publishing.

---

## PROJECT STRUCTURE

```
agentspec/
├── README.md                              # Project overview, quickstart, badges
├── LICENSE                                # MIT License
├── CONTRIBUTING.md                        # Contribution guidelines
├── CHANGELOG.md                          # Version history
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                        # CI: lint, test, build on every PR
│   │   ├── publish-npm.yml               # Publish to npm on tag
│   │   └── publish-pypi.yml              # Publish to PyPI on tag
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
│
├── spec/                                  # The AgentSpec Language Specification
│   ├── README.md                         # Spec overview and rationale
│   ├── agentspec-lang-v0.1.md            # Full language specification (4000+ words)
│   ├── inheritance-model.md              # Inheritance and composition model
│   ├── conflict-resolution.md            # Conflict resolution strategies
│   ├── schema/
│   │   ├── agentspec.schema.json         # JSON Schema for full AgentSpec files
│   │   ├── capability.schema.json        # JSON Schema for Capability objects
│   │   ├── boundary.schema.json          # JSON Schema for Boundary objects
│   │   ├── obligation.schema.json        # JSON Schema for Obligation objects
│   │   └── verification.schema.json      # JSON Schema for Verification/Check objects
│   └── examples/
│       ├── customer-support.agentspec.yaml       # Customer support agent
│       ├── code-review.agentspec.yaml            # Code review agent
│       ├── medical-info.agentspec.yaml           # Medical information agent
│       ├── financial-advisor.agentspec.yaml      # Financial advisor agent
│       ├── content-moderator.agentspec.yaml      # Content moderation agent
│       ├── knowledge-base.agentspec.yaml         # Knowledge base agent
│       ├── sales-outreach.agentspec.yaml         # Sales outreach agent
│       ├── hr-recruiter.agentspec.yaml           # HR recruiter agent
│       ├── company-base-policy.agentspec.yaml    # Company-wide base policy
│       └── retail-division.agentspec.yaml        # Division policy (inherits from company-base)
│
├── packages/
│   ├── agentspec-core/                   # Core TypeScript library
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts                  # Public API exports
│   │   │   ├── types.ts                  # All TypeScript interfaces/types
│   │   │   ├── parser.ts                 # YAML/JSON parser → AgentSpecFile
│   │   │   ├── spec.ts                   # AgentSpec class — the core abstraction
│   │   │   ├── capability.ts             # Capability matching and evaluation
│   │   │   ├── boundary.ts               # Boundary detection and enforcement
│   │   │   ├── obligation.ts             # Obligation trigger evaluation
│   │   │   ├── escalation.ts             # Escalation rule evaluation
│   │   │   ├── inheritance.ts            # Spec inheritance and composition
│   │   │   ├── conflict.ts               # Conflict detection and resolution
│   │   │   ├── condition.ts              # Condition expression evaluator
│   │   │   ├── validation.ts             # Schema validation using Ajv
│   │   │   ├── linter.ts                 # Static analysis and linting
│   │   │   ├── diff.ts                   # Compare two AgentSpec files
│   │   │   ├── test-runner.ts            # Run embedded test cases against spec
│   │   │   ├── serialization.ts          # YAML/JSON serialization/deserialization
│   │   │   └── utils.ts                  # ID generation, timestamps, helpers
│   │   └── tests/
│   │       ├── parser.test.ts
│   │       ├── spec.test.ts
│   │       ├── capability.test.ts
│   │       ├── boundary.test.ts
│   │       ├── obligation.test.ts
│   │       ├── escalation.test.ts
│   │       ├── inheritance.test.ts
│   │       ├── conflict.test.ts
│   │       ├── condition.test.ts
│   │       ├── validation.test.ts
│   │       ├── linter.test.ts
│   │       ├── diff.test.ts
│   │       ├── test-runner.test.ts
│   │       ├── serialization.test.ts
│   │       └── fixtures/
│   │           ├── valid-spec.yaml
│   │           ├── complex-spec.yaml
│   │           ├── invalid-spec.yaml
│   │           ├── base-policy.yaml
│   │           ├── child-policy.yaml
│   │           ├── conflicting-specs.yaml
│   │           ├── spec-with-tests.yaml
│   │           └── minimal-spec.yaml
│   │
│   ├── agentspec-enforcer/               # Runtime enforcement engine
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts                  # Public API exports
│   │   │   ├── enforcer.ts              # Main Enforcer class
│   │   │   ├── pre-check.ts             # Pre-response checks
│   │   │   ├── post-check.ts            # Post-response checks
│   │   │   ├── action-check.ts          # Action authorization checks
│   │   │   ├── audit-log.ts             # Audit logging system
│   │   │   ├── violation.ts             # Violation handling (block, alert, log, redact)
│   │   │   ├── context.ts               # Enforcement context management
│   │   │   ├── adapters/
│   │   │   │   ├── index.ts             # Adapter interface
│   │   │   │   ├── generic.ts           # Generic adapter (any framework)
│   │   │   │   ├── express.ts           # Express.js middleware adapter
│   │   │   │   ├── langchain.ts         # LangChain callback handler adapter
│   │   │   │   ├── crewai.ts            # CrewAI adapter
│   │   │   │   └── mcp.ts              # MCP tool wrapper adapter
│   │   │   └── checks/
│   │   │       ├── index.ts             # Check registry
│   │   │       ├── pii.ts              # PII detection check
│   │   │       ├── sentiment.ts         # Sentiment analysis check
│   │   │       ├── topic.ts             # Topic classification check
│   │   │       ├── rate-limit.ts        # Rate limiting check
│   │   │       └── custom.ts            # Custom check handler interface
│   │   └── tests/
│   │       ├── enforcer.test.ts
│   │       ├── pre-check.test.ts
│   │       ├── post-check.test.ts
│   │       ├── action-check.test.ts
│   │       ├── audit-log.test.ts
│   │       ├── violation.test.ts
│   │       ├── context.test.ts
│   │       ├── adapters/
│   │       │   ├── generic.test.ts
│   │       │   ├── express.test.ts
│   │       │   └── langchain.test.ts
│   │       └── checks/
│   │           ├── pii.test.ts
│   │           ├── sentiment.test.ts
│   │           ├── topic.test.ts
│   │           └── rate-limit.test.ts
│   │
│   ├── agentspec-cli/                    # CLI tool
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts                  # CLI entry point (#!/usr/bin/env node)
│   │   │   ├── commands/
│   │   │   │   ├── init.ts              # agentspec init — create new spec file
│   │   │   │   ├── validate.ts          # agentspec validate — validate spec
│   │   │   │   ├── lint.ts              # agentspec lint — lint for issues
│   │   │   │   ├── test.ts              # agentspec test — run embedded tests
│   │   │   │   ├── diff.ts             # agentspec diff — compare two specs
│   │   │   │   ├── resolve.ts           # agentspec resolve — resolve inheritance
│   │   │   │   ├── convert.ts           # agentspec convert — system prompt to spec
│   │   │   │   └── visualize.ts         # agentspec visualize — render spec visually
│   │   │   ├── display.ts               # Terminal formatting, colors, tables
│   │   │   └── config.ts                # CLI configuration (~/.agentspec/config.json)
│   │   └── tests/
│   │       ├── commands/
│   │       │   ├── init.test.ts
│   │       │   ├── validate.test.ts
│   │       │   ├── lint.test.ts
│   │       │   ├── test.test.ts
│   │       │   ├── diff.test.ts
│   │       │   └── resolve.test.ts
│   │       └── display.test.ts
│   │
│   ├── agentspec-mcp/                    # MCP Server for AI agent integration
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts                  # MCP server entry point
│   │   │   ├── server.ts                # MCP server setup with stdio transport
│   │   │   ├── tools.ts                 # Tool definitions (6 tools)
│   │   │   ├── handlers.ts             # Tool call handlers
│   │   │   └── config.ts                # Server configuration
│   │   └── tests/
│   │       ├── server.test.ts
│   │       ├── tools.test.ts
│   │       └── handlers.test.ts
│   │
│   └── agentspec-py/                     # Python SDK
│       ├── pyproject.toml
│       ├── agentspec/
│       │   ├── __init__.py
│       │   ├── types.py                  # Pydantic models
│       │   ├── parser.py                 # YAML/JSON parser
│       │   ├── spec.py                   # AgentSpec class
│       │   ├── enforcer.py              # Enforcer class
│       │   ├── linter.py                # Linter
│       │   ├── validator.py             # Schema validation
│       │   ├── diff.py                  # Spec diffing
│       │   ├── test_runner.py           # Test runner
│       │   ├── condition.py             # Condition evaluator
│       │   ├── serialization.py         # YAML/JSON serialization
│       │   └── adapters/
│       │       ├── __init__.py
│       │       ├── langchain.py         # LangChain adapter
│       │       └── crewai.py            # CrewAI adapter
│       └── tests/
│           ├── test_parser.py
│           ├── test_spec.py
│           ├── test_enforcer.py
│           ├── test_linter.py
│           ├── test_diff.py
│           ├── test_test_runner.py
│           ├── test_condition.py
│           └── conftest.py              # Shared fixtures
│
├── website/                              # Landing page + documentation
│   ├── index.html                        # Single-page landing site
│   ├── docs/
│   │   ├── quickstart.md
│   │   ├── language-reference.md
│   │   ├── inheritance.md
│   │   ├── enforcement.md
│   │   ├── mcp-integration.md
│   │   ├── cli-reference.md
│   │   ├── python-sdk.md
│   │   └── examples.md
│   └── blog/
│       └── manifesto.md                  # The manifesto blog post
│
└── examples/
    ├── system-prompt-to-spec/            # Convert existing system prompts to AgentSpec
    │   ├── README.md
    │   ├── example-system-prompt.txt
    │   └── converted.agentspec.yaml
    ├── langchain-enforcement/            # LangChain agent with AgentSpec enforcement
    │   ├── README.md
    │   └── agent_with_spec.py
    ├── crewai-enforcement/               # CrewAI agents with AgentSpec enforcement
    │   ├── README.md
    │   └── crew_with_spec.py
    ├── express-middleware/                # Express API with AgentSpec middleware
    │   ├── README.md
    │   ├── package.json
    │   └── src/server.ts
    ├── claude-desktop-mcp/               # Connect AgentSpec to Claude Desktop via MCP
    │   ├── README.md
    │   └── claude_desktop_config.json
    └── inheritance-demo/                 # Demonstrate spec inheritance
        ├── README.md
        ├── company-base.agentspec.yaml
        ├── engineering-division.agentspec.yaml
        └── frontend-team.agentspec.yaml
```

---

## DETAILED TECHNICAL SPECIFICATIONS

### 1. CORE DATA TYPES (packages/agentspec-core/src/types.ts)

```typescript
// ============================================================
// AGENTSPEC FILE — Top-level specification document
// ============================================================

export interface AgentSpecFile {
  specVersion: string;                     // Spec version "0.1.0"
  name: string;                            // Unique spec identifier, e.g., "customer-support-agent"
  description?: string;                    // Human-readable description of the agent's role
  inherits?: string[];                     // Parent spec file paths for inheritance
  capabilities: Capability[];              // What the agent CAN do
  boundaries: Boundary[];                  // What the agent MUST NOT do
  obligations: Obligation[];               // What the agent MUST ALWAYS do
  escalation?: EscalationRule[];           // When the agent should hand off to a human
  verification?: VerificationConfig;       // Runtime verification checks
  audit?: AuditConfig;                     // Audit logging configuration
  tests?: TestCase[];                      // Embedded test cases
  metadata?: Record<string, unknown>;      // Extensible metadata
}

// ============================================================
// CAPABILITIES — What the agent CAN do
// ============================================================

export interface Capability {
  id: string;                              // Unique ID, e.g., "answer_product_questions"
  action: string;                          // Action verb, e.g., "answer_questions", "search_web", "send_email"
  description?: string;                    // Human-readable description
  scope?: CapabilityScope;                 // Scope constraints (domains, resources, etc.)
  constraints?: string[];                  // Free-text constraints on how the action is performed
  rateLimit?: RateLimit;                   // Rate limiting for this capability
  requiresApproval?: boolean;              // Whether action requires human approval
  approvalFrom?: string;                   // Who must approve (role or agent ID)
  conditions?: ConditionExpression;        // Conditional activation
  priority?: number;                       // Priority for conflict resolution (higher wins)
}

export interface CapabilityScope {
  domains?: string[];                      // Allowed knowledge domains
  resources?: string[];                    // Allowed resources/APIs
  dataTypes?: string[];                    // Allowed data types to access
  maxTokens?: number;                      // Max response length
  allowedFormats?: string[];               // Allowed output formats
  [key: string]: unknown;                  // Extensible scope properties
}

export interface RateLimit {
  maxCalls: number;                        // Maximum calls allowed
  windowSeconds: number;                   // Time window in seconds
  burstLimit?: number;                     // Max calls in a burst (short window)
  cooldownSeconds?: number;                // Cooldown after limit is reached
}

// ============================================================
// BOUNDARIES — What the agent MUST NOT do
// ============================================================

export interface Boundary {
  id: string;                              // Unique ID, e.g., "no_competitor_comparisons"
  description: string;                     // Human-readable description of the boundary
  type: BoundaryType;                      // 'hard' = block, 'soft' = warn
  detection: DetectionMethod;              // How to detect violations
  action: ViolationAction;                 // What to do when violated
  severity: Severity;                      // How serious is the violation
  conditions?: ConditionExpression;        // Conditional activation
  message?: string;                        // Custom message to return when boundary is hit
  exemptions?: BoundaryExemption[];        // Cases where the boundary does not apply
}

export type BoundaryType = 'hard' | 'soft';
// hard: Violation is blocked. The action is prevented entirely.
// soft: Violation generates a warning. The action may proceed with logging.

export type DetectionMethod =
  | KeywordDetection
  | RegexDetection
  | SemanticDetection
  | PiiDetection
  | TopicDetection
  | CustomDetection;

export interface KeywordDetection {
  type: 'keyword';
  keywords: string[];                      // List of keywords/phrases to match
  caseSensitive?: boolean;                 // Default: false
  matchWholeWord?: boolean;                // Default: false
}

export interface RegexDetection {
  type: 'regex';
  pattern: string;                         // Regular expression pattern
  flags?: string;                          // Regex flags (e.g., "gi")
}

export interface SemanticDetection {
  type: 'semantic';
  description: string;                     // Natural language description for semantic matching
  threshold?: number;                      // Similarity threshold (0.0 - 1.0, default 0.8)
}

export interface PiiDetection {
  type: 'pii';
  piiTypes?: PiiType[];                    // Specific PII types to detect (default: all)
}

export type PiiType =
  | 'email' | 'phone' | 'ssn' | 'credit_card' | 'address'
  | 'date_of_birth' | 'ip_address' | 'name' | 'passport'
  | 'drivers_license' | 'bank_account';

export interface TopicDetection {
  type: 'topic';
  topics: string[];                        // Topic labels to block
  threshold?: number;                      // Confidence threshold (0.0 - 1.0, default 0.7)
}

export interface CustomDetection {
  type: 'custom';
  handler: string;                         // Path to custom check handler module
  config?: Record<string, unknown>;        // Configuration for the handler
}

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type ViolationAction =
  | 'block'                                // Prevent the action entirely
  | 'alert'                                // Allow but alert the user/supervisor
  | 'log'                                  // Allow but log for audit
  | 'redact'                               // Allow but redact the violating content
  | 'escalate';                            // Escalate to human for decision

export interface BoundaryExemption {
  description: string;                     // Why this exemption exists
  conditions: ConditionExpression;         // When the exemption applies
}

// ============================================================
// OBLIGATIONS — What the agent MUST ALWAYS do
// ============================================================

export interface Obligation {
  id: string;                              // Unique ID, e.g., "greet_customer"
  description: string;                     // Human-readable description
  trigger: ConditionExpression;            // When this obligation activates
  action: string;                          // What must be done (natural language instruction)
  priority: number;                        // Execution priority (lower number = higher priority)
  enforcement?: ObligationEnforcement;     // How to enforce (pre-response, post-response, always)
  failureAction?: ViolationAction;         // What to do if obligation is not met
}

export type ObligationEnforcement = 'pre_response' | 'post_response' | 'always';

// ============================================================
// ESCALATION — When to hand off to a human
// ============================================================

export interface EscalationRule {
  id: string;                              // Unique ID, e.g., "angry_customer"
  description: string;                     // Human-readable description
  trigger: ConditionExpression;            // When to escalate
  escalateTo: string;                      // Target: "human", "supervisor", agent ID, role name
  action: EscalationAction;               // Escalation behavior
  timeout?: number;                        // Seconds to wait for human before fallback
  fallbackAction?: string;                 // What to do if escalation times out
  priority?: number;                       // Priority for ordering multiple escalations
  message?: string;                        // Message to include in escalation notification
}

export type EscalationAction =
  | 'pause_and_notify'                     // Stop all processing, notify human
  | 'notify_and_continue'                  // Notify human, continue processing
  | 'block_and_notify';                    // Block current action, notify human

// ============================================================
// CONDITION EXPRESSIONS — Composable evaluation logic
// ============================================================

export type ConditionExpression =
  | ComparisonCondition
  | LogicalCondition
  | NegationCondition;

export interface ComparisonCondition {
  op: ComparisonOperator;
  field: string;                           // Dot-notation path, e.g., "context.user.role"
  value: unknown;                          // Value to compare against
}

export type ComparisonOperator =
  | '=='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'contains'                             // String/array contains value
  | 'not_contains'                         // String/array does not contain value
  | 'starts_with'                          // String starts with value
  | 'ends_with'                            // String ends with value
  | 'matches'                              // Regex match
  | 'in'                                   // Value is in array
  | 'not_in'                               // Value is not in array
  | 'exists'                               // Field exists (value ignored)
  | 'not_exists';                          // Field does not exist (value ignored)

export interface LogicalCondition {
  op: 'all' | 'any';                      // AND / OR
  conditions: ConditionExpression[];
}

export interface NegationCondition {
  op: 'not';
  condition: ConditionExpression;
}

// ============================================================
// VERIFICATION — Runtime checks
// ============================================================

export interface VerificationConfig {
  preResponse?: Check[];                   // Checks before generating a response
  postResponse?: Check[];                  // Checks after generating a response
  onAction?: Check[];                      // Checks when performing an action/tool call
}

export interface Check {
  id: string;                              // Unique check ID
  type: CheckType;                         // Check type
  config?: Record<string, unknown>;        // Type-specific configuration
  action: ViolationAction;                 // What to do on check failure
  description?: string;                    // Human-readable description
}

export type CheckType =
  | 'pii'                                  // Detect personally identifiable information
  | 'sentiment'                            // Detect negative/hostile sentiment
  | 'topic'                                // Detect off-topic content
  | 'toxicity'                             // Detect toxic/harmful content
  | 'length'                               // Check response length
  | 'format'                               // Check response format
  | 'rate_limit'                           // Check rate limits
  | 'custom';                              // Custom check handler

// ============================================================
// AUDIT — Audit logging configuration
// ============================================================

export interface AuditConfig {
  enabled: boolean;                        // Whether audit logging is active
  logLevel: AuditLogLevel;                 // What to log
  retention?: string;                      // Retention period, e.g., "30d", "1y"
  exportFormat?: AuditExportFormat;        // Export format
  destination?: AuditDestination;          // Where to send logs
}

export type AuditLogLevel = 'all' | 'violations' | 'escalations' | 'none';
export type AuditExportFormat = 'json' | 'csv' | 'jsonl';

export interface AuditDestination {
  type: 'file' | 'stdout' | 'webhook';
  path?: string;                           // File path for 'file' type
  url?: string;                            // URL for 'webhook' type
  headers?: Record<string, string>;        // Headers for 'webhook' type
}

// ============================================================
// TEST CASES — Embedded tests for verifying spec correctness
// ============================================================

export interface TestCase {
  id: string;                              // Unique test ID
  description: string;                     // What is being tested
  input: TestInput;                        // Test input
  expect: TestExpectation;                 // Expected results
}

export interface TestInput {
  action?: string;                         // Action being attempted
  text?: string;                           // Input/output text to check
  context?: Record<string, unknown>;       // Context variables
  agentId?: string;                        // Agent performing the action
}

export interface TestExpectation {
  allowed?: boolean;                       // Whether the action should be allowed
  violations?: string[];                   // Boundary IDs that should trigger
  obligations?: string[];                  // Obligation IDs that should trigger
  escalations?: string[];                  // Escalation IDs that should trigger
  checksPassed?: string[];                 // Check IDs that should pass
  checksFailed?: string[];                 // Check IDs that should fail
}

export interface TestResult {
  testId: string;
  passed: boolean;
  expected: TestExpectation;
  actual: {
    allowed: boolean;
    violations: string[];
    obligations: string[];
    escalations: string[];
  };
  error?: string;
  durationMs: number;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  duration: number;
  results: TestResult[];
}

// ============================================================
// ENFORCEMENT RESULTS — What the enforcer returns
// ============================================================

export interface EnforcementResult {
  allowed: boolean;                        // Whether the action is permitted
  violations: Violation[];                 // All boundary violations detected
  triggeredObligations: TriggeredObligation[];  // Obligations that activated
  triggeredEscalations: TriggeredEscalation[];  // Escalations that activated
  checkResults: CheckResult[];             // Results of all verification checks
  auditEntry: AuditEntry;                  // Generated audit log entry
  processingTimeMs: number;                // Time to process enforcement
}

export interface Violation {
  boundaryId: string;                      // Which boundary was violated
  description: string;                     // Description of the violation
  severity: Severity;                      // How severe the violation is
  action: ViolationAction;                 // What action was taken
  matchedContent?: string;                 // The content that triggered the violation
  detectionMethod: string;                 // Which detection method found it
}

export interface TriggeredObligation {
  obligationId: string;                    // Which obligation was triggered
  description: string;                     // Description
  action: string;                          // What must be done
  priority: number;                        // Priority ordering
}

export interface TriggeredEscalation {
  escalationId: string;                    // Which escalation rule was triggered
  description: string;                     // Description
  escalateTo: string;                      // Who to escalate to
  action: EscalationAction;               // Escalation behavior
  message?: string;                        // Notification message
}

export interface CheckResult {
  checkId: string;                         // Which check ran
  type: CheckType;                         // Check type
  passed: boolean;                         // Whether the check passed
  details?: string;                        // Additional details
  matchedContent?: string;                 // Content that triggered failure
}

export interface AuditEntry {
  id: string;                              // Unique audit entry ID
  timestamp: string;                       // ISO 8601 timestamp
  specName: string;                        // Which spec was enforced
  action: string;                          // What action was attempted
  result: 'allowed' | 'blocked' | 'warned' | 'escalated';
  violations: string[];                    // Boundary IDs that were violated
  obligations: string[];                   // Obligation IDs that triggered
  escalations: string[];                   // Escalation IDs that triggered
  agentId?: string;                        // Agent that performed the action
  context?: Record<string, unknown>;       // Context at time of enforcement
  processingTimeMs: number;                // Enforcement processing time
}

// ============================================================
// LINTING — Static analysis results
// ============================================================

export interface LintResult {
  errors: LintIssue[];                     // Must fix: spec is invalid or dangerous
  warnings: LintIssue[];                   // Should fix: potential problems
  suggestions: LintIssue[];               // Could fix: improvements
  score: number;                           // 0-100 quality score
}

export interface LintIssue {
  ruleId: string;                          // Lint rule ID, e.g., "no-contradicting-rules"
  message: string;                         // Human-readable description of the issue
  location?: string;                       // Path in spec, e.g., "boundaries[2].detection"
  severity: 'error' | 'warning' | 'suggestion';
  fix?: string;                            // Suggested fix
}

// Lint rules to implement:
// - "no-contradicting-rules"        → Capability and boundary contradict each other
// - "no-unreachable-rules"          → Condition can never be true
// - "missing-boundary-for-pii"      → Handles PII but no PII boundary
// - "missing-escalation"            → High-severity boundary with no escalation path
// - "overly-broad-capability"       → Capability with no scope or constraints
// - "duplicate-ids"                 → Two items share the same ID
// - "unused-condition-fields"       → Condition references nonexistent field
// - "missing-tests"                 → No test cases for critical boundaries
// - "rate-limit-too-high"           → Rate limit appears unreasonably high
// - "no-audit-config"               → No audit configuration defined
// - "circular-inheritance"          → Inheritance chain is circular
// - "soft-boundary-critical"        → Soft boundary for critical severity (likely should be hard)

// ============================================================
// DIFFING — Comparing two specs
// ============================================================

export interface DiffResult {
  added: DiffEntry[];                      // Items in target but not in source
  removed: DiffEntry[];                    // Items in source but not in target
  modified: DiffModification[];            // Items changed between source and target
  summary: string;                         // Human-readable summary of changes
  breakingChanges: DiffEntry[];            // Changes that make the spec more restrictive
  permissiveChanges: DiffEntry[];          // Changes that make the spec more permissive
}

export interface DiffEntry {
  type: 'capability' | 'boundary' | 'obligation' | 'escalation' | 'check';
  id: string;
  description: string;
}

export interface DiffModification {
  type: 'capability' | 'boundary' | 'obligation' | 'escalation' | 'check';
  id: string;
  changes: FieldChange[];
}

export interface FieldChange {
  field: string;                           // Which field changed
  before: unknown;                         // Previous value
  after: unknown;                          // New value
  breaking: boolean;                       // Whether this is a breaking change
}

// ============================================================
// INHERITANCE — Spec composition model
// ============================================================

export interface ResolvedSpec {
  spec: AgentSpecFile;                     // The fully resolved spec
  inheritanceChain: string[];              // Ordered list of spec names in the chain
  overrides: InheritanceOverride[];        // What was overridden from parents
  conflicts: InheritanceConflict[];        // Conflicts that were auto-resolved
  unresolvableConflicts: InheritanceConflict[];  // Conflicts needing manual resolution
}

export interface InheritanceOverride {
  parentSpec: string;                      // Which parent spec was overridden
  type: 'capability' | 'boundary' | 'obligation' | 'escalation';
  id: string;                             // Item ID
  field: string;                           // Which field was overridden
  parentValue: unknown;
  childValue: unknown;
}

export interface InheritanceConflict {
  type: 'capability' | 'boundary' | 'obligation' | 'escalation';
  id: string;
  parentSpecs: string[];                   // Which parents conflict
  field: string;                           // Conflicting field
  values: { spec: string; value: unknown }[];
  resolution?: 'most_restrictive' | 'most_permissive' | 'first_parent' | 'last_parent';
}
```

### 2. AGENTSPEC CLASS API (packages/agentspec-core/src/spec.ts)

Implement the AgentSpec class with these methods:

```typescript
class AgentSpec {
  // === Construction ===
  static fromFile(path: string): Promise<AgentSpec>;
  static fromYAML(yaml: string): AgentSpec;
  static fromJSON(json: string | object): AgentSpec;
  static create(name: string, description?: string): AgentSpec;

  // === Core evaluation ===
  canDo(action: string, context?: Record<string, unknown>): CapabilityCheck;
  mustNotDo(action: string, text?: string, context?: Record<string, unknown>): BoundaryCheck;
  mustDo(context: Record<string, unknown>): ObligationCheck;
  shouldEscalate(context: Record<string, unknown>): EscalationCheck;

  // === Full enforcement ===
  enforce(input: EnforcementInput): EnforcementResult;

  // === Inheritance ===
  resolve(): ResolvedSpec;
  getInheritanceChain(): string[];

  // === Modification ===
  addCapability(capability: Capability): void;
  removeCapability(id: string): void;
  addBoundary(boundary: Boundary): void;
  removeBoundary(id: string): void;
  addObligation(obligation: Obligation): void;
  removeObligation(id: string): void;
  addEscalation(rule: EscalationRule): void;
  removeEscalation(id: string): void;
  addTest(test: TestCase): void;
  removeTest(id: string): void;

  // === Queries ===
  getCapability(id: string): Capability | undefined;
  getBoundary(id: string): Boundary | undefined;
  getObligation(id: string): Obligation | undefined;
  getEscalation(id: string): EscalationRule | undefined;
  getCapabilities(): Capability[];
  getBoundaries(): Boundary[];
  getObligations(): Obligation[];
  getEscalations(): EscalationRule[];
  getCapabilitiesForAction(action: string): Capability[];
  getBoundariesBySeverity(severity: Severity): Boundary[];
  getHardBoundaries(): Boundary[];
  getSoftBoundaries(): Boundary[];

  // === Serialization ===
  toYAML(): string;
  toJSON(): object;
  toJSONString(pretty?: boolean): string;
  toFile(path: string): Promise<void>;

  // === Validation, Linting, Testing ===
  validate(): ValidationResult;
  lint(): LintResult;
  runTests(): TestSuiteResult;

  // === Diffing ===
  diff(other: AgentSpec): DiffResult;

  // === Stats ===
  getStats(): SpecStats;
}

interface CapabilityCheck {
  allowed: boolean;
  capability?: Capability;
  reason: string;
  requiresApproval: boolean;
  approvalFrom?: string;
  rateLimited: boolean;
}

interface BoundaryCheck {
  violated: boolean;
  violations: Violation[];
}

interface ObligationCheck {
  obligations: TriggeredObligation[];
}

interface EscalationCheck {
  shouldEscalate: boolean;
  escalations: TriggeredEscalation[];
}

interface EnforcementInput {
  action?: string;
  text?: string;
  context?: Record<string, unknown>;
  agentId?: string;
  phase?: 'pre' | 'post' | 'action';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  path: string;
  message: string;
  schemaPath?: string;
}

interface ValidationWarning {
  path: string;
  message: string;
}

interface SpecStats {
  capabilities: number;
  boundaries: number;
  hardBoundaries: number;
  softBoundaries: number;
  obligations: number;
  escalationRules: number;
  tests: number;
  checks: number;
  inheritsFrom: number;
  uniqueActions: string[];
  severityDistribution: Record<Severity, number>;
  detectionMethodDistribution: Record<string, number>;
}
```

### 3. ENFORCER CLASS API (packages/agentspec-enforcer/src/enforcer.ts)

```typescript
class Enforcer {
  constructor(spec: AgentSpec, config?: EnforcerConfig);

  // === Core enforcement ===
  preCheck(input: EnforcementInput): EnforcementResult;
  postCheck(input: EnforcementInput): EnforcementResult;
  authorizeAction(action: string, context?: Record<string, unknown>): EnforcementResult;
  enforce(input: EnforcementInput): EnforcementResult;

  // === Audit ===
  getAuditLog(): AuditEntry[];
  getAuditLogForAgent(agentId: string): AuditEntry[];
  getViolationHistory(): AuditEntry[];
  exportAuditLog(format: AuditExportFormat, path?: string): string;
  clearAuditLog(): void;

  // === Configuration ===
  updateSpec(spec: AgentSpec): void;
  getSpec(): AgentSpec;
  registerCheck(check: CustomCheckHandler): void;

  // === Rate limiting ===
  getRateLimitStatus(capabilityId: string): RateLimitStatus;
  resetRateLimits(): void;

  // === Stats ===
  getStats(): EnforcerStats;
}

interface EnforcerConfig {
  auditEnabled?: boolean;
  strictMode?: boolean;                    // In strict mode, soft boundaries become hard
  defaultAction?: ViolationAction;         // Default action for unspecified violations
  maxAuditEntries?: number;                // Max entries in memory (default: 10000)
  customChecks?: Record<string, CustomCheckHandler>;
}

interface CustomCheckHandler {
  name: string;
  check(input: EnforcementInput, config?: Record<string, unknown>): CheckResult;
}

interface RateLimitStatus {
  capabilityId: string;
  remaining: number;
  total: number;
  windowSeconds: number;
  resetsAt: string;                        // ISO 8601
}

interface EnforcerStats {
  totalEnforcements: number;
  allowed: number;
  blocked: number;
  warned: number;
  escalated: number;
  violations: Record<string, number>;      // boundaryId → count
  topViolatedBoundaries: { id: string; count: number }[];
  averageProcessingTimeMs: number;
}
```

### 4. INHERITANCE MODEL (packages/agentspec-core/src/inheritance.ts)

The inheritance model is a critical differentiator. It uses **depth-first left-to-right traversal** with **most-restrictive-wins** conflict resolution.

#### Rules:

1. **Boundaries are additive.** Child specs inherit ALL parent boundaries. A child cannot remove a parent's boundary.
2. **Capabilities are intersective.** A child can only narrow capabilities, never widen them. If a parent says "no web access," the child cannot grant it.
3. **Obligations are additive.** Child inherits all parent obligations and can add more.
4. **Escalation rules merge.** If both parent and child define escalation for the same trigger, the more restrictive action wins (`pause_and_notify` > `block_and_notify` > `notify_and_continue`).
5. **Conflict resolution**: When two parents conflict, the **most restrictive** interpretation wins. A capability denied by ANY parent is denied. A boundary defined by ANY parent is enforced.
6. **Override syntax**: A child can override a specific parent field by re-declaring the item with the same `id`. The override must be equal or more restrictive.
7. **Circular inheritance detection**: Detect and reject circular inheritance chains at parse time.

```
company-base-policy.agentspec.yaml
├── engineering-division.agentspec.yaml
│   └── frontend-team.agentspec.yaml
├── sales-division.agentspec.yaml
│   └── enterprise-sales.agentspec.yaml
└── retail-division.agentspec.yaml
```

### 5. CONDITION EXPRESSION EVALUATOR (packages/agentspec-core/src/condition.ts)

The condition evaluator resolves dot-notation field paths against a context object and supports these operators:

```typescript
function evaluateCondition(
  condition: ConditionExpression,
  context: Record<string, unknown>
): boolean;
```

Operators:
- `==`, `!=` — Equality/inequality (deep equality for objects)
- `<`, `>`, `<=`, `>=` — Numeric/date comparison
- `contains` — String contains substring, or array contains element
- `not_contains` — Negation of contains
- `starts_with`, `ends_with` — String prefix/suffix
- `matches` — Regex match
- `in`, `not_in` — Value in/not in array
- `exists`, `not_exists` — Field existence check
- `all` — All sub-conditions must be true (AND)
- `any` — At least one sub-condition must be true (OR)
- `not` — Negation of a sub-condition

Field path resolution: `"context.user.role"` resolves to `context["context"]["user"]["role"]`. Support array indexing: `"context.items[0].name"`.

### 6. LINTER (packages/agentspec-core/src/linter.ts)

The linter performs static analysis on an AgentSpec file and returns errors, warnings, and suggestions. Implement these lint rules:

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `no-contradicting-rules` | error | A capability and boundary contradict each other (e.g., capability allows "search_web" but boundary blocks all web access) |
| `no-unreachable-rules` | warning | A condition can never be true (e.g., field == "x" AND field == "y") |
| `missing-boundary-for-pii` | warning | Agent handles PII data but no PII detection boundary is defined |
| `missing-escalation` | warning | A critical-severity boundary exists but no escalation rule is defined |
| `overly-broad-capability` | suggestion | A capability has no scope, no constraints, and no rate limit |
| `duplicate-ids` | error | Two items share the same ID within a section |
| `unused-condition-fields` | warning | A condition references a field not present in any test case context |
| `missing-tests` | suggestion | No test cases defined for hard boundaries |
| `rate-limit-too-high` | warning | Rate limit exceeds 1000 calls per minute |
| `no-audit-config` | suggestion | No audit configuration is defined |
| `circular-inheritance` | error | Inheritance chain is circular |
| `soft-boundary-critical` | warning | A soft boundary has critical severity (should likely be hard) |
| `missing-detection` | error | A boundary has no detection method |
| `empty-keyword-list` | error | A keyword detection method has an empty keywords array |
| `orphan-escalation-target` | warning | An escalation rule references an unknown target |

### 7. MCP SERVER TOOLS (packages/agentspec-mcp/src/tools.ts)

Expose these 6 MCP tools:

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `agentspec_get_rules` | Get the full set of rules for the current agent. **Call this FIRST every session.** Returns all capabilities, boundaries, obligations, and escalation rules in a structured summary. | `spec_file?` (path, default: `~/.agentspec/current.agentspec.yaml`) |
| `agentspec_check_action` | Check if a specific action is allowed given the current context. Returns whether it is permitted, rate-limited, or requires approval. | `action` (required), `context?`, `text?` |
| `agentspec_get_boundaries` | Get all boundaries (hard and soft), optionally filtered by severity. | `severity?`, `type?` (`hard` or `soft`) |
| `agentspec_get_obligations` | Get all obligations that are currently triggered given the context. | `context` (required) |
| `agentspec_should_escalate` | Check if the current situation requires escalation to a human. | `context` (required) |
| `agentspec_report_violation` | Report a detected violation for audit logging. Called by agents when they self-detect potential violations. | `boundary_id` (required), `description?`, `matched_content?`, `action_taken?` |

Use `@modelcontextprotocol/sdk` with **stdio transport**. Store active spec at `~/.agentspec/current.agentspec.yaml`.

#### MCP Tool Schemas

```typescript
// agentspec_get_rules
{
  name: "agentspec_get_rules",
  description: "Get the full set of behavior rules for this agent. Call this FIRST at the start of every session to understand what you can do, must not do, must always do, and when to escalate.",
  inputSchema: {
    type: "object",
    properties: {
      spec_file: {
        type: "string",
        description: "Path to the AgentSpec file. Default: ~/.agentspec/current.agentspec.yaml"
      }
    }
  }
}

// agentspec_check_action
{
  name: "agentspec_check_action",
  description: "Check whether a specific action is permitted under the current spec. Returns allowed/blocked status, applicable constraints, rate limit info, and approval requirements.",
  inputSchema: {
    type: "object",
    properties: {
      action: { type: "string", description: "The action to check, e.g., 'search_web', 'send_email'" },
      text: { type: "string", description: "Text content to check against boundaries" },
      context: { type: "object", description: "Context variables for condition evaluation" }
    },
    required: ["action"]
  }
}

// agentspec_get_boundaries
{
  name: "agentspec_get_boundaries",
  description: "Get all behavior boundaries (restrictions). Optionally filter by severity or type.",
  inputSchema: {
    type: "object",
    properties: {
      severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
      type: { type: "string", enum: ["hard", "soft"] }
    }
  }
}

// agentspec_get_obligations
{
  name: "agentspec_get_obligations",
  description: "Get all obligations that are currently triggered given the provided context.",
  inputSchema: {
    type: "object",
    properties: {
      context: { type: "object", description: "Current context to evaluate obligation triggers against" }
    },
    required: ["context"]
  }
}

// agentspec_should_escalate
{
  name: "agentspec_should_escalate",
  description: "Check whether the current situation requires escalation to a human supervisor.",
  inputSchema: {
    type: "object",
    properties: {
      context: { type: "object", description: "Current context to evaluate escalation triggers against" }
    },
    required: ["context"]
  }
}

// agentspec_report_violation
{
  name: "agentspec_report_violation",
  description: "Self-report a detected boundary violation for audit logging. Use this when you detect that you may be approaching or have crossed a boundary.",
  inputSchema: {
    type: "object",
    properties: {
      boundary_id: { type: "string", description: "The ID of the boundary that was violated" },
      description: { type: "string", description: "Description of the violation" },
      matched_content: { type: "string", description: "The content that triggered the violation" },
      action_taken: { type: "string", enum: ["blocked", "warned", "logged", "redacted", "escalated"] }
    },
    required: ["boundary_id"]
  }
}
```

### 8. CLI SPECIFICATION (packages/agentspec-cli/)

```
Usage: agentspec <command> [options]

Commands:
  init [name]                   Create a new .agentspec.yaml file (interactive or from template)
  validate <file>               Validate an AgentSpec file against the schema
  lint <file>                   Lint an AgentSpec file for issues and suggestions
  test <file>                   Run the embedded test cases in an AgentSpec file
  diff <file1> <file2>          Compare two AgentSpec files and show changes
  resolve <file>                Resolve inheritance chain and output the fully merged spec
  convert <input> [output]      Convert a system prompt to an AgentSpec file (requires LLM)
  visualize <file>              Render the spec as an ASCII table or open in browser

Options:
  --format <json|yaml|table>    Output format (default: table)
  --severity <level>            Filter by severity level
  --verbose                     Show detailed output
  --strict                      Treat warnings as errors
  --config <path>               Config file (default: ~/.agentspec/config.json)
  --no-color                    Disable color output
  --version                     Show version
  --help                        Show help

Examples:
  agentspec init customer-support
  agentspec validate ./agent.agentspec.yaml
  agentspec lint ./agent.agentspec.yaml --strict
  agentspec test ./agent.agentspec.yaml --verbose
  agentspec diff ./v1.agentspec.yaml ./v2.agentspec.yaml
  agentspec resolve ./child.agentspec.yaml --format yaml
  agentspec convert "You are a helpful customer support agent..." -o ./agent.agentspec.yaml
  agentspec visualize ./agent.agentspec.yaml
```

Use: `commander` (CLI parsing), `chalk` (colors), `cli-table3` (tables), `boxen` (dashboard), `inquirer` (interactive prompts), `js-yaml` (YAML parsing).

#### CLI Commands Detail

**`agentspec init [name]`**
- Interactive mode: asks questions about agent role, domain, common boundaries
- Template mode: `--template customer-support` uses built-in templates
- Generates a well-structured .agentspec.yaml starter file
- Creates `~/.agentspec/config.json` if it does not exist

**`agentspec validate <file>`**
- Validates against JSON Schema
- Checks referential integrity (condition fields, inheritance paths)
- Reports errors with line numbers and fix suggestions
- Exit code 0 for valid, 1 for invalid

**`agentspec lint <file>`**
- Runs all lint rules
- Groups output by severity (errors, warnings, suggestions)
- Shows quality score (0-100)
- `--strict` flag causes exit code 1 for any warnings

**`agentspec test <file>`**
- Runs all embedded `tests:` in the spec file
- Shows pass/fail for each test with timing
- Displays detailed diff on failure
- Supports `--filter` to run specific tests by ID pattern
- Exit code 0 for all pass, 1 for any failure

**`agentspec diff <file1> <file2>`**
- Shows added, removed, and modified items
- Highlights breaking changes (more restrictive) vs permissive changes
- Color-coded output: red for breaking, green for permissive, yellow for neutral

**`agentspec resolve <file>`**
- Follows the `inherits` chain and outputs the fully resolved spec
- Shows which items came from which parent
- Reports any conflicts and how they were resolved
- Outputs in YAML or JSON format

**`agentspec convert <input> [output]`**
- Takes a system prompt (text file or string) and converts to AgentSpec
- Uses pattern matching and heuristics to extract capabilities, boundaries, obligations
- Does NOT require an LLM by default — uses rule-based extraction
- Optional `--llm` flag to use an LLM for better extraction (requires API key)
- Outputs a draft spec that should be reviewed and refined

**`agentspec visualize <file>`**
- Default: ASCII table in terminal with colored sections for capabilities, boundaries, obligations, escalation
- `--format html`: generates an HTML file and opens in browser
- Shows inheritance tree if the spec uses `inherits`

### 9. PYTHON SDK (packages/agentspec-py/)

```toml
# pyproject.toml
[project]
name = "agentspec"
version = "0.1.0"
description = "AgentSpec Python SDK — declarative AI agent behavior contracts"
requires-python = ">=3.9"
license = {text = "MIT"}
dependencies = [
  "pydantic>=2.0",
  "pyyaml>=6.0",
  "jsonschema>=4.0",
]

[project.optional-dependencies]
langchain = ["langchain>=0.1.0"]
crewai = ["crewai>=0.1.0"]
dev = ["pytest>=7.0", "pytest-asyncio", "ruff", "mypy"]

[project.scripts]
agentspec = "agentspec.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

Mirror the TypeScript API exactly with Pydantic models and equivalent methods:

```python
class AgentSpec:
    @classmethod
    def from_file(cls, path: str) -> "AgentSpec": ...
    @classmethod
    def from_yaml(cls, yaml_str: str) -> "AgentSpec": ...
    @classmethod
    def from_json(cls, json_str: str) -> "AgentSpec": ...
    @classmethod
    def create(cls, name: str, description: str | None = None) -> "AgentSpec": ...

    def can_do(self, action: str, context: dict | None = None) -> CapabilityCheck: ...
    def must_not_do(self, action: str, text: str | None = None, context: dict | None = None) -> BoundaryCheck: ...
    def must_do(self, context: dict) -> ObligationCheck: ...
    def should_escalate(self, context: dict) -> EscalationCheck: ...
    def enforce(self, input: EnforcementInput) -> EnforcementResult: ...

    def resolve(self) -> ResolvedSpec: ...
    def validate(self) -> ValidationResult: ...
    def lint(self) -> LintResult: ...
    def run_tests(self) -> TestSuiteResult: ...
    def diff(self, other: "AgentSpec") -> DiffResult: ...

    def to_yaml(self) -> str: ...
    def to_json(self, pretty: bool = False) -> str: ...
    def to_file(self, path: str) -> None: ...

    def get_stats(self) -> SpecStats: ...

class Enforcer:
    def __init__(self, spec: AgentSpec, config: EnforcerConfig | None = None): ...
    def pre_check(self, input: EnforcementInput) -> EnforcementResult: ...
    def post_check(self, input: EnforcementInput) -> EnforcementResult: ...
    def authorize_action(self, action: str, context: dict | None = None) -> EnforcementResult: ...
    def enforce(self, input: EnforcementInput) -> EnforcementResult: ...
    def get_audit_log(self) -> list[AuditEntry]: ...
    def export_audit_log(self, format: str = "json", path: str | None = None) -> str: ...
```

#### Python Adapters

**LangChain Adapter** (`agentspec/adapters/langchain.py`):
```python
class AgentSpecCallbackHandler(BaseCallbackHandler):
    """LangChain callback handler that enforces AgentSpec rules."""
    def __init__(self, spec: AgentSpec): ...
    def on_tool_start(self, serialized, input_str, **kwargs) -> None: ...
    def on_chain_start(self, serialized, inputs, **kwargs) -> None: ...
    def on_llm_end(self, response, **kwargs) -> None: ...
```

**CrewAI Adapter** (`agentspec/adapters/crewai.py`):
```python
class AgentSpecCrewAIAdapter:
    """Wraps CrewAI agents with AgentSpec enforcement."""
    def __init__(self, spec: AgentSpec): ...
    def wrap_agent(self, agent) -> WrappedAgent: ...
    def wrap_crew(self, crew) -> WrappedCrew: ...
```

### 10. JSON SCHEMAS (spec/schema/)

Create full JSON Schema (draft 2020-12) for:

**agentspec.schema.json** — Validate complete AgentSpec files:
- Required: `specVersion`, `name`, `capabilities`, `boundaries`, `obligations`
- `specVersion` pattern: `^\\d+\\.\\d+\\.\\d+$`
- `name` pattern: `^[a-z][a-z0-9_-]*$` (lowercase kebab-case)
- Validates all nested objects (capabilities, boundaries, etc.)
- Supports `$ref` for shared sub-schemas

**capability.schema.json** — Validate Capability objects:
- Required: `id`, `action`
- `id` pattern: `^[a-z][a-z0-9_]*$`
- Validates rateLimit, conditions, scope

**boundary.schema.json** — Validate Boundary objects:
- Required: `id`, `description`, `type`, `detection`, `action`, `severity`
- Validates detection methods (keyword, regex, semantic, pii, topic, custom)
- Validates that keyword detection has non-empty keywords array
- Validates regex patterns are syntactically valid

**obligation.schema.json** — Validate Obligation objects:
- Required: `id`, `description`, `trigger`, `action`, `priority`
- Validates trigger condition expression structure

**verification.schema.json** — Validate VerificationConfig and Check objects:
- Required per check: `id`, `type`, `action`
- Validates check types against known set

### 11. EXAMPLE AGENTSPEC FILES (spec/examples/)

Create 10 realistic, detailed examples:

1. **customer-support.agentspec.yaml** — Customer support agent. Capabilities: answer product questions, process returns (with approval >$500), look up orders. Boundaries: no competitor comparisons, no PII disclosure, no financial advice, no promises about features. Obligations: greet by name, confirm order numbers, provide ticket numbers. Escalation: angry customers, legal threats, data breach reports. 15+ test cases.

2. **code-review.agentspec.yaml** — Code review agent. Capabilities: review code, suggest improvements, check style compliance, identify security vulnerabilities. Boundaries: no auto-merging, no access to production secrets, no modifying code outside PR scope. Obligations: always cite specific lines, always check for security issues, always note breaking changes. Escalation: security vulnerabilities found, architecture changes detected.

3. **medical-info.agentspec.yaml** — Medical information agent. Capabilities: provide general health information, explain medical terms, describe common treatments. Boundaries: NEVER provide diagnosis, NEVER recommend specific medications, NEVER contradict doctor's advice, NEVER handle emergency situations (escalate immediately). Obligations: always include disclaimer, always recommend consulting a doctor, always cite sources. Escalation: emergency symptoms, suicidal ideation, child safety concerns.

4. **financial-advisor.agentspec.yaml** — Financial advisor agent. Capabilities: explain financial concepts, compare investment strategies (general), calculate projections. Boundaries: no specific stock recommendations, no tax advice (varies by jurisdiction), no guarantee language, no access to real trading. Obligations: always include risk disclaimers, always note past performance caveat, always recommend professional advisor for large decisions. Escalation: requests over threshold, regulatory compliance questions.

5. **content-moderator.agentspec.yaml** — Content moderation agent. Capabilities: classify content, flag violations, suggest edits, auto-remove spam. Boundaries: no censorship of political speech (within policy), no revealing moderation logic to users, no accessing user private messages. Obligations: always provide reason for moderation action, always allow appeals, always log decisions. Escalation: borderline content, legal takedown requests, government requests.

6. **knowledge-base.agentspec.yaml** — Knowledge base agent. Capabilities: search knowledge base, answer questions from docs, suggest related articles, create draft articles. Boundaries: only answer from approved sources, no speculation beyond docs, no revealing internal-only docs to external users. Obligations: always cite source documents, always note when information may be outdated, always suggest human expert for complex topics.

7. **sales-outreach.agentspec.yaml** — Sales outreach agent. Capabilities: draft outreach emails, research prospects, qualify leads, schedule meetings. Boundaries: no spam (comply with CAN-SPAM/GDPR), no false claims about product, no competitor disparagement, no unauthorized discounts. Obligations: always include unsubscribe, always identify as AI when asked, always follow up within SLA. Escalation: enterprise prospects, legal questions, pricing exceptions.

8. **hr-recruiter.agentspec.yaml** — HR recruiter agent. Capabilities: screen resumes, schedule interviews, answer candidate questions, draft job descriptions. Boundaries: no discrimination (protected classes), no salary discussion (redirect to recruiter), no promises of employment, no access to internal compensation data. Obligations: always respond within 48 hours, always provide feedback timeline, always include EEO statement. Escalation: accommodation requests, visa questions, executive roles.

9. **company-base-policy.agentspec.yaml** — Company-wide base policy that all division specs inherit from. Universal boundaries: data privacy (GDPR/CCPA), no unauthorized data sharing, no hallucination of company policy, brand voice guidelines. Universal obligations: identify as AI assistant, log all interactions, respect user opt-out. Universal escalation: legal threats, media inquiries, security incidents.

10. **retail-division.agentspec.yaml** — Retail division policy that inherits from company-base-policy. Adds retail-specific capabilities (process orders, handle returns, loyalty programs). Adds retail boundaries (no unauthorized discounts >20%, no competitor price matching without approval). Demonstrates inheritance in practice.

### 12. LANGUAGE SPECIFICATION (spec/agentspec-lang-v0.1.md)

Write a 4000+ word formal language specification covering:

1. **Introduction and Motivation** (400w) — Why AgentSpec exists. The problem with system prompts. The need for machine-readable, testable, enforceable behavior contracts.

2. **Design Principles** (300w) — Declarative over imperative. Most-restrictive wins. Explicit over implicit. Testable by design. Composable through inheritance.

3. **File Format** (300w) — YAML primary, JSON supported. File extension: `.agentspec.yaml` or `.agentspec.json`. UTF-8 encoding. Required fields. Optional fields.

4. **Capabilities** (500w) — Detailed specification of the capabilities section. Actions, scopes, constraints, rate limits, approval gates, conditional activation. Examples for each feature.

5. **Boundaries** (600w) — Detailed specification of the boundaries section. Hard vs soft boundaries. Detection methods (keyword, regex, semantic, PII, topic, custom). Violation actions (block, alert, log, redact, escalate). Severity levels. Exemptions. Examples for each feature.

6. **Obligations** (400w) — Detailed specification of the obligations section. Triggers, actions, priority ordering, enforcement phases. Examples.

7. **Escalation** (400w) — Detailed specification of the escalation section. Triggers, targets, actions, timeouts, fallbacks. Examples.

8. **Condition Expressions** (400w) — Full specification of the condition expression syntax. All operators. Logical combinators. Field path resolution. Type coercion rules.

9. **Verification Checks** (300w) — Pre-response, post-response, and on-action checks. Built-in check types. Custom check handlers.

10. **Inheritance Model** (500w) — How specs compose. Depth-first left-to-right traversal. Most-restrictive-wins for boundaries. Intersection for capabilities. Additive for obligations. Conflict resolution. Override syntax.

11. **Audit Configuration** (200w) — Audit log levels, retention, export formats, destinations.

12. **Test Cases** (300w) — Embedded test syntax. Input format. Expectation format. Running tests. Test coverage recommendations.

13. **Extensibility** (200w) — Custom detection methods. Custom check types. Metadata. Future extensions.

### 13. INHERITANCE MODEL DOCUMENT (spec/inheritance-model.md)

Write a 1500+ word document explaining:
- Why inheritance matters for organizational governance
- The depth-first left-to-right traversal algorithm
- Most-restrictive-wins conflict resolution
- Boundary additivity (boundaries only accumulate, never subtract)
- Capability intersection (child can only narrow, never widen)
- Obligation additivity (obligations accumulate)
- Override syntax and rules
- Diamond inheritance handling
- Circular dependency detection
- Practical examples with company → division → team hierarchy

### 14. CONFLICT RESOLUTION DOCUMENT (spec/conflict-resolution.md)

Write a 1000+ word document explaining:
- Types of conflicts (capability vs boundary, parent vs child, sibling specs)
- Resolution strategies (most_restrictive, most_permissive, first_parent, last_parent, manual)
- Default resolution: most_restrictive
- How each type of spec element is resolved
- Examples of each conflict type and resolution
- Manual resolution workflow
- Conflict reporting in lint output

---

## PACKAGE CONFIGURATIONS

### Monorepo: pnpm workspaces
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### Root package.json
```json
{
  "name": "agentspec",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

### agentspec-core/package.json
```json
{
  "name": "@agentspec/core",
  "version": "0.1.0",
  "description": "AgentSpec core library — declarative AI agent behavior contracts",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["ai", "agents", "safety", "guardrails", "permissions", "behavior", "contracts", "mcp", "llm"],
  "license": "MIT",
  "dependencies": {
    "ajv": "^8.12.0",
    "js-yaml": "^4.1.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

### agentspec-enforcer/package.json
```json
{
  "name": "@agentspec/enforcer",
  "version": "0.1.0",
  "description": "AgentSpec runtime enforcement engine — enforce behavior contracts at runtime",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "license": "MIT",
  "dependencies": {
    "@agentspec/core": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

### agentspec-mcp/package.json
```json
{
  "name": "@agentspec/mcp-server",
  "version": "0.1.0",
  "description": "AgentSpec MCP server — expose behavior contracts to AI agents via MCP",
  "bin": {
    "agentspec-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs --dts",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "test": "vitest run"
  },
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@agentspec/core": "workspace:*",
    "@agentspec/enforcer": "workspace:*"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

### agentspec-cli/package.json
```json
{
  "name": "agentspec",
  "version": "0.1.0",
  "description": "AgentSpec CLI — manage AI agent behavior contracts from the command line",
  "bin": {
    "agentspec": "dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "license": "MIT",
  "dependencies": {
    "@agentspec/core": "workspace:*",
    "@agentspec/enforcer": "workspace:*",
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "cli-table3": "^0.6.0",
    "boxen": "^7.0.0",
    "inquirer": "^9.0.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

### tsconfig.json (shared base for all packages)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### vitest.config.ts (shared base for all packages)
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

## CI/CD (.github/workflows/)

### ci.yml
- Trigger: push to main, all PRs
- Matrix: Node 18, 20, 22
- Steps: pnpm install, lint, typecheck, test (with coverage), build
- Python job: install, ruff check, mypy, pytest (with coverage)
- Upload coverage reports as artifacts
- Fail on coverage below 80%

### publish-npm.yml
- Trigger: git tag `v*`
- Publish @agentspec/core, @agentspec/enforcer, @agentspec/mcp-server, agentspec (CLI) to npm
- Requires NPM_TOKEN secret

### publish-pypi.yml
- Trigger: git tag `v*`
- Build and publish agentspec to PyPI using hatch
- Requires PYPI_TOKEN secret

---

## TESTING REQUIREMENTS

### Unit Tests (per module)

**agentspec-core tests:**
- `parser.test.ts` — Parse valid YAML, parse valid JSON, reject invalid YAML, reject missing required fields, handle edge cases (empty arrays, null values)
- `spec.test.ts` — Construction (fromFile, fromYAML, fromJSON, create). canDo with various actions and contexts. mustNotDo with various texts and detection methods. mustDo with various triggers. shouldEscalate with various contexts. Full enforce cycle. Serialization roundtrip.
- `capability.test.ts` — Action matching, scope evaluation, rate limit checking, approval gate checking, conditional capabilities
- `boundary.test.ts` — Keyword detection (case sensitivity, whole word), regex detection, PII detection, topic detection, custom detection, severity filtering, exemption handling
- `obligation.test.ts` — Trigger evaluation, priority ordering, enforcement phase filtering
- `escalation.test.ts` — Trigger evaluation, action types, timeout handling
- `inheritance.test.ts` — Single parent inheritance, multiple parent inheritance, deep chains (3+ levels), diamond inheritance, boundary additivity, capability intersection, obligation accumulation, conflict detection, conflict resolution (most restrictive), circular inheritance rejection, override syntax
- `conflict.test.ts` — All conflict types (capability vs boundary, parent vs child, sibling specs), all resolution strategies
- `condition.test.ts` — Every operator (==, !=, <, >, <=, >=, contains, not_contains, starts_with, ends_with, matches, in, not_in, exists, not_exists), logical combinators (all, any, not), nested conditions (3+ levels), dot-notation field resolution, array indexing, type coercion, missing fields, null values
- `validation.test.ts` — Valid specs pass, invalid specs fail with correct errors, all required field checks, pattern validations, nested object validation
- `linter.test.ts` — Every lint rule triggers correctly, clean specs produce no issues, quality score calculation, fix suggestions
- `diff.test.ts` — Added items, removed items, modified items, breaking changes, permissive changes, identical specs, completely different specs
- `test-runner.test.ts` — Passing tests, failing tests, error handling, timing, filtering by ID, suite summary
- `serialization.test.ts` — YAML roundtrip, JSON roundtrip, YAML-to-JSON, JSON-to-YAML, preserves all fields, handles special characters, handles Unicode

**agentspec-enforcer tests:**
- `enforcer.test.ts` — Full enforcement cycle, preCheck, postCheck, authorizeAction, config options (strictMode, defaultAction), spec updates
- `pre-check.test.ts` — Pre-response checks run before response, violations block response, multiple checks run in order
- `post-check.test.ts` — Post-response checks run after response, redaction modifies output, logging records violations
- `action-check.test.ts` — Action authorization, rate limit enforcement, approval requirements
- `audit-log.test.ts` — Entries created on enforcement, filtering by agent, filtering by violations, export to JSON/CSV/JSONL, max entries limit, clearing
- `violation.test.ts` — Block stops processing, alert allows with notification, log records silently, redact removes content, escalate triggers escalation
- `context.test.ts` — Context merging, field resolution, context isolation between checks
- Adapter tests: generic, express middleware, langchain callback handler
- Check tests: PII patterns (email, phone, SSN, credit card), sentiment scoring, topic detection, rate limit windowing

**agentspec-cli tests:**
- Test each command with valid input, invalid input, missing files, various flags
- Test display formatting
- Test configuration loading

**agentspec-mcp tests:**
- Test server creation
- Test each tool with valid/invalid input
- Test spec file loading
- Test error handling

### Integration Tests
- Full workflow: create spec from YAML, validate, lint, add inheritance, resolve, enforce actions, export audit log
- Inheritance chain: company → division → team spec, verify full resolution
- Roundtrip: create spec, serialize to YAML, parse back, verify identical
- CLI pipeline: init → validate → lint → test → diff

### Fixture Files
- `valid-spec.yaml` — Complete, well-formed spec with all sections populated
- `complex-spec.yaml` — Spec with deep inheritance, many conditions, all detection types
- `invalid-spec.yaml` — Spec with schema violations for testing validation
- `base-policy.yaml` — Base policy for inheritance testing
- `child-policy.yaml` — Child policy that inherits from base
- `conflicting-specs.yaml` — Two specs with intentional conflicts
- `spec-with-tests.yaml` — Spec with comprehensive embedded test cases
- `minimal-spec.yaml` — Minimal valid spec (only required fields)

### Coverage Requirements
- Minimum 80% code coverage per package (lines, functions, branches, statements)
- All public API methods must have at least one test
- All error paths must be tested
- All detection methods must have dedicated tests

---

## MANIFESTO BLOG POST (website/blog/manifesto.md)

Write 2500-3500 words. Title: **"System Prompts Are Suggestions. AgentSpec Is a Contract."**

1. **The Problem with System Prompts** (500w) — System prompts are natural language instructions stuffed into an LLM context window. They are suggestions, not contracts. They can be ignored, overridden, jailbroken, or simply forgotten in long conversations. There is no way to test them. There is no inheritance or composition. There is no audit trail. You cannot lint a system prompt. You cannot diff two versions. You cannot prove compliance. As AI agents take on more critical tasks (handling customer data, making financial decisions, operating infrastructure), "please do not" is not a governance model.

2. **The Gap in AI Safety Tooling** (400w) — Guardrails exist (NeMo Guardrails, Guardrails AI, etc.) but they are code-first, imperative, coupled to specific frameworks. Prompt engineering is an art form, not a specification. There is no equivalent of Terraform (declarative infrastructure), OpenAPI (declarative APIs), or RBAC policies (declarative permissions) for AI agent behavior. The industry needs a declarative standard that separates *what the rules are* from *how they are enforced*.

3. **Introducing AgentSpec** (500w) — A declarative language for defining AI agent behavior contracts. YAML-based, human-readable, machine-enforceable. Four sections: Capabilities (can do), Boundaries (must not do), Obligations (must always do), Escalation (when to hand off). Built-in testing, linting, diffing, inheritance. Not a framework — a specification that any framework can enforce.

4. **The Four Pillars** (600w) — Deep dive into capabilities, boundaries, obligations, and escalation with concrete examples. Show how each addresses a real failure mode of system prompts. Capabilities = positive permissions with rate limits and approval gates. Boundaries = hard and soft restrictions with detection methods. Obligations = guaranteed behaviors that cannot be omitted. Escalation = structured handoff when the agent reaches its limits.

5. **Inheritance: Governance at Scale** (400w) — The killer feature for organizations. Company base policy that all agents inherit. Division-specific overrides. Team-specific configurations. Most-restrictive-wins means security teams can set floors that cannot be overridden. Demonstrate with company → division → team example.

6. **Testing Your Agent's Behavior** (300w) — Embedded test cases. Run `agentspec test` and know if your agent's rules are consistent. TDD for agent behavior. Test before deploy. Catch contradictions before they reach production.

7. **How It Works in Practice** (400w) — Code examples: create spec, connect to LangChain, connect to Claude Desktop via MCP, enforce at runtime, review audit log. Show the developer workflow.

8. **What We Are Building** (200w) — Open spec, open source, open ecosystem. CLI, runtime enforcer, MCP server, Python SDK, framework adapters. Free for individuals, commercial governance dashboard for teams.

9. **Call to Action** (200w) — Star repo, try CLI, convert your first system prompt, connect to your agent framework, join Discord.

Tone: HashiCorp product announcement meets Stripe engineering blog. Clear, opinionated, technically precise. Not breathless or hype-driven. Let the problem speak for itself. Use specific examples, not abstractions.

---

## WEBSITE (website/)

### Landing Page (website/index.html)
Single-page landing site with:
- Hero: "Terraform for AI Agent Permissions"
- Tagline: "Declarative. Testable. Enforceable. The missing governance layer for AI agents."
- Problem/solution section
- Code example (AgentSpec YAML side-by-side with enforcement result)
- Four pillars (capabilities, boundaries, obligations, escalation)
- Inheritance diagram
- Integration logos (LangChain, CrewAI, Claude, MCP)
- Quickstart: `npx agentspec init`, `agentspec validate`, `agentspec test`
- Footer: GitHub, npm, PyPI, Discord, OpenClaw

### Documentation (website/docs/)
- quickstart.md — 5-minute getting started guide
- language-reference.md — Full language reference (mirrors spec)
- inheritance.md — Inheritance model guide with examples
- enforcement.md — Runtime enforcement guide
- mcp-integration.md — Claude Desktop / MCP integration guide
- cli-reference.md — All CLI commands with examples
- python-sdk.md — Python SDK guide
- examples.md — Walkthrough of example specs

---

## EXAMPLES (examples/)

### system-prompt-to-spec/
Show converting a real system prompt to an AgentSpec:
- `example-system-prompt.txt` — A realistic customer support system prompt
- `converted.agentspec.yaml` — The equivalent AgentSpec file
- `README.md` — Walkthrough of the conversion process

### langchain-enforcement/
```python
from langchain.agents import AgentExecutor
from agentspec import AgentSpec, Enforcer
from agentspec.adapters.langchain import AgentSpecCallbackHandler

spec = AgentSpec.from_file("./support-agent.agentspec.yaml")
handler = AgentSpecCallbackHandler(spec)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[handler],
    verbose=True
)
```

### crewai-enforcement/
```python
from crewai import Agent, Crew
from agentspec import AgentSpec
from agentspec.adapters.crewai import AgentSpecCrewAIAdapter

spec = AgentSpec.from_file("./research-agent.agentspec.yaml")
adapter = AgentSpecCrewAIAdapter(spec)

researcher = adapter.wrap_agent(Agent(
    role="Research Analyst",
    goal="Find accurate information",
    backstory="You are a careful researcher"
))
```

### express-middleware/
```typescript
import express from 'express';
import { AgentSpec } from '@agentspec/core';
import { Enforcer } from '@agentspec/enforcer';
import { createExpressMiddleware } from '@agentspec/enforcer/adapters/express';

const spec = await AgentSpec.fromFile('./api-agent.agentspec.yaml');
const enforcer = new Enforcer(spec);
const middleware = createExpressMiddleware(enforcer);

const app = express();
app.use('/api/agent', middleware);
```

### claude-desktop-mcp/
```json
{
  "mcpServers": {
    "agentspec": {
      "command": "npx",
      "args": ["@agentspec/mcp-server"],
      "env": {
        "AGENTSPEC_FILE": "~/.agentspec/current.agentspec.yaml"
      }
    }
  }
}
```

### inheritance-demo/
Three-level inheritance chain:
- `company-base.agentspec.yaml` — Universal company policy
- `engineering-division.agentspec.yaml` — Engineering-specific rules (inherits company)
- `frontend-team.agentspec.yaml` — Frontend team rules (inherits engineering)

README walks through how rules compose at each level.

---

## IMPLEMENTATION ORDER

Build in this exact order. Each step must be fully complete and tested before moving to the next.

1. **spec/schema/** — JSON Schemas first (they define everything else)
2. **spec/agentspec-lang-v0.1.md** — Language specification document
3. **spec/inheritance-model.md** — Inheritance model document
4. **spec/conflict-resolution.md** — Conflict resolution document
5. **spec/examples/** — All 10 example AgentSpec files
6. **packages/agentspec-core/src/types.ts** — All TypeScript interfaces
7. **packages/agentspec-core/src/condition.ts** — Condition expression evaluator
8. **packages/agentspec-core/src/parser.ts** — YAML/JSON parser
9. **packages/agentspec-core/src/validation.ts** — Schema validation
10. **packages/agentspec-core/src/capability.ts** — Capability evaluation
11. **packages/agentspec-core/src/boundary.ts** — Boundary detection
12. **packages/agentspec-core/src/obligation.ts** — Obligation triggers
13. **packages/agentspec-core/src/escalation.ts** — Escalation evaluation
14. **packages/agentspec-core/src/inheritance.ts** — Inheritance resolution
15. **packages/agentspec-core/src/conflict.ts** — Conflict detection and resolution
16. **packages/agentspec-core/src/spec.ts** — Main AgentSpec class (ties everything together)
17. **packages/agentspec-core/src/linter.ts** — Static analysis linter
18. **packages/agentspec-core/src/diff.ts** — Spec diffing
19. **packages/agentspec-core/src/test-runner.ts** — Embedded test runner
20. **packages/agentspec-core/src/serialization.ts** — Serialization
21. **packages/agentspec-core/tests/** — All core tests
22. **packages/agentspec-enforcer/** — Runtime enforcement engine + adapters + checks + tests
23. **packages/agentspec-cli/** — CLI tool + tests
24. **packages/agentspec-mcp/** — MCP server + tests
25. **packages/agentspec-py/** — Python SDK + adapters + tests
26. **examples/** — Integration examples
27. **website/** — Landing page + docs + manifesto blog post
28. **.github/workflows/** — CI/CD pipelines
29. **Root files** — README.md, CONTRIBUTING.md, CHANGELOG.md, LICENSE

---

## IMPORTANT CONTEXT

- GitHub: github.com/AbtinDev/agentspec
- Part of the OpenClaw ecosystem (sovereign AI agents on client infrastructure)
- Sibling project to GoalOS (intent layer for AI agents)
- Target audience: AI developers, platform teams, security/compliance teams
- Primary demo: MCP server integrated with Claude Desktop + LangChain enforcement
- Keep dependencies minimal — lightweight and fast
- Must work offline — no cloud dependency for core functionality
- Users OWN their specs — stored locally by default
- Spec must be extensible for domain-specific needs
- All code must be production-quality: proper error handling, input validation, TypeScript strict mode, comprehensive JSDoc/docstrings
- All public APIs must have JSDoc comments with @param, @returns, @throws, @example
- Error messages must be actionable — tell the user what went wrong AND how to fix it
- Follow semantic versioning strictly
- The `.agentspec.yaml` file extension is canonical; `.agentspec.json` is also supported
- YAML is the primary format because it is more readable for behavior rules
- Inheritance uses file paths relative to the current spec file
- The MCP server should be usable without the CLI (standalone)
- The CLI should be usable without the MCP server
- The enforcer should be usable without the CLI or MCP server
- Each package should be independently installable and usable
