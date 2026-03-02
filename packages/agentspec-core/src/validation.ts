/**
 * Validation module — validate AgentSpec objects
 */

import type {
  AgentSpecFile,
  AgentMetadata,
  Capability,
  Boundary,
  ValidationResult,
  ValidationError,
} from './types';

const VALID_RISK_LEVELS = ['critical', 'high', 'medium', 'low', 'minimal'];
const VALID_ENFORCEMENTS = ['block', 'warn', 'log', 'escalate'];
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

export function validateAgent(agent: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!agent || typeof agent !== 'object') {
    errors.push({ path: 'agent', message: 'Agent must be an object', code: 'MISSING_REQUIRED_FIELD' });
    return errors;
  }

  if (!agent.id) {
    errors.push({ path: 'agent.id', message: 'Agent id is required', code: 'MISSING_REQUIRED_FIELD' });
  } else if (!ID_PATTERN.test(agent.id)) {
    errors.push({ path: 'agent.id', message: 'Agent id has invalid format', code: 'INVALID_FORMAT' });
  }

  if (!agent.name) {
    errors.push({ path: 'agent.name', message: 'Agent name is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (agent.createdAt && !isValidISODate(agent.createdAt)) {
    errors.push({ path: 'agent.createdAt', message: 'Invalid date format for createdAt', code: 'INVALID_DATE_FORMAT' });
  }

  if (agent.updatedAt && !isValidISODate(agent.updatedAt)) {
    errors.push({ path: 'agent.updatedAt', message: 'Invalid date format for updatedAt', code: 'INVALID_DATE_FORMAT' });
  }

  return errors;
}

export function validateCapability(cap: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!cap || typeof cap !== 'object') {
    errors.push({ path: 'capability', message: 'Capability must be an object', code: 'MISSING_REQUIRED_FIELD' });
    return errors;
  }

  if (!cap.id) {
    errors.push({ path: 'capability.id', message: 'Capability id is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!cap.name) {
    errors.push({ path: 'capability.name', message: 'Capability name is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!cap.category) {
    errors.push({ path: 'capability.category', message: 'Capability category is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (cap.enabled === undefined) {
    errors.push({ path: 'capability.enabled', message: 'Capability enabled is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!cap.riskLevel) {
    errors.push({ path: 'capability.riskLevel', message: 'Capability riskLevel is required', code: 'MISSING_REQUIRED_FIELD' });
  } else if (!VALID_RISK_LEVELS.includes(cap.riskLevel)) {
    errors.push({ path: 'capability.riskLevel', message: `Invalid risk level: ${cap.riskLevel}`, code: 'INVALID_ENUM_VALUE' });
  }

  return errors;
}

export function validateBoundary(bound: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!bound || typeof bound !== 'object') {
    errors.push({ path: 'boundary', message: 'Boundary must be an object', code: 'MISSING_REQUIRED_FIELD' });
    return errors;
  }

  if (!bound.id) {
    errors.push({ path: 'boundary.id', message: 'Boundary id is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!bound.name) {
    errors.push({ path: 'boundary.name', message: 'Boundary name is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!bound.type) {
    errors.push({ path: 'boundary.type', message: 'Boundary type is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (bound.enabled === undefined) {
    errors.push({ path: 'boundary.enabled', message: 'Boundary enabled is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!bound.enforcement) {
    errors.push({ path: 'boundary.enforcement', message: 'Boundary enforcement is required', code: 'MISSING_REQUIRED_FIELD' });
  } else if (!VALID_ENFORCEMENTS.includes(bound.enforcement)) {
    errors.push({ path: 'boundary.enforcement', message: `Invalid enforcement mode: ${bound.enforcement}`, code: 'INVALID_ENUM_VALUE' });
  }

  return errors;
}

export function validateSpec(spec: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: { path: string; message: string; code?: string }[] = [];

  if (!spec || typeof spec !== 'object') {
    return { valid: false, errors: [{ path: '', message: 'Spec must be an object', code: 'INVALID_SPEC' }], warnings: [] };
  }

  if (!spec.version) {
    errors.push({ path: 'version', message: 'Version is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!spec.capabilities) {
    errors.push({ path: 'capabilities', message: 'Capabilities array is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (!spec.boundaries) {
    errors.push({ path: 'boundaries', message: 'Boundaries array is required', code: 'MISSING_REQUIRED_FIELD' });
  }

  if (spec.agent) {
    errors.push(...validateAgent(spec.agent));
  }

  if (Array.isArray(spec.capabilities)) {
    for (const cap of spec.capabilities) {
      errors.push(...validateCapability(cap));
    }
  }

  if (Array.isArray(spec.boundaries)) {
    for (const bound of spec.boundaries) {
      errors.push(...validateBoundary(bound));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isValidDuration(str: string): boolean {
  return /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/.test(str) && str !== 'P' && str !== 'PT';
}

export function isValidCron(str: string): boolean {
  const parts = str.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const patterns = [
    /^(\*|([0-9]|[1-5][0-9])(\/\d+)?|(\*\/\d+))$/,
    /^(\*|([0-9]|1[0-9]|2[0-3])(\/\d+)?|(\*\/\d+))$/,
    /^(\*|([1-9]|[12]\d|3[01])(\/\d+)?|(\*\/\d+))$/,
    /^(\*|([1-9]|1[0-2])(\/\d+)?|(\*\/\d+))$/,
    /^(\*|[0-7]|MON|TUE|WED|THU|FRI|SAT|SUN)(\/\d+)?$/i,
  ];
  return parts.every((part, i) => patterns[i].test(part));
}

export function isValidEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidRegex(str: string): boolean {
  try {
    new RegExp(str);
    return true;
  } catch {
    return false;
  }
}
