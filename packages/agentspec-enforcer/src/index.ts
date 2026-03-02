/**
 * AgentSpec Enforcer - Main Entry Point
 */

// Types
export type {
  RequestContext,
  CheckResult,
  CheckType,
  Severity,
  Violation,
  ViolationType,
  ViolationAction,
  AuditLogEntry,
  PreCheckOptions,
  PostCheckOptions,
  ActionCheckOptions,
  EnforcementResult,
  CustomCheckFn,
  CheckRegistry,
  ViolationHandler,
  EnforcerConfig,
  ExpressRequest,
  ExpressResponse,
  LangChainCallback,
  CrewAITaskContext,
  MCPMessageContext,
  EnforcementAdapter,
} from './types';

// Context management
export {
  createContext,
  getAgentId,
  getAction,
  getResource,
  getInput,
  getMetadata,
  hasCaller,
  getCallerId,
  getCallerEmail,
  getCallerRole,
  validateContext,
} from './context';

// Pre-checks
export {
  checkCapability,
  checkBoundary,
  checkPermission,
  validateInput,
  validateContextCheck,
  runPreChecks,
} from './pre-check';

// Post-checks
export {
  checkObligation,
  validateResponse,
  checkCitations,
  checkTransparency,
  checkContentSafety,
  runPostChecks,
} from './post-check';

// Action checks
export {
  checkRateLimit,
  checkConcurrency,
  checkResourceUsage,
  checkTimeout,
  checkAnomalies,
  runActionChecks,
  clearRateLimitTracker,
} from './action-check';

// Violations
export {
  createViolation,
  createPIIViolation,
  createBoundaryViolation,
  createCapabilityLimitViolation,
  createObligationViolation,
  createSentimentViolation,
  createTopicViolation,
  createRateLimitViolation,
  createCustomViolation,
  enforceViolation,
  getViolationContext,
  getViolationSeverityRank,
  sortByViolationSeverity,
} from './violation';

// Audit log
export { AuditLog, createAuditLog } from './audit-log';

// Checks
export {
  detectPII,
  checkPIIInInput,
  checkPIIInOutput,
  redactPII,
  getPIIPatternNames,
  addCustomPIIPattern,
  removeCustomPIIPattern,
} from './checks/pii';

export {
  analyzeSentiment,
  checkSentimentConstraints,
  softenNegativeSentiment,
  strengthenPositiveSentiment,
} from './checks/sentiment';

export {
  extractTopics,
  checkTopicConstraints,
  filterTopics,
  getTopicKeywords,
} from './checks/topic';

export {
  RateLimiter,
  TokenBucket,
  SlidingWindowLimiter,
  createRateLimiter,
  createTokenBucket,
  createSlidingWindowLimiter,
} from './checks/rate-limit';
