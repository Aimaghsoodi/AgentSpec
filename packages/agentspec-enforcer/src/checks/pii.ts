/**
 * PII (Personally Identifiable Information) detection and enforcement
 */

import { createPIIViolation } from '../violation';
import type { Violation, RequestContext } from '../types';

// Common PII patterns
const PII_PATTERNS = {
  // US Social Security Number
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  // Credit Card numbers
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  // Phone numbers (US)
  phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/,
  // IP addresses
  ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
  // Passport numbers
  passport: /\b[A-Z]{1,2}\d{6,9}\b/,
  // Driver's License
  driversLicense: /\b[A-Z]{1,2}\d{5,8}\b/,
};

export interface PIIDetectionOptions {
  patterns?: (keyof typeof PII_PATTERNS)[];
  customPatterns?: { [key: string]: RegExp };
  redactMatches?: boolean;
  severity?: 'warning' | 'error' | 'critical';
}

/**
 * Detect PII in text
 */
export function detectPII(
  text: string,
  options?: PIIDetectionOptions
): { matches: Violation[]; redacted: string } {
  const matches: Violation[] = [];
  let redacted = text;
  const patterns = options?.patterns || Object.keys(PII_PATTERNS) as (keyof typeof PII_PATTERNS)[];
  const severity = options?.severity || 'critical';

  // Check built-in patterns
  for (const patternKey of patterns) {
    const pattern = PII_PATTERNS[patternKey];
    if (pattern) {
      const foundMatches = text.match(new RegExp(pattern, 'g'));
      if (foundMatches) {
        for (const match of foundMatches) {
          matches.push(
            createPIIViolation(
              `${patternKey}: ${match}`,
              `Remove or hash ${patternKey} before transmission`
            )
          );

          if (options?.redactMatches) {
            redacted = redacted.replace(match, `[REDACTED_${patternKey.toUpperCase()}]`);
          }
        }
      }
    }
  }

  // Check custom patterns
  if (options?.customPatterns) {
    for (const [name, pattern] of Object.entries(options.customPatterns)) {
      const foundMatches = text.match(new RegExp(pattern, 'g'));
      if (foundMatches) {
        for (const match of foundMatches) {
          matches.push(
            createPIIViolation(
              `${name}: ${match}`,
              `Remove or hash ${name} before transmission`
            )
          );

          if (options?.redactMatches) {
            redacted = redacted.replace(match, `[REDACTED_${name.toUpperCase()}]`);
          }
        }
      }
    }
  }

  return { matches, redacted };
}

/**
 * Check if input contains PII
 */
export async function checkPIIInInput(
  context: RequestContext,
  options?: PIIDetectionOptions
): Promise<Violation[]> {
  const input = String(context.input);
  const { matches } = detectPII(input, options);
  return matches;
}

/**
 * Check if output contains PII
 */
export async function checkPIIInOutput(
  output: unknown,
  options?: PIIDetectionOptions
): Promise<Violation[]> {
  const outputStr = String(output);
  const { matches } = detectPII(outputStr, options);
  return matches;
}

/**
 * Redact PII from text
 */
export function redactPII(
  text: string,
  options?: PIIDetectionOptions
): string {
  const { redacted } = detectPII(text, { ...options, redactMatches: true });
  return redacted;
}

/**
 * Get list of PII pattern names
 */
export function getPIIPatternNames(): string[] {
  return Object.keys(PII_PATTERNS);
}

/**
 * Add custom PII pattern
 */
export function addCustomPIIPattern(
  name: string,
  pattern: RegExp
): void {
  (PII_PATTERNS as Record<string, RegExp>)[name] = pattern;
}

/**
 * Remove custom PII pattern
 */
export function removeCustomPIIPattern(name: string): void {
  if (!(name in PII_PATTERNS)) {
    throw new Error(`Pattern ${name} not found in PII patterns`);
  }
  delete (PII_PATTERNS as Record<string, RegExp>)[name];
}
