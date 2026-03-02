/**
 * Pre-check enforcement — validate before action execution
 */

import type { RequestContext, CheckResult, CheckRegistry } from './types';

/**
 * Capability check
 */
export async function checkCapability(
  context: RequestContext,
  requiredCapability: string
): Promise<CheckResult> {
  // In a real implementation, this would check against AgentSpec
  const passed = !!requiredCapability;

  return {
    passed,
    checkName: 'capability_check',
    checkType: 'pre-check',
    severity: 'error',
    message: passed ? undefined : `Agent lacks capability: ${requiredCapability}`,
  };
}

/**
 * Boundary check
 */
export async function checkBoundary(
  context: RequestContext,
  denyPatterns?: string[],
  denyConditions?: { condition: string; reason: string }[]
): Promise<CheckResult> {
  const input = String(context.input);

  // Check deny patterns (regex)
  if (denyPatterns && denyPatterns.length > 0) {
    for (const pattern of denyPatterns) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(input)) {
          return {
            passed: false,
            checkName: 'boundary_check',
            checkType: 'pre-check',
            severity: 'critical',
            message: `Boundary violation: matches deny pattern: ${pattern}`,
          };
        }
      } catch (e) {
        // Invalid regex, skip
      }
    }
  }

  // Check deny conditions
  if (denyConditions && denyConditions.length > 0) {
    for (const cond of denyConditions) {
      // Simple condition matching
      if (cond.condition.includes('not_in_') || cond.condition.includes('not_found')) {
        return {
          passed: false,
          checkName: 'boundary_check',
          checkType: 'pre-check',
          severity: 'critical',
          message: `Boundary violation: ${cond.reason}`,
        };
      }
    }
  }

  return {
    passed: true,
    checkName: 'boundary_check',
    checkType: 'pre-check',
    severity: 'info',
  };
}

/**
 * Permission check
 */
export async function checkPermission(
  context: RequestContext,
  requiredPermissions?: string[]
): Promise<CheckResult> {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return {
      passed: true,
      checkName: 'permission_check',
      checkType: 'pre-check',
      severity: 'info',
    };
  }

  // In a real implementation, check against agent permissions
  const passed = true;

  return {
    passed,
    checkName: 'permission_check',
    checkType: 'pre-check',
    severity: 'error',
    message: passed ? undefined : 'Insufficient permissions',
  };
}

/**
 * Input validation check
 */
export async function validateInput(
  context: RequestContext,
  validator?: (input: unknown) => boolean
): Promise<CheckResult> {
  let passed = true;
  let message: string | undefined;

  if (validator) {
    try {
      passed = validator(context.input);
      if (!passed) {
        message = 'Input validation failed';
      }
    } catch (e) {
      passed = false;
      message = `Input validation error: ${e instanceof Error ? e.message : 'Unknown error'}`;
    }
  }

  return {
    passed,
    checkName: 'input_validation',
    checkType: 'pre-check',
    severity: 'error',
    message,
  };
}

/**
 * Context validation check
 */
export async function validateContextCheck(
  context: RequestContext
): Promise<CheckResult> {
  const errors: string[] = [];

  if (!context.agentId) {
    errors.push('agentId is required');
  }

  if (!context.action) {
    errors.push('action is required');
  }

  if (context.input === undefined || context.input === null) {
    errors.push('input is required');
  }

  const passed = errors.length === 0;

  return {
    passed,
    checkName: 'context_validation',
    checkType: 'pre-check',
    severity: 'error',
    message: passed ? undefined : `Context validation failed: ${errors.join(', ')}`,
  };
}

/**
 * Run all pre-checks
 */
export async function runPreChecks(
  context: RequestContext,
  options?: {
    capabilities?: boolean;
    boundaries?: boolean;
    permissions?: boolean;
    validation?: boolean;
    customChecks?: CheckRegistry;
  }
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // Validate context first
  if (options?.validation !== false) {
    results.push(await validateContextCheck(context));
  }

  // If context validation failed, stop here
  if (!results[0]?.passed) {
    return results;
  }

  // Run capability check
  if (options?.capabilities !== false) {
    results.push(await checkCapability(context, 'default'));
  }

  // Run boundary check
  if (options?.boundaries !== false) {
    results.push(await checkBoundary(context));
  }

  // Run permission check
  if (options?.permissions !== false) {
    results.push(await checkPermission(context));
  }

  // Run custom checks
  if (options?.customChecks) {
    for (const [name, fn] of Object.entries(options.customChecks)) {
      try {
        const result = await fn(context);
        results.push(result);
      } catch (e) {
        results.push({
          passed: false,
          checkName: name,
          checkType: 'pre-check',
          severity: 'error',
          message: `Custom check error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        });
      }
    }
  }

  return results;
}
