/**
 * Tests for validation module
 */

import { describe, it, expect } from 'vitest';
import {
  validateSpec,
  validateAgent,
  validateCapability,
  validateBoundary,
  isValidDuration,
  isValidCron,
  isValidEmail,
  isValidUrl,
  isValidRegex,
} from '../src/validation';
import type { AgentSpecFile, AgentMetadata } from '../src/types';

describe('Validation', () => {
  describe('validateAgent', () => {
    it('should validate complete agent', () => {
      const agent: AgentMetadata = {
        id: 'test_agent',
        name: 'Test Agent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const errors = validateAgent(agent);

      expect(errors.length).toBe(0);
    });

    it('should catch missing id', () => {
      const agent = {
        name: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const errors = validateAgent(agent);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].code).toBe('MISSING_REQUIRED_FIELD');
    });

    it('should catch missing name', () => {
      const agent = {
        id: 'test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const errors = validateAgent(agent);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should catch invalid id format', () => {
      const agent: AgentMetadata = {
        id: 'test@#$%',
        name: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const errors = validateAgent(agent);

      expect(errors.some((e) => e.code === 'INVALID_FORMAT')).toBe(true);
    });

    it('should catch invalid timestamps', () => {
      const agent = {
        id: 'test',
        name: 'Test',
        createdAt: 'invalid-date',
        updatedAt: new Date().toISOString(),
      };

      const errors = validateAgent(agent);

      expect(errors.some((e) => e.code === 'INVALID_DATE_FORMAT')).toBe(true);
    });
  });

  describe('validateCapability', () => {
    it('should validate complete capability', () => {
      const cap = {
        id: 'cap_test',
        name: 'Test',
        category: 'read',
        enabled: true,
        riskLevel: 'low',
      };

      const errors = validateCapability(cap);

      expect(errors.length).toBe(0);
    });

    it('should catch missing required fields', () => {
      const cap = {
        id: 'cap_test',
      };

      const errors = validateCapability(cap);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate risk levels', () => {
      const validLevels = ['critical', 'high', 'medium', 'low', 'minimal'];

      for (const level of validLevels) {
        const cap = {
          id: 'cap_test',
          name: 'Test',
          category: 'read',
          enabled: true,
          riskLevel: level,
        };

        const errors = validateCapability(cap);

        expect(errors.filter((e) => e.code === 'INVALID_ENUM_VALUE').length).toBe(0);
      }
    });

    it('should catch invalid risk level', () => {
      const cap = {
        id: 'cap_test',
        name: 'Test',
        category: 'read',
        enabled: true,
        riskLevel: 'invalid',
      };

      const errors = validateCapability(cap);

      expect(errors.some((e) => e.code === 'INVALID_ENUM_VALUE')).toBe(true);
    });
  });

  describe('validateBoundary', () => {
    it('should validate complete boundary', () => {
      const bound = {
        id: 'bound_test',
        name: 'Test',
        type: 'access_control',
        enabled: true,
        condition: { type: 'field', field: 'test' },
        actions: [],
        priority: 0,
        enforcement: 'block',
      };

      const errors = validateBoundary(bound);

      expect(errors.length).toBe(0);
    });

    it('should catch missing required fields', () => {
      const bound = {
        id: 'bound_test',
      };

      const errors = validateBoundary(bound);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate enforcement mode', () => {
      const modes = ['block', 'warn', 'log', 'escalate'];

      for (const mode of modes) {
        const bound = {
          id: 'bound_test',
          name: 'Test',
          type: 'access_control',
          enabled: true,
          condition: { type: 'field', field: 'test' },
          actions: [],
          priority: 0,
          enforcement: mode,
        };

        const errors = validateBoundary(bound);

        expect(errors.filter((e) => e.code === 'INVALID_ENUM_VALUE').length).toBe(0);
      }
    });
  });

  describe('validateSpec', () => {
    it('should validate complete spec', () => {
      const spec: AgentSpecFile = {
        version: '1.0.0',
        agent: {
          id: 'test',
          name: 'Test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        capabilities: [],
        boundaries: [],
      };

      const result = validateSpec(spec);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should catch missing required top-level fields', () => {
      const spec = {
        agent: {
          id: 'test',
          name: 'Test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const result = validateSpec(spec as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Format validators', () => {
    describe('isValidDuration', () => {
      it('should validate ISO 8601 durations', () => {
        expect(isValidDuration('P1Y')).toBe(true);
        expect(isValidDuration('P1M')).toBe(true);
        expect(isValidDuration('P1D')).toBe(true);
        expect(isValidDuration('PT1H')).toBe(true);
        expect(isValidDuration('PT1M')).toBe(true);
        expect(isValidDuration('PT1S')).toBe(true);
        expect(isValidDuration('P1Y2M3DT4H5M6S')).toBe(true);
      });

      it('should reject invalid durations', () => {
        expect(isValidDuration('invalid')).toBe(false);
        expect(isValidDuration('1 hour')).toBe(false);
      });
    });

    describe('isValidCron', () => {
      it('should validate valid cron expressions', () => {
        expect(isValidCron('0 0 * * *')).toBe(true);
        expect(isValidCron('*/5 * * * *')).toBe(true);
        expect(isValidCron('0 12 * * MON')).toBe(true);
      });

      it('should reject invalid cron expressions', () => {
        expect(isValidCron('invalid')).toBe(false);
        expect(isValidCron('0 0')).toBe(false);
      });
    });

    describe('isValidEmail', () => {
      it('should validate email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(isValidEmail('not-an-email')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
      });
    });

    describe('isValidUrl', () => {
      it('should validate URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
        expect(isValidUrl('http://localhost:3000')).toBe(true);
        expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(isValidUrl('not a url')).toBe(false);
        expect(isValidUrl('example.com')).toBe(false);
      });
    });

    describe('isValidRegex', () => {
      it('should validate regex patterns', () => {
        expect(isValidRegex('^test$')).toBe(true);
        expect(isValidRegex('[0-9]+')).toBe(true);
        expect(isValidRegex('(a|b)')).toBe(true);
      });

      it('should reject invalid regex patterns', () => {
        expect(isValidRegex('[invalid(')).toBe(false);
        expect(isValidRegex('(?P<invalid>)')).toBe(false);
      });
    });
  });
});
