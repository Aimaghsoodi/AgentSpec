/**
 * Post-check enforcement — validate after action execution
 */

import type { RequestContext, CheckResult, CheckRegistry } from './types';

/**
 * Obligation compliance check
 */
export async function checkObligation(
  context: RequestContext,
  requirements?: string[]
): Promise<CheckResult> {
  if (!requirements || requirements.length === 0) {
    return {
      passed: true,
      checkName: 'obligation_check',
      checkType: 'post-check',
      severity: 'info',
    };
  }

  // Check if response contains required elements
  const response = context.metadata?.response || '';
  const responseStr = String(response);

  const missing: string[] = [];
  for (const requirement of requirements) {
    if (!responseStr.includes(requirement)) {
      missing.push(requirement);
    }
  }

  if (missing.length > 0) {
    return {
      passed: false,
      checkName: 'obligation_check',
      checkType: 'post-check',
      severity: 'error',
      message: `Missing obligations: ${missing.join(', ')}`,
      remediation: `Response must include: ${missing.join(', ')}`,
    };
  }

  return {
    passed: true,
    checkName: 'obligation_check',
    checkType: 'post-check',
    severity: 'info',
  };
}

/**
 * Response validation check
 */
export async function validateResponse(
  context: RequestContext,
  response: unknown,
  validator?: (response: unknown) => boolean
): Promise<CheckResult> {
  let passed = true;
  let message: string | undefined;

  if (!response) {
    return {
      passed: false,
      checkName: 'response_validation',
      checkType: 'post-check',
      severity: 'error',
      message: 'Response is required',
    };
  }

  if (validator) {
    try {
      passed = validator(response);
      if (!passed) {
        message = 'Response validation failed';
      }
    } catch (e) {
      passed = false;
      message = `Response validation error: ${e instanceof Error ? e.message : 'Unknown error'}`;
    }
  }

  return {
    passed,
    checkName: 'response_validation',
    checkType: 'post-check',
    severity: 'error',
    message,
  };
}

/**
 * Citation requirement check
 */
export async function checkCitations(
  context: RequestContext,
  response: unknown
): Promise<CheckResult> {
  const responseStr = String(response);

  // Check for citation patterns
  const citationPatterns = [
    /\[.*\]\(.*\)/,  // Markdown links
    /cite[sd]?\s/i,  // "cite", "cites", "cited"
    /source[s]?\s/i, // "source", "sources"
    /reference[s]?\s/i, // "reference", "references"
  ];

  const hasCitation = citationPatterns.some((pattern) =>
    pattern.test(responseStr)
  );

  if (!hasCitation && responseStr.length > 100) {
    return {
      passed: false,
      checkName: 'citation_check',
      checkType: 'post-check',
      severity: 'warning',
      message: 'Response should include citations',
      remediation: 'Add citations to sources used in the response',
    };
  }

  return {
    passed: true,
    checkName: 'citation_check',
    checkType: 'post-check',
    severity: 'info',
  };
}

/**
 * Transparency check
 */
export async function checkTransparency(
  context: RequestContext,
  response: unknown
): Promise<CheckResult> {
  const responseStr = String(response);

  // Check for explanation patterns
  const explanationPatterns = [
    /i (decided|chose|determined|concluded)/i,
    /the reason/i,
    /my reasoning/i,
    /my conclusion/i,
    /reasoning:/i,
  ];

  const hasExplanation = explanationPatterns.some((pattern) =>
    pattern.test(responseStr)
  );

  if (!hasExplanation && responseStr.length > 100) {
    return {
      passed: false,
      checkName: 'transparency_check',
      checkType: 'post-check',
      severity: 'warning',
      message: 'Response should explain reasoning',
      remediation: 'Include an explanation of your reasoning or decision-making process',
    };
  }

  return {
    passed: true,
    checkName: 'transparency_check',
    checkType: 'post-check',
    severity: 'info',
  };
}

/**
 * Content safety check
 */
export async function checkContentSafety(
  context: RequestContext,
  response: unknown,
  deniedPatterns?: string[]
): Promise<CheckResult> {
  const responseStr = String(response);

  if (!deniedPatterns || deniedPatterns.length === 0) {
    return {
      passed: true,
      checkName: 'content_safety_check',
      checkType: 'post-check',
      severity: 'info',
    };
  }

  for (const pattern of deniedPatterns) {
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(responseStr)) {
        return {
          passed: false,
          checkName: 'content_safety_check',
          checkType: 'post-check',
          severity: 'critical',
          message: `Response contains denied pattern: ${pattern}`,
          remediation: 'Remove the offensive content and try again',
        };
      }
    } catch (e) {
      // Invalid regex, skip
    }
  }

  return {
    passed: true,
    checkName: 'content_safety_check',
    checkType: 'post-check',
    severity: 'info',
  };
}

/**
 * Run all post-checks
 */
export async function runPostChecks(
  context: RequestContext,
  response: unknown,
  options?: {
    obligations?: string[];
    validation?: (response: unknown) => boolean;
    citations?: boolean;
    transparency?: boolean;
    contentSafety?: string[];
    customChecks?: CheckRegistry;
  }
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // Obligation check
  if (options?.obligations) {
    results.push(await checkObligation(context, options.obligations));
  }

  // Response validation
  if (options?.validation) {
    results.push(await validateResponse(context, response, options.validation));
  } else {
    results.push(await validateResponse(context, response));
  }

  // If response validation failed, stop here
  if (!results[results.length - 1]?.passed) {
    return results;
  }

  // Citation check
  if (options?.citations !== false) {
    results.push(await checkCitations(context, response));
  }

  // Transparency check
  if (options?.transparency !== false) {
    results.push(await checkTransparency(context, response));
  }

  // Content safety check
  if (options?.contentSafety) {
    results.push(await checkContentSafety(context, response, options.contentSafety));
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
          checkType: 'post-check',
          severity: 'error',
          message: `Custom check error: ${e instanceof Error ? e.message : 'Unknown error'}`,
        });
      }
    }
  }

  return results;
}
