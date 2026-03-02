/**
 * Action-check enforcement — validate during action execution
 */

import type { RequestContext, CheckResult, CheckRegistry } from './types';

interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
}

interface RateLimitTracker {
  [agentId: string]: number[];
}

const rateLimitTracker: RateLimitTracker = {};

/**
 * Check rate limits
 */
export async function checkRateLimit(
  context: RequestContext,
  config: RateLimitConfig
): Promise<CheckResult> {
  const now = Date.now();
  const agentId = context.agentId;

  // Initialize tracker for this agent
  if (!rateLimitTracker[agentId]) {
    rateLimitTracker[agentId] = [];
  }

  const tracker = rateLimitTracker[agentId];

  // Remove timestamps outside the window
  const cutoff = now - config.window;
  const recentRequests = tracker.filter((t) => t > cutoff);
  rateLimitTracker[agentId] = recentRequests;

  // Check if limit exceeded
  if (recentRequests.length >= config.limit) {
    return {
      passed: false,
      checkName: 'rate_limit_check',
      checkType: 'action-check',
      severity: 'error',
      message: `Rate limit exceeded: ${config.limit} requests per ${config.window}ms`,
      remediation: `Wait ${Math.ceil((recentRequests[0] + config.window - now) / 1000)} seconds before retrying`,
    };
  }

  // Record this request
  recentRequests.push(now);
  rateLimitTracker[agentId] = recentRequests;

  return {
    passed: true,
    checkName: 'rate_limit_check',
    checkType: 'action-check',
    severity: 'info',
  };
}

/**
 * Check concurrent requests
 */
export async function checkConcurrency(
  context: RequestContext,
  maxConcurrent: number,
  tracker?: Map<string, number>
): Promise<CheckResult> {
  if (!tracker) {
    tracker = new Map();
  }

  const agentId = context.agentId;
  const current = tracker.get(agentId) ?? 0;

  if (current >= maxConcurrent) {
    return {
      passed: false,
      checkName: 'concurrency_check',
      checkType: 'action-check',
      severity: 'warning',
      message: `Concurrent request limit exceeded: ${maxConcurrent} max`,
    };
  }

  return {
    passed: true,
    checkName: 'concurrency_check',
    checkType: 'action-check',
    severity: 'info',
  };
}

/**
 * Check resource usage
 */
export async function checkResourceUsage(
  context: RequestContext,
  limits?: {
    maxMemoryMB?: number;
    maxExecutionTimeMs?: number;
    maxDataSizeKB?: number;
  }
): Promise<CheckResult> {
  if (!limits) {
    return {
      passed: true,
      checkName: 'resource_usage_check',
      checkType: 'action-check',
      severity: 'info',
    };
  }

  // Simple size check
  if (limits.maxDataSizeKB) {
    const inputSize = JSON.stringify(context.input).length / 1024;
    if (inputSize > limits.maxDataSizeKB) {
      return {
        passed: false,
        checkName: 'resource_usage_check',
        checkType: 'action-check',
        severity: 'warning',
        message: `Input size ${inputSize.toFixed(2)}KB exceeds limit ${limits.maxDataSizeKB}KB`,
      };
    }
  }

  return {
    passed: true,
    checkName: 'resource_usage_check',
    checkType: 'action-check',
    severity: 'info',
  };
}

/**
 * Check timeout
 */
export async function checkTimeout(
  context: RequestContext,
  timeoutMs: number,
  startTime: number
): Promise<CheckResult> {
  const elapsed = Date.now() - startTime;

  if (elapsed > timeoutMs) {
    return {
      passed: false,
      checkName: 'timeout_check',
      checkType: 'action-check',
      severity: 'error',
      message: `Request exceeded timeout of ${timeoutMs}ms (elapsed: ${elapsed}ms)`,
    };
  }

  return {
    passed: true,
    checkName: 'timeout_check',
    checkType: 'action-check',
    severity: 'info',
    metadata: {
      elapsed,
      remaining: timeoutMs - elapsed,
    },
  };
}

/**
 * Check for anomalies
 */
export async function checkAnomalies(
  context: RequestContext,
  baselines?: Record<string, unknown>
): Promise<CheckResult> {
  if (!baselines) {
    return {
      passed: true,
      checkName: 'anomaly_check',
      checkType: 'action-check',
      severity: 'info',
    };
  }

  // Simple baseline comparison
  const anomalies: string[] = [];

  for (const [key, baselineValue] of Object.entries(baselines)) {
    const metadata = context.metadata?.[key];
    if (metadata !== baselineValue) {
      anomalies.push(`${key}: expected ${baselineValue}, got ${metadata}`);
    }
  }

  if (anomalies.length > 0) {
    return {
      passed: false,
      checkName: 'anomaly_check',
      checkType: 'action-check',
      severity: 'warning',
      message: `Anomalies detected: ${anomalies.join('; ')}`,
    };
  }

  return {
    passed: true,
    checkName: 'anomaly_check',
    checkType: 'action-check',
    severity: 'info',
  };
}

/**
 * Run all action checks
 */
export async function runActionChecks(
  context: RequestContext,
  options?: {
    rateLimit?: RateLimitConfig;
    concurrency?: { maxConcurrent: number; tracker?: Map<string, number> };
    resources?: { maxMemoryMB?: number; maxExecutionTimeMs?: number; maxDataSizeKB?: number };
    timeout?: { ms: number; startTime: number };
    anomalies?: Record<string, unknown>;
    customChecks?: CheckRegistry;
  }
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // Rate limit check
  if (options?.rateLimit) {
    results.push(await checkRateLimit(context, options.rateLimit));
  }

  // Concurrency check
  if (options?.concurrency) {
    results.push(
      await checkConcurrency(
        context,
        options.concurrency.maxConcurrent,
        options.concurrency.tracker
      )
    );
  }

  // Resource usage check
  if (options?.resources) {
    results.push(await checkResourceUsage(context, options.resources));
  }

  // Timeout check
  if (options?.timeout) {
    results.push(
      await checkTimeout(context, options.timeout.ms, options.timeout.startTime)
    );
  }

  // Anomaly check
  if (options?.anomalies) {
    results.push(await checkAnomalies(context, options.anomalies));
  }

  // Custom checks
  if (options?.customChecks) {
    for (const [name, fn] of Object.entries(options.customChecks)) {
      try {
        const result = await fn(context);
        results.push(result);
      } catch (e) {
        results.push({
          passed: false,
          checkName: name,
          checkType: 'action-check',
          severity: 'error',
          message: `Custom check error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        });
      }
    }
  }

  return results;
}

/**
 * Clear rate limit tracker for testing
 */
export function clearRateLimitTracker(): void {
  for (const key in rateLimitTracker) {
    delete rateLimitTracker[key];
  }
}
