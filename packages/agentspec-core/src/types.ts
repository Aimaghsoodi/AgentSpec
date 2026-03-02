/**
 * AgentSpec Core Type Definitions
 *
 * Types matching the test expectations and the AgentSpec specification.
 */

// ============================================================
// AGENT METADATA
// ============================================================

export interface AgentMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// ============================================================
// CAPABILITY
// ============================================================

export interface Capability {
  id: string;
  name: string;
  description?: string;
  category: string;
  enabled: boolean;
  riskLevel: RiskLevel;
  scope?: CapabilityScope;
  constraints?: string[];
  rateLimit?: RateLimit;
  requiresApproval?: boolean;
  approvalFrom?: string;
  conditions?: ConditionExpression;
  priority?: number;
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface CapabilityScope {
  domains?: string[];
  resources?: string[];
  dataTypes?: string[];
  maxTokens?: number;
  allowedFormats?: string[];
  [key: string]: unknown;
}

export interface RateLimit {
  maxCalls: number;
  windowSeconds: number;
  burstLimit?: number;
  cooldownSeconds?: number;
}

// ============================================================
// BOUNDARY
// ============================================================

export interface Boundary {
  id: string;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  condition: ConditionExpression;
  actions: string[];
  priority: number;
  enforcement: string;
  severity?: Severity;
  message?: string;
  exemptions?: BoundaryExemption[];
}

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface BoundaryExemption {
  description: string;
  conditions: ConditionExpression;
}

// ============================================================
// OBLIGATION
// ============================================================

export interface Obligation {
  id: string;
  description: string;
  trigger: ConditionExpression;
  action: string;
  priority: number;
  enforcement?: ObligationEnforcement;
  failureAction?: ViolationAction;
}

export type ObligationEnforcement = 'pre_response' | 'post_response' | 'always';
export type ViolationAction = 'block' | 'alert' | 'log' | 'redact' | 'escalate';

// ============================================================
// ESCALATION
// ============================================================

export interface EscalationRule {
  id: string;
  description: string;
  trigger: ConditionExpression;
  escalateTo: string;
  action: EscalationAction;
  timeout?: number;
  fallbackAction?: string;
  priority?: number;
  message?: string;
}

export type EscalationAction =
  | 'pause_and_notify'
  | 'notify_and_continue'
  | 'block_and_notify';

// ============================================================
// CONDITION EXPRESSIONS
// ============================================================

export interface FieldCondition {
  type: 'field';
  field: string;
  negate?: boolean;
}

export interface ComparisonCondition {
  type: 'comparison';
  field: string;
  comparison: ComparisonOperator;
  value: unknown;
  negate?: boolean;
}

export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'matches'
  | 'in'
  | 'not_in';

export interface LogicalCondition {
  type: 'logical';
  operator: 'and' | 'or';
  conditions: ConditionExpression[];
  negate?: boolean;
}

export interface RegexCondition {
  type: 'regex';
  field: string;
  value: string;
  flags?: string;
  negate?: boolean;
}

export interface CustomCondition {
  type: 'custom';
  custom: string;
  negate?: boolean;
}

export type ConditionExpression =
  | FieldCondition
  | ComparisonCondition
  | LogicalCondition
  | RegexCondition
  | CustomCondition;

// ============================================================
// VERIFICATION
// ============================================================

export interface VerificationConfig {
  preResponse?: Check[];
  postResponse?: Check[];
  onAction?: Check[];
}

export interface Check {
  id: string;
  type: CheckType;
  config?: Record<string, unknown>;
  action: ViolationAction;
  description?: string;
}

export type CheckType =
  | 'pii'
  | 'sentiment'
  | 'topic'
  | 'toxicity'
  | 'length'
  | 'format'
  | 'rate_limit'
  | 'custom';

// ============================================================
// AUDIT
// ============================================================

export interface AuditConfig {
  enabled: boolean;
  logLevel: AuditLogLevel;
  format: string;
  retention?: string;
  exportFormat?: AuditExportFormat;
  destination?: AuditDestination;
}

export type AuditLogLevel = 'all' | 'violations' | 'escalations' | 'none';
export type AuditExportFormat = 'json' | 'csv' | 'jsonl';

export interface AuditDestination {
  type: 'file' | 'stdout' | 'webhook';
  path?: string;
  url?: string;
  headers?: Record<string, string>;
}

// ============================================================
// TEST CASES
// ============================================================

export interface TestCase {
  id: string;
  description: string;
  input: TestInput;
  expect: TestExpectation;
}

export interface TestInput {
  action?: string;
  text?: string;
  context?: Record<string, unknown>;
  agentId?: string;
}

export interface TestExpectation {
  allowed?: boolean;
  violations?: string[];
  obligations?: string[];
  escalations?: string[];
  checksPassed?: string[];
  checksFailed?: string[];
}

// ============================================================
// AGENTSPEC FILE — Top-level specification document
// ============================================================

export interface AgentSpecFile {
  version: string;
  agent: AgentMetadata;
  capabilities: Capability[];
  boundaries: Boundary[];
  obligations?: Obligation[];
  escalationRules?: EscalationRule[];
  verification?: VerificationConfig;
  audit?: AuditConfig;
  tests?: TestCase[];
  metadata?: Record<string, unknown>;
  inherits?: string[];
}

// ============================================================
// VALIDATION
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  schemaPath?: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code?: string;
}

// ============================================================
// LINTING
// ============================================================

export interface LintResult {
  valid: boolean;
  errors: LintIssue[];
  warnings: LintIssue[];
  suggestions: LintIssue[];
  score: number;
}

export interface LintIssue {
  code: string;
  message: string;
  location?: string;
  severity: 'error' | 'warning' | 'suggestion';
  fix?: string;
}

// ============================================================
// DIFFING
// ============================================================

export interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  path: string[];
  oldValue?: unknown;
  newValue?: unknown;
  severity: 'breaking' | 'non-breaking';
}

export interface DiffSummary {
  totalChanges: number;
  additions: number;
  removals: number;
  modifications: number;
  breakingChanges: number;
  nonBreakingChanges: number;
}

export interface DiffResult {
  changes: DiffChange[];
  summary: DiffSummary;
}

// ============================================================
// SERIALIZATION
// ============================================================

export interface SerializeOptions {
  format: 'json' | 'yaml' | 'xml';
  pretty?: boolean;
}
