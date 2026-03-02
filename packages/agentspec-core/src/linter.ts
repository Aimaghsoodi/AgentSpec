/**
 * Linter module — static analysis of AgentSpec files
 */

import type { AgentSpecFile, LintIssue } from './types';

function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

export function lintSpec(spec: AgentSpecFile): { valid: boolean; errors: LintIssue[]; warnings: LintIssue[]; suggestions: LintIssue[]; score: number } {
  const errors: LintIssue[] = [];
  const warnings: LintIssue[] = [];
  const suggestions: LintIssue[] = [];

  // Check version
  if (!spec.version) {
    errors.push({
      code: 'MISSING_VERSION',
      message: 'Spec is missing a version field',
      severity: 'error',
      location: 'version',
    });
  }

  // Check agent
  if (!spec.agent) {
    errors.push({
      code: 'MISSING_AGENT',
      message: 'Spec is missing an agent field',
      severity: 'error',
      location: 'agent',
    });
  } else {
    // Check timestamps
    if (spec.agent.createdAt && !isValidISODate(spec.agent.createdAt)) {
      errors.push({
        code: 'INVALID_DATE_FORMAT',
        message: 'Agent createdAt has invalid date format',
        severity: 'error',
        location: 'agent.createdAt',
      });
    }
    if (spec.agent.updatedAt && !isValidISODate(spec.agent.updatedAt)) {
      errors.push({
        code: 'INVALID_DATE_FORMAT',
        message: 'Agent updatedAt has invalid date format',
        severity: 'error',
        location: 'agent.updatedAt',
      });
    }
  }

  // Check capabilities
  if (!spec.capabilities || spec.capabilities.length === 0) {
    errors.push({
      code: 'NO_CAPABILITIES',
      message: 'Spec has no capabilities defined',
      severity: 'error',
      location: 'capabilities',
    });
  }

  // Check boundaries
  if (!spec.boundaries || spec.boundaries.length === 0) {
    errors.push({
      code: 'NO_BOUNDARIES',
      message: 'Spec has no boundaries defined',
      severity: 'error',
      location: 'boundaries',
    });
  }

  // Check duplicate IDs within capabilities
  if (spec.capabilities) {
    const capIds = new Set<string>();
    for (const cap of spec.capabilities) {
      if (capIds.has(cap.id)) {
        errors.push({
          code: 'DUPLICATE_ID',
          message: `Duplicate capability ID: ${cap.id}`,
          severity: 'error',
          location: `capabilities.${cap.id}`,
        });
      }
      capIds.add(cap.id);
    }
  }

  // Check duplicate IDs within boundaries
  if (spec.boundaries) {
    const boundIds = new Set<string>();
    for (const bound of spec.boundaries) {
      if (boundIds.has(bound.id)) {
        errors.push({
          code: 'DUPLICATE_ID',
          message: `Duplicate boundary ID: ${bound.id}`,
          severity: 'error',
          location: `boundaries.${bound.id}`,
        });
      }
      boundIds.add(bound.id);
    }
  }

  // Check high-risk capabilities without boundaries
  if (spec.capabilities) {
    for (const cap of spec.capabilities) {
      if (cap.riskLevel === 'critical' || cap.riskLevel === 'high') {
        const hasBoundary = spec.boundaries?.some(
          (b) => b.type === cap.category
        );
        if (!hasBoundary) {
          errors.push({
            code: 'HIGH_RISK_NO_BOUNDARY',
            message: `High-risk capability "${cap.id}" has no corresponding boundary`,
            severity: 'error',
            location: `capabilities.${cap.id}`,
          });
        }
      }
    }
  }

  const score = Math.max(0, 100 - errors.length * 15 - warnings.length * 5 - suggestions.length * 2);

  return { valid: errors.length === 0, errors, warnings, suggestions, score };
}

export function lintSecurity(spec: AgentSpecFile): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check for critical capabilities
  if (spec.capabilities) {
    for (const cap of spec.capabilities) {
      if (cap.riskLevel === 'critical') {
        issues.push({
          code: 'CRITICAL_CAPABILITY',
          message: `Critical capability detected: ${cap.id}`,
          severity: 'warning',
          location: `capabilities.${cap.id}`,
        });
      }
    }
  }

  // Check audit config
  if (spec.audit && !spec.audit.enabled) {
    issues.push({
      code: 'AUDIT_DISABLED',
      message: 'Audit logging is disabled',
      severity: 'warning',
      location: 'audit',
    });
  }

  return issues;
}

export function lintPerformance(spec: AgentSpecFile): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check too many boundaries
  if (spec.boundaries && spec.boundaries.length > 50) {
    issues.push({
      code: 'TOO_MANY_BOUNDARIES',
      message: `Spec has ${spec.boundaries.length} boundaries, which may impact performance`,
      severity: 'warning',
      location: 'boundaries',
    });
  }

  // Check too many capabilities
  if (spec.capabilities && spec.capabilities.length > 100) {
    issues.push({
      code: 'TOO_MANY_CAPABILITIES',
      message: `Spec has ${spec.capabilities.length} capabilities, which may impact performance`,
      severity: 'warning',
      location: 'capabilities',
    });
  }

  return issues;
}

export function lintDocumentation(spec: AgentSpecFile): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check agent description
  if (spec.agent && !spec.agent.description) {
    issues.push({
      code: 'MISSING_DESCRIPTION',
      message: 'Agent is missing a description',
      severity: 'warning',
      location: 'agent.description',
    });
  }

  // Check capability descriptions
  if (spec.capabilities) {
    for (const cap of spec.capabilities) {
      if (!cap.description) {
        issues.push({
          code: 'MISSING_DESCRIPTION',
          message: `Capability "${cap.id}" is missing a description`,
          severity: 'warning',
          location: `capabilities.${cap.id}.description`,
        });
      }
    }
  }

  return issues;
}
