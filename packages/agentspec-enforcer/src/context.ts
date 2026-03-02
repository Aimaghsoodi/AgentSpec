/**
 * Request context management for enforcement
 */

import { nanoid } from 'nanoid';
import type { RequestContext } from './types';

/**
 * Create a new request context
 */
export function createContext(
  agentId: string,
  action: string,
  input: unknown,
  options?: {
    resource?: string;
    metadata?: Record<string, unknown>;
    caller?: { id?: string; email?: string; role?: string };
  }
): RequestContext {
  return {
    requestId: nanoid(),
    agentId,
    action,
    input,
    resource: options?.resource,
    metadata: options?.metadata,
    caller: options?.caller,
    timestamp: new Date(),
  };
}

/**
 * Extract agent ID from context
 */
export function getAgentId(context: RequestContext): string {
  return context.agentId;
}

/**
 * Extract action from context
 */
export function getAction(context: RequestContext): string {
  return context.action;
}

/**
 * Extract resource from context
 */
export function getResource(context: RequestContext): string | undefined {
  return context.resource;
}

/**
 * Extract input from context
 */
export function getInput(context: RequestContext): unknown {
  return context.input;
}

/**
 * Get metadata value
 */
export function getMetadata(
  context: RequestContext,
  key: string
): unknown {
  return context.metadata?.[key];
}

/**
 * Check if context has caller information
 */
export function hasCaller(context: RequestContext): boolean {
  return !!context.caller;
}

/**
 * Get caller ID
 */
export function getCallerId(context: RequestContext): string | undefined {
  return context.caller?.id;
}

/**
 * Get caller email
 */
export function getCallerEmail(context: RequestContext): string | undefined {
  return context.caller?.email;
}

/**
 * Get caller role
 */
export function getCallerRole(context: RequestContext): string | undefined {
  return context.caller?.role;
}

/**
 * Validate context
 */
export function validateContext(context: RequestContext): string[] {
  const errors: string[] = [];

  if (!context.requestId || typeof context.requestId !== 'string') {
    errors.push('requestId must be a non-empty string');
  }

  if (!context.agentId || typeof context.agentId !== 'string') {
    errors.push('agentId must be a non-empty string');
  }

  if (!context.action || typeof context.action !== 'string') {
    errors.push('action must be a non-empty string');
  }

  if (context.input === undefined || context.input === null) {
    errors.push('input is required');
  }

  if (!(context.timestamp instanceof Date)) {
    errors.push('timestamp must be a Date instance');
  }

  return errors;
}
