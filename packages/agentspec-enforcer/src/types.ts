/**
 * AgentSpec Enforcer Type Definitions
 */

/** Request context for enforcement checks */
export interface RequestContext {
  /** Unique request ID */
  requestId: string;
  /** Agent performing the action */
  agentId: string;
  /** Action being performed */
  action: string;
  /** Resource being accessed */
  resource?: string;
  /** Input data */
  input: unknown;
  /** Additional context */
  metadata?: Record<string, unknown>;
  /** Timestamp */
  timestamp: Date;
  /** User or caller context */
  caller?: {
    id?: string;
    email?: string;
    role?: string;
  };
}

/** Check execution result */
export interface CheckResult {
  /** Check passed or failed */
  passed: boolean;
  /** Check name */
  checkName: string;
  /** Check type */
  checkType: CheckType;
  /** Violation message if failed */
  message?: string;
  /** Severity level */
  severity: Severity;
  /** Remediation suggestion */
  remediation?: string;
  /** Check metadata */
  metadata?: Record<string, unknown>;
}

export type CheckType = 'pre-check' | 'action-check' | 'post-check';
export type Severity = 'info' | 'warning' | 'error' | 'critical';

/** Enforcement violation */
export interface Violation {
  /** Violation ID */
  id: string;
  /** Violation type */
  type: ViolationType;
  /** Severity */
  severity: Severity;
  /** Description */
  message: string;
  /** Check that failed */
  failedCheck?: string;
  /** Remediation advice */
  remediation?: string;
  /** Action taken */
  action: ViolationAction;
  /** Whether violation was enforced */
  enforced: boolean;
}

export type ViolationType =
  | 'boundary_violation'
  | 'capability_limit_exceeded'
  | 'obligation_not_met'
  | 'pii_detected'
  | 'sentiment_violation'
  | 'topic_violation'
  | 'rate_limit_exceeded'
  | 'custom_violation';

export type ViolationAction = 'block' | 'alert' | 'log' | 'redact';

/** Audit log entry */
export interface AuditLogEntry {
  /** Entry ID */
  id: string;
  /** Timestamp */
  timestamp: Date;
  /** Agent ID */
  agentId: string;
  /** Action performed */
  action: string;
  /** Resource accessed */
  resource?: string;
  /** Whether action was allowed */
  allowed: boolean;
  /** Violations found */
  violations: Violation[];
  /** Check results */
  checkResults: CheckResult[];
  /** Request metadata */
  metadata?: Record<string, unknown>;
}

/** Pre-check options */
export interface PreCheckOptions {
  /** Capability checks */
  capabilities?: boolean;
  /** Boundary checks */
  boundaries?: boolean;
  /** Custom pre-checks */
  custom?: boolean;
}

/** Post-check options */
export interface PostCheckOptions {
  /** Obligation compliance checks */
  obligations?: boolean;
  /** Response validation */
  response?: boolean;
  /** Custom post-checks */
  custom?: boolean;
}

/** Action check options */
export interface ActionCheckOptions {
  /** Rate limit checks */
  rateLimit?: boolean;
  /** Custom action checks */
  custom?: boolean;
}

/** Enforcement result */
export interface EnforcementResult {
  /** Whether action is allowed */
  allowed: boolean;
  /** Violations found */
  violations: Violation[];
  /** Pre-check results */
  preCheckResults?: CheckResult[];
  /** Action check results */
  actionCheckResults?: CheckResult[];
  /** Post-check results */
  postCheckResults?: CheckResult[];
  /** Audit log entry */
  auditEntry: AuditLogEntry;
}

/** Custom check function */
export type CustomCheckFn = (context: RequestContext) => Promise<CheckResult>;

/** Check registry */
export interface CheckRegistry {
  [checkName: string]: CustomCheckFn;
}

/** Violation handler */
export type ViolationHandler = (violation: Violation) => Promise<void>;

/** Enforcer configuration */
export interface EnforcerConfig {
  /** Enable pre-checks */
  enablePreChecks?: boolean;
  /** Enable action checks */
  enableActionChecks?: boolean;
  /** Enable post-checks */
  enablePostChecks?: boolean;
  /** Block violations or just log */
  enforceViolations?: boolean;
  /** Keep audit log in memory */
  keepAuditLog?: boolean;
  /** Max audit log entries before pruning */
  maxAuditLogSize?: number;
  /** Custom violation handlers */
  violationHandlers?: {
    onBlockViolation?: ViolationHandler;
    onAlertViolation?: ViolationHandler;
    onLogViolation?: ViolationHandler;
  };
  /** Custom checks */
  customChecks?: CheckRegistry;
}

/** Express middleware request */
export interface ExpressRequest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  user?: { id?: string; email?: string; role?: string };
}

/** Express middleware response */
export interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: unknown) => void;
  send: (data: unknown) => void;
  header: (key: string, value: string) => ExpressResponse;
}

/** LangChain callback context */
export interface LangChainCallback {
  onChainStart?: (inputs: unknown, agentId: string) => Promise<void>;
  onChainEnd?: (outputs: unknown, agentId: string) => Promise<void>;
  onToolStart?: (tool: string, input: unknown, agentId: string) => Promise<void>;
  onToolEnd?: (output: unknown, agentId: string) => Promise<void>;
  onToolError?: (error: Error, agentId: string) => Promise<void>;
}

/** CrewAI task context */
export interface CrewAITaskContext {
  taskId: string;
  agentId: string;
  tool: string;
  input: unknown;
  output?: unknown;
  error?: Error;
}

/** MCP message context */
export interface MCPMessageContext {
  role: 'user' | 'assistant';
  content: string;
  toolUse?: {
    name: string;
    input: unknown;
  };
}

/** Adapter interface */
export interface EnforcementAdapter {
  /** Extract request context */
  extractContext: (request: unknown) => RequestContext;
  /** Handle enforcement result */
  handleResult: (result: EnforcementResult) => Promise<void>;
}
