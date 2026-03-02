/**
 * Violation handling and creation
 */

import { nanoid } from 'nanoid';
import type { Violation, ViolationType, ViolationAction, Severity, RequestContext } from './types';

/**
 * Create a violation
 */
export function createViolation(
  type: ViolationType,
  message: string,
  severity: Severity,
  options?: {
    failedCheck?: string;
    remediation?: string;
    action?: ViolationAction;
  }
): Violation {
  return {
    id: nanoid(),
    type,
    severity,
    message,
    failedCheck: options?.failedCheck,
    remediation: options?.remediation,
    action: options?.action || 'log',
    enforced: false,
  };
}

/**
 * PII detection violation
 */
export function createPIIViolation(
  pattern: string,
  remediation?: string
): Violation {
  return createViolation(
    'pii_detected',
    `PII detected: ${pattern}`,
    'critical',
    {
      remediation,
      action: 'redact',
    }
  );
}

/**
 * Boundary violation
 */
export function createBoundaryViolation(
  boundary: string,
  reason: string,
  severity: Severity = 'error'
): Violation {
  return createViolation(
    'boundary_violation',
    `Boundary violated: ${boundary}. ${reason}`,
    severity,
    {
      remediation: `Check the ${boundary} boundary constraint`,
      action: 'block',
    }
  );
}

/**
 * Capability limit exceeded
 */
export function createCapabilityLimitViolation(
  capability: string,
  limit: string
): Violation {
  return createViolation(
    'capability_limit_exceeded',
    `Capability limit exceeded for ${capability}: ${limit}`,
    'warning',
    {
      remediation: `Reduce usage or request higher limit for ${capability}`,
      action: 'block',
    }
  );
}

/**
 * Obligation not met
 */
export function createObligationViolation(
  obligation: string,
  required: string
): Violation {
  return createViolation(
    'obligation_not_met',
    `Obligation not met: ${obligation}. Required: ${required}`,
    'error',
    {
      remediation: `Fulfill the ${obligation} obligation before proceeding`,
      action: 'block',
    }
  );
}

/**
 * Sentiment violation
 */
export function createSentimentViolation(
  sentiment: string,
  threshold: number
): Violation {
  return createViolation(
    'sentiment_violation',
    `Sentiment violation detected: ${sentiment} (threshold: ${threshold})`,
    'warning',
    {
      remediation: 'Adjust tone or rephrase to meet sentiment requirements',
      action: 'alert',
    }
  );
}

/**
 * Topic violation
 */
export function createTopicViolation(
  topic: string,
  deniedTopics: string[]
): Violation {
  return createViolation(
    'topic_violation',
    `Denied topic detected: ${topic}. Denied topics: ${deniedTopics.join(', ')}`,
    'error',
    {
      remediation: `Avoid discussing the following topics: ${deniedTopics.join(', ')}`,
      action: 'block',
    }
  );
}

/**
 * Rate limit violation
 */
export function createRateLimitViolation(
  limit: string,
  window: string
): Violation {
  return createViolation(
    'rate_limit_exceeded',
    `Rate limit exceeded: ${limit} per ${window}`,
    'error',
    {
      remediation: `Wait before making another request. Limit: ${limit} per ${window}`,
      action: 'block',
    }
  );
}

/**
 * Custom violation
 */
export function createCustomViolation(
  message: string,
  severity: Severity,
  action: ViolationAction = 'log'
): Violation {
  return createViolation('custom_violation', message, severity, { action });
}

/**
 * Mark violation as enforced
 */
export function enforceViolation(violation: Violation): Violation {
  return {
    ...violation,
    enforced: true,
  };
}

/**
 * Get violation context string
 */
export function getViolationContext(
  violation: Violation,
  context: RequestContext
): string {
  return JSON.stringify({
    violationId: violation.id,
    type: violation.type,
    message: violation.message,
    severity: violation.severity,
    action: violation.action,
    agentId: context.agentId,
    requestId: context.requestId,
    timestamp: context.timestamp.toISOString(),
  });
}

/**
 * Get violation severity rank (for sorting)
 */
export function getViolationSeverityRank(severity: Severity): number {
  const ranks: Record<Severity, number> = {
    info: 0,
    warning: 1,
    error: 2,
    critical: 3,
  };
  return ranks[severity];
}

/**
 * Sort violations by severity
 */
export function sortByViolationSeverity(violations: Violation[]): Violation[] {
  return [...violations].sort(
    (a, b) => getViolationSeverityRank(b.severity) - getViolationSeverityRank(a.severity)
  );
}
