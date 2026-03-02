/**
 * AgentSpec class — the core abstraction wrapping an AgentSpecFile
 */

import type {
  AgentSpecFile,
  Capability,
  Boundary,
  Obligation,
  EscalationRule,
  ValidationResult,
  LintResult,
} from './types';
import { parseSpec } from './parser';
import { validateSpec } from './validation';
import { lintSpec } from './linter';
import { serializeSpec } from './serialization';
import { diffSpecs } from './diff';
import { evaluateCondition } from './condition';
import { generateId, getCurrentTimestamp } from './utils';
import * as fs from 'fs';

export class AgentSpec {
  private spec: AgentSpecFile;

  constructor(spec: AgentSpecFile) {
    this.spec = spec;
  }

  static fromYAML(yaml: string): AgentSpec {
    return new AgentSpec(parseSpec(yaml, 'yaml'));
  }

  static fromJSON(json: string | object): AgentSpec {
    if (typeof json === 'object') {
      return new AgentSpec(json as AgentSpecFile);
    }
    return new AgentSpec(parseSpec(json, 'json'));
  }

  static async fromFile(path: string): Promise<AgentSpec> {
    const content = fs.readFileSync(path, 'utf-8');
    return new AgentSpec(parseSpec(content));
  }

  static create(name: string, description?: string): AgentSpec {
    const now = getCurrentTimestamp();
    return new AgentSpec({
      version: '0.1.0',
      agent: {
        id: generateId(),
        name,
        description,
        createdAt: now,
        updatedAt: now,
      },
      capabilities: [],
      boundaries: [],
    });
  }

  getSpec(): AgentSpecFile {
    return this.spec;
  }

  getCapabilities(): Capability[] {
    return this.spec.capabilities || [];
  }

  getBoundaries(): Boundary[] {
    return this.spec.boundaries || [];
  }

  getObligations(): Obligation[] {
    return this.spec.obligations || [];
  }

  getEscalations(): EscalationRule[] {
    return this.spec.escalationRules || [];
  }

  addCapability(capability: Capability): void {
    if (!this.spec.capabilities) this.spec.capabilities = [];
    this.spec.capabilities.push(capability);
  }

  removeCapability(id: string): void {
    this.spec.capabilities = (this.spec.capabilities || []).filter(
      (c) => c.id !== id
    );
  }

  addBoundary(boundary: Boundary): void {
    if (!this.spec.boundaries) this.spec.boundaries = [];
    this.spec.boundaries.push(boundary);
  }

  removeBoundary(id: string): void {
    this.spec.boundaries = (this.spec.boundaries || []).filter(
      (b) => b.id !== id
    );
  }

  canDo(action: string, context?: Record<string, unknown>) {
    const cap = this.spec.capabilities?.find((c) => c.category === action || c.id === action);
    if (!cap || !cap.enabled) {
      return {
        allowed: false,
        reason: cap ? 'Capability is disabled' : 'No matching capability found',
        requiresApproval: false,
        rateLimited: false,
      };
    }
    if (cap.conditions && context) {
      const condMet = evaluateCondition(cap.conditions, context);
      if (!condMet) {
        return {
          allowed: false,
          capability: cap,
          reason: 'Conditions not met',
          requiresApproval: false,
          rateLimited: false,
        };
      }
    }
    return {
      allowed: true,
      capability: cap,
      reason: 'Action is permitted',
      requiresApproval: !!cap.requiresApproval,
      approvalFrom: cap.approvalFrom,
      rateLimited: false,
    };
  }

  validate(): ValidationResult {
    return validateSpec(this.spec);
  }

  lint(): LintResult {
    return lintSpec(this.spec);
  }

  diff(other: AgentSpec) {
    return diffSpecs(this.spec, other.spec);
  }

  toYAML(): string {
    return serializeSpec(this.spec, { format: 'yaml' });
  }

  toJSON(): object {
    return JSON.parse(JSON.stringify(this.spec));
  }

  toJSONString(pretty?: boolean): string {
    return pretty ? JSON.stringify(this.spec, null, 2) : JSON.stringify(this.spec);
  }
}
