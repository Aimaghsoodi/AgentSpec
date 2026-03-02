/**
 * Tests for linter module
 */

import { describe, it, expect } from 'vitest';
import { lintSpec, lintSecurity, lintPerformance, lintDocumentation } from '../src/linter';
import type { AgentSpecFile } from '../src/types';

describe('Linter', () => {
  const validSpec: AgentSpecFile = {
    version: '1.0.0',
    agent: {
      id: 'test_agent',
      name: 'Test Agent',
      description: 'A test agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    capabilities: [
      {
        id: 'cap_read',
        name: 'Read Files',
        description: 'Read files from disk',
        category: 'read',
        enabled: true,
        riskLevel: 'low',
      },
    ],
    boundaries: [
      {
        id: 'bound_test',
        name: 'Test Boundary',
        type: 'access_control',
        enabled: true,
        condition: { type: 'field', field: 'test' },
        actions: [],
        priority: 0,
        enforcement: 'block',
      },
    ],
  };

  describe('lintSpec', () => {
    it('should accept valid spec', () => {
      const result = lintSpec(validSpec);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should catch missing version', () => {
      const spec = { ...validSpec, version: undefined };

      const result = lintSpec(spec as any);

      expect(result.errors.some((e) => e.code === 'MISSING_VERSION')).toBe(true);
    });

    it('should catch missing agent', () => {
      const spec = { ...validSpec, agent: undefined };

      const result = lintSpec(spec as any);

      expect(result.errors.some((e) => e.code === 'MISSING_AGENT')).toBe(true);
    });

    it('should warn about no capabilities', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        capabilities: [],
      };

      const result = lintSpec(spec);

      expect(
        result.errors.some((e) => e.code === 'NO_CAPABILITIES')
      ).toBe(true);
    });

    it('should warn about no boundaries', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        boundaries: [],
      };

      const result = lintSpec(spec);

      expect(
        result.errors.some((e) => e.code === 'NO_BOUNDARIES')
      ).toBe(true);
    });

    it('should catch duplicate IDs', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        capabilities: [
          {
            id: 'dup_id',
            name: 'Cap 1',
            category: 'read',
            enabled: true,
            riskLevel: 'low',
          },
          {
            id: 'dup_id',
            name: 'Cap 2',
            category: 'write',
            enabled: true,
            riskLevel: 'medium',
          },
        ],
      };

      const result = lintSpec(spec);

      expect(
        result.errors.some((e) => e.code === 'DUPLICATE_ID')
      ).toBe(true);
    });

    it('should warn about high-risk capabilities without boundaries', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        capabilities: [
          {
            id: 'cap_critical',
            name: 'Critical Op',
            category: 'execute',
            enabled: true,
            riskLevel: 'critical',
          },
        ],
      };

      const result = lintSpec(spec);

      expect(
        result.errors.some(
          (e) => e.code === 'HIGH_RISK_NO_BOUNDARY'
        )
      ).toBe(true);
    });

    it('should check timestamps', () => {
      const spec = {
        ...validSpec,
        agent: {
          ...validSpec.agent,
          createdAt: 'invalid-date',
        },
      };

      const result = lintSpec(spec as any);

      expect(
        result.errors.some((e) => e.code === 'INVALID_DATE_FORMAT')
      ).toBe(true);
    });
  });

  describe('lintSecurity', () => {
    it('should warn about critical capabilities', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        capabilities: [
          {
            id: 'cap_critical',
            name: 'Critical Op',
            category: 'execute',
            enabled: true,
            riskLevel: 'critical',
          },
        ],
      };

      const errors = lintSecurity(spec);

      expect(
        errors.some((e) => e.code === 'CRITICAL_CAPABILITY')
      ).toBe(true);
    });

    it('should warn about disabled audit', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        audit: { enabled: false, logLevel: 'none', format: 'json' },
      };

      const errors = lintSecurity(spec);

      expect(errors.some((e) => e.code === 'AUDIT_DISABLED')).toBe(true);
    });

    it('should not warn with enabled audit', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        audit: { enabled: true, logLevel: 'all', format: 'json' },
      };

      const errors = lintSecurity(spec);

      expect(errors.some((e) => e.code === 'AUDIT_DISABLED')).toBe(false);
    });
  });

  describe('lintPerformance', () => {
    it('should warn about many boundaries', () => {
      const boundaries = Array.from({ length: 60 }, (_, i) => ({
        id: `bound_${i}`,
        name: `Boundary ${i}`,
        type: 'access_control' as const,
        enabled: true,
        condition: { type: 'field' as const, field: 'test' },
        actions: [],
        priority: 0,
        enforcement: 'block' as const,
      }));

      const spec: AgentSpecFile = {
        ...validSpec,
        boundaries,
      };

      const errors = lintPerformance(spec);

      expect(
        errors.some((e) => e.code === 'TOO_MANY_BOUNDARIES')
      ).toBe(true);
    });

    it('should warn about many capabilities', () => {
      const capabilities = Array.from({ length: 110 }, (_, i) => ({
        id: `cap_${i}`,
        name: `Cap ${i}`,
        category: 'read' as const,
        enabled: true,
        riskLevel: 'low' as const,
      }));

      const spec: AgentSpecFile = {
        ...validSpec,
        capabilities,
      };

      const errors = lintPerformance(spec);

      expect(
        errors.some((e) => e.code === 'TOO_MANY_CAPABILITIES')
      ).toBe(true);
    });
  });

  describe('lintDocumentation', () => {
    it('should warn about missing capability descriptions', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        capabilities: [
          {
            id: 'cap_no_desc',
            name: 'Undocumented',
            category: 'read',
            enabled: true,
            riskLevel: 'low',
          },
        ],
      };

      const errors = lintDocumentation(spec);

      expect(
        errors.some((e) => e.code === 'MISSING_DESCRIPTION')
      ).toBe(true);
    });

    it('should warn about missing agent description', () => {
      const spec: AgentSpecFile = {
        ...validSpec,
        agent: {
          ...validSpec.agent,
          description: undefined,
        },
      };

      const errors = lintDocumentation(spec);

      expect(
        errors.some((e) => e.code === 'MISSING_DESCRIPTION')
      ).toBe(true);
    });
  });
});
