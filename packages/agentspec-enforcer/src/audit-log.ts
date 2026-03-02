/**
 * Audit log management for enforcement tracking
 */

import { nanoid } from 'nanoid';
import type { AuditLogEntry, RequestContext, CheckResult, Violation } from './types';

/**
 * In-memory audit log
 */
export class AuditLog {
  private entries: AuditLogEntry[] = [];
  private maxSize: number = 10000;

  constructor(maxSize?: number) {
    if (maxSize && maxSize > 0) {
      this.maxSize = maxSize;
    }
  }

  /**
   * Create audit log entry
   */
  createEntry(
    context: RequestContext,
    allowed: boolean,
    violations: Violation[],
    checkResults: CheckResult[]
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: nanoid(),
      timestamp: new Date(),
      agentId: context.agentId,
      action: context.action,
      resource: context.resource,
      allowed,
      violations,
      checkResults,
      metadata: context.metadata,
    };

    this.addEntry(entry);
    return entry;
  }

  /**
   * Add entry to log
   */
  addEntry(entry: AuditLogEntry): void {
    this.entries.push(entry);
    this.pruneIfNeeded();
  }

  /**
   * Get all entries
   */
  getEntries(): readonly AuditLogEntry[] {
    return Object.freeze([...this.entries]);
  }

  /**
   * Get entries for agent
   */
  getEntriesForAgent(agentId: string): AuditLogEntry[] {
    return this.entries.filter((e) => e.agentId === agentId);
  }

  /**
   * Get entries for action
   */
  getEntriesForAction(action: string): AuditLogEntry[] {
    return this.entries.filter((e) => e.action === action);
  }

  /**
   * Get denied entries
   */
  getDeniedEntries(): AuditLogEntry[] {
    return this.entries.filter((e) => !e.allowed);
  }

  /**
   * Get entries with violations
   */
  getEntriesWithViolations(violationType?: string): AuditLogEntry[] {
    return this.entries.filter(
      (e) =>
        e.violations.length > 0 &&
        (!violationType || e.violations.some((v) => v.type === violationType))
    );
  }

  /**
   * Get entries in time range
   */
  getEntriesInRange(start: Date, end: Date): AuditLogEntry[] {
    return this.entries.filter(
      (e) => e.timestamp >= start && e.timestamp <= end
    );
  }

  /**
   * Get entry by ID
   */
  getEntryById(id: string): AuditLogEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get total entries
   */
  getCount(): number {
    return this.entries.length;
  }

  /**
   * Export entries as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Export entries as CSV
   */
  exportCSV(): string {
    if (this.entries.length === 0) {
      return '';
    }

    const headers = [
      'id',
      'timestamp',
      'agentId',
      'action',
      'resource',
      'allowed',
      'violationCount',
    ];
    const rows = this.entries.map((e) =>
      [
        e.id,
        e.timestamp.toISOString(),
        e.agentId,
        e.action,
        e.resource || '',
        e.allowed ? 'true' : 'false',
        e.violations.length,
      ].map((v) => `"${String(v)}"`)
    );

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    allowed: number;
    denied: number;
    uniqueAgents: number;
    uniqueActions: number;
    totalViolations: number;
  } {
    const allowed = this.entries.filter((e) => e.allowed).length;
    const denied = this.entries.filter((e) => !e.allowed).length;
    const agents = new Set(this.entries.map((e) => e.agentId)).size;
    const actions = new Set(this.entries.map((e) => e.action)).size;
    const violations = this.entries.reduce((sum, e) => sum + e.violations.length, 0);

    return {
      total: this.entries.length,
      allowed,
      denied,
      uniqueAgents: agents,
      uniqueActions: actions,
      totalViolations: violations,
    };
  }

  /**
   * Prune old entries if max size exceeded
   */
  private pruneIfNeeded(): void {
    if (this.entries.length > this.maxSize) {
      const removeCount = this.entries.length - this.maxSize;
      this.entries = this.entries.slice(removeCount);
    }
  }
}

/**
 * Create a new audit log
 */
export function createAuditLog(maxSize?: number): AuditLog {
  return new AuditLog(maxSize);
}
