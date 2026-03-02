/**
 * Tests for condition evaluation
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateCondition,
  compareValues,
  getValueFromPath,
  buildCondition,
  buildLogicalCondition,
  buildAnd,
  buildOr,
  buildRegexCondition,
  simplifyCondition,
  conditionToString,
} from '../src/condition';
import type { ConditionExpression } from '../src/types';

describe('Condition Evaluation', () => {
  describe('evaluateCondition', () => {
    it('should evaluate field condition', () => {
      const condition: ConditionExpression = {
        type: 'field',
        field: 'enabled',
      };

      expect(evaluateCondition(condition, { enabled: true })).toBe(true);
      expect(evaluateCondition(condition, { enabled: false })).toBe(false);
      expect(evaluateCondition(condition, { enabled: undefined })).toBe(false);
    });

    it('should evaluate comparison condition', () => {
      const condition: ConditionExpression = {
        type: 'comparison',
        field: 'age',
        comparison: 'greater_than',
        value: 18,
      };

      expect(evaluateCondition(condition, { age: 25 })).toBe(true);
      expect(evaluateCondition(condition, { age: 18 })).toBe(false);
      expect(evaluateCondition(condition, { age: 10 })).toBe(false);
    });

    it('should evaluate logical AND condition', () => {
      const condition: ConditionExpression = {
        type: 'logical',
        operator: 'and',
        conditions: [
          { type: 'field', field: 'a' },
          { type: 'field', field: 'b' },
        ],
      };

      expect(
        evaluateCondition(condition, { a: true, b: true })
      ).toBe(true);
      expect(
        evaluateCondition(condition, { a: true, b: false })
      ).toBe(false);
      expect(
        evaluateCondition(condition, { a: false, b: true })
      ).toBe(false);
    });

    it('should evaluate logical OR condition', () => {
      const condition: ConditionExpression = {
        type: 'logical',
        operator: 'or',
        conditions: [
          { type: 'field', field: 'a' },
          { type: 'field', field: 'b' },
        ],
      };

      expect(
        evaluateCondition(condition, { a: true, b: false })
      ).toBe(true);
      expect(
        evaluateCondition(condition, { a: false, b: true })
      ).toBe(true);
      expect(
        evaluateCondition(condition, { a: false, b: false })
      ).toBe(false);
    });

    it('should evaluate regex condition', () => {
      const condition: ConditionExpression = {
        type: 'regex',
        field: 'email',
        value: '^[^@]+@[^@]+$',
      };

      expect(
        evaluateCondition(condition, { email: 'test@example.com' })
      ).toBe(true);
      expect(
        evaluateCondition(condition, { email: 'invalid-email' })
      ).toBe(false);
    });

    it('should evaluate custom condition', () => {
      const condition: ConditionExpression = {
        type: 'custom',
        custom: 'context.value > 100',
      };

      expect(evaluateCondition(condition, { value: 150 })).toBe(true);
      expect(evaluateCondition(condition, { value: 50 })).toBe(false);
    });

    it('should apply negation', () => {
      const condition: ConditionExpression = {
        type: 'field',
        field: 'disabled',
        negate: true,
      };

      expect(evaluateCondition(condition, { disabled: false })).toBe(true);
      expect(evaluateCondition(condition, { disabled: true })).toBe(false);
    });
  });

  describe('compareValues', () => {
    it('should compare with equals', () => {
      expect(compareValues(5, 5, 'equals')).toBe(true);
      expect(compareValues(5, 6, 'equals')).toBe(false);
    });

    it('should compare with not_equals', () => {
      expect(compareValues(5, 6, 'not_equals')).toBe(true);
      expect(compareValues(5, 5, 'not_equals')).toBe(false);
    });

    it('should compare with greater_than', () => {
      expect(compareValues(10, 5, 'greater_than')).toBe(true);
      expect(compareValues(5, 10, 'greater_than')).toBe(false);
    });

    it('should compare with less_than', () => {
      expect(compareValues(5, 10, 'less_than')).toBe(true);
      expect(compareValues(10, 5, 'less_than')).toBe(false);
    });

    it('should compare with contains', () => {
      expect(compareValues('hello world', 'world', 'contains')).toBe(true);
      expect(compareValues('hello world', 'xyz', 'contains')).toBe(false);
      expect(compareValues([1, 2, 3], 2, 'contains')).toBe(true);
    });

    it('should compare with in', () => {
      expect(compareValues(2, [1, 2, 3], 'in')).toBe(true);
      expect(compareValues(5, [1, 2, 3], 'in')).toBe(false);
    });

    it('should compare with matches (regex)', () => {
      expect(
        compareValues('hello123', '[0-9]+', 'matches')
      ).toBe(true);
      expect(
        compareValues('hello', '[0-9]+', 'matches')
      ).toBe(false);
    });
  });

  describe('getValueFromPath', () => {
    it('should get simple value', () => {
      const obj = { name: 'test' };
      expect(getValueFromPath(obj, 'name')).toBe('test');
    });

    it('should get nested value', () => {
      const obj = { user: { name: 'test' } };
      expect(getValueFromPath(obj, 'user.name')).toBe('test');
    });

    it('should return undefined for missing path', () => {
      const obj = { name: 'test' };
      expect(getValueFromPath(obj, 'missing')).toBeUndefined();
    });

    it('should handle deep nesting', () => {
      const obj = { a: { b: { c: { d: 'value' } } } };
      expect(getValueFromPath(obj, 'a.b.c.d')).toBe('value');
    });
  });

  describe('Builders', () => {
    it('should build condition', () => {
      const cond = buildCondition('age', 18, 'greater_or_equal');

      expect(cond.type).toBe('comparison');
      expect(cond.field).toBe('age');
      expect(cond.value).toBe(18);
    });

    it('should build logical condition', () => {
      const cond = buildLogicalCondition(
        [
          { type: 'field', field: 'a' },
          { type: 'field', field: 'b' },
        ],
        'and'
      );

      expect(cond.type).toBe('logical');
      expect(cond.operator).toBe('and');
      expect(cond.conditions?.length).toBe(2);
    });

    it('should build AND condition', () => {
      const cond = buildAnd(
        { type: 'field', field: 'a' },
        { type: 'field', field: 'b' }
      );

      expect(cond.operator).toBe('and');
    });

    it('should build OR condition', () => {
      const cond = buildOr(
        { type: 'field', field: 'a' },
        { type: 'field', field: 'b' }
      );

      expect(cond.operator).toBe('or');
    });

    it('should build regex condition', () => {
      const cond = buildRegexCondition('email', '^.+@.+$');

      expect(cond.type).toBe('regex');
      expect(cond.field).toBe('email');
      expect(cond.value).toBe('^.+@.+$');
    });
  });

  describe('Simplification', () => {
    it('should unwrap single-condition logical expression', () => {
      const cond = simplifyCondition({
        type: 'logical',
        operator: 'and',
        conditions: [{ type: 'field', field: 'test' }],
      });

      expect(cond.type).toBe('field');
      expect(cond.field).toBe('test');
    });

    it('should preserve multi-condition logical expression', () => {
      const original: ConditionExpression = {
        type: 'logical',
        operator: 'and',
        conditions: [
          { type: 'field', field: 'a' },
          { type: 'field', field: 'b' },
        ],
      };

      const simplified = simplifyCondition(original);

      expect(simplified.type).toBe('logical');
      expect(simplified.conditions?.length).toBe(2);
    });
  });

  describe('String conversion', () => {
    it('should convert field condition to string', () => {
      const str = conditionToString({
        type: 'field',
        field: 'enabled',
      });

      expect(str).toContain('enabled');
      expect(str).toContain('truthy');
    });

    it('should convert comparison condition to string', () => {
      const str = conditionToString({
        type: 'comparison',
        field: 'age',
        comparison: 'greater_than',
        value: 18,
      });

      expect(str).toContain('age');
      expect(str).toContain('>');
      expect(str).toContain('18');
    });

    it('should convert logical condition to string', () => {
      const str = conditionToString({
        type: 'logical',
        operator: 'and',
        conditions: [
          { type: 'field', field: 'a' },
          { type: 'field', field: 'b' },
        ],
      });

      expect(str).toContain('AND');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty condition', () => {
      const result = evaluateCondition({} as ConditionExpression, {});
      expect(result).toBe(true);
    });

    it('should handle null context values', () => {
      const condition: ConditionExpression = {
        type: 'field',
        field: 'test',
      };

      const result = evaluateCondition(condition, { test: null });
      expect(result).toBe(false);
    });

    it('should handle array field in comparison', () => {
      const condition: ConditionExpression = {
        type: 'comparison',
        field: 'items',
        comparison: 'contains',
        value: 'test',
      };

      expect(
        evaluateCondition(condition, { items: ['a', 'test', 'b'] })
      ).toBe(true);
    });

    it('should handle invalid regex gracefully', () => {
      const condition: ConditionExpression = {
        type: 'regex',
        field: 'test',
        value: '[invalid(regex',
      };

      expect(evaluateCondition(condition, { test: 'anything' })).toBe(false);
    });

    it('should handle invalid custom expression gracefully', () => {
      const condition: ConditionExpression = {
        type: 'custom',
        custom: 'invalid javascript { [ }',
      };

      expect(evaluateCondition(condition, {})).toBe(false);
    });
  });
});
