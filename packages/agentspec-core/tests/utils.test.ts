/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  getCurrentTimestamp,
  deepClone,
  groupBy,
  indexBy,
  findDuplicates,
  capitalize,
  toKebabCase,
  toSnakeCase,
  toCamelCase,
  truncate,
  isEmpty,
  compact,
  deepEqual,
  pick,
  omit,
} from '../src/utils';

describe('Utilities', () => {
  describe('ID generation', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid ID format', () => {
      const id = generateId();

      expect(id.length).toBeGreaterThan(0);
      expect(typeof id).toBe('string');
    });
  });

  describe('Timestamps', () => {
    it('should generate ISO timestamp', () => {
      const timestamp = getCurrentTimestamp();

      expect(timestamp).toBeTruthy();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should generate valid dates', () => {
      const timestamp = getCurrentTimestamp();
      const date = new Date(timestamp);

      expect(date.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    });
  });

  describe('deepClone', () => {
    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });
  });

  describe('groupBy', () => {
    it('should group array items', () => {
      const items = [
        { id: 1, type: 'A' },
        { id: 2, type: 'B' },
        { id: 3, type: 'A' },
      ];

      const grouped = groupBy(items, 'type');

      expect(grouped.A.length).toBe(2);
      expect(grouped.B.length).toBe(1);
    });

    it('should handle empty arrays', () => {
      const grouped = groupBy([], 'type');

      expect(grouped).toEqual({});
    });
  });

  describe('indexBy', () => {
    it('should index array items', () => {
      const items = [
        { id: 'a', name: 'Alice' },
        { id: 'b', name: 'Bob' },
      ];

      const indexed = indexBy(items, 'id');

      expect(indexed.a.name).toBe('Alice');
      expect(indexed.b.name).toBe('Bob');
    });
  });

  describe('findDuplicates', () => {
    it('should find duplicate items', () => {
      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
      ];

      const duplicates = findDuplicates(items, 'id');

      expect(duplicates.length).toBe(1);
      expect(duplicates[0].name).toBe('C');
    });

    it('should handle no duplicates', () => {
      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];

      const duplicates = findDuplicates(items, 'id');

      expect(duplicates.length).toBe(0);
    });
  });

  describe('String utilities', () => {
    it('should capitalize', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    it('should convert to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('hello_world')).toBe('hello-world');
      expect(toKebabCase('hello world')).toBe('hello-world');
    });

    it('should convert to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
      expect(toSnakeCase('hello-world')).toBe('hello_world');
    });

    it('should convert to camelCase', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('hello world')).toBe('helloWorld');
    });

    it('should truncate strings', () => {
      const text = 'This is a long string';
      const truncated = truncate(text, 10);

      expect(truncated.length).toBeLessThanOrEqual(10);
      expect(truncated).toContain('...');
    });

    it('should not truncate short strings', () => {
      const text = 'Short';
      const truncated = truncate(text, 10);

      expect(truncated).toBe('Short');
    });
  });

  describe('Object utilities', () => {
    it('should pick fields', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const picked = pick(obj, ['a', 'c']);

      expect(picked.a).toBe(1);
      expect(picked.c).toBe(3);
      expect('b' in picked).toBe(false);
    });

    it('should omit fields', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const omitted = omit(obj, ['b']);

      expect(omitted.a).toBe(1);
      expect(omitted.c).toBe(3);
      expect('b' in omitted).toBe(false);
    });

    it('should check equality', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual([1, 2], [1, 2])).toBe(true);
    });

    it('should check if empty', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty([1])).toBe(false);
    });

    it('should compact objects', () => {
      const obj = { a: 1, b: undefined, c: '', d: null, e: 'test' };
      const compacted = compact(obj);

      expect(compacted.a).toBe(1);
      expect(compacted.e).toBe('test');
      expect('b' in compacted).toBe(false);
      expect('c' in compacted).toBe(false);
      expect('d' in compacted).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null in deepClone', () => {
      const cloned = deepClone(null);
      expect(cloned).toBe(null);
    });

    it('should handle circular references gracefully', () => {
      const obj: any = { a: 1 };
      obj.self = obj;

      expect(() => deepClone(obj)).toThrow();
    });
  });
});
