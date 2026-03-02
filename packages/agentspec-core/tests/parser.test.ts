/**
 * Tests for parser module
 */

import { describe, it, expect } from 'vitest';
import { parseJSON, parseYAML, detectFormat, parseSpec } from '../src/parser';

describe('Parser', () => {
  describe('parseJSON', () => {
    it('should parse valid JSON', () => {
      const json = JSON.stringify({
        version: '1.0.0',
        agent: { id: 'test', name: 'Test', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        capabilities: [],
        boundaries: [],
      });

      const result = parseJSON(json);

      expect(result.version).toBe('1.0.0');
      expect(result.agent.id).toBe('test');
    });

    it('should throw on invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      expect(() => parseJSON(invalidJson)).toThrow();
    });

    it('should parse complex objects', () => {
      const complex = {
        version: '1.0.0',
        agent: {
          id: 'test',
          name: 'Test',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          metadata: { nested: { value: 'test' } },
        },
        capabilities: [{ id: 'cap1', name: 'Cap 1', category: 'read', enabled: true, riskLevel: 'low' }],
        boundaries: [],
      };

      const json = JSON.stringify(complex);
      const result = parseJSON(json);

      expect(result.agent.metadata?.nested?.value).toBe('test');
      expect(result.capabilities[0].name).toBe('Cap 1');
    });
  });

  describe('parseYAML', () => {
    it('should parse simple YAML', () => {
      const yaml = `version: 1.0.0
agent:
  id: test
  name: Test`;

      const result = parseYAML(yaml);

      expect(result.version).toBe('1.0.0');
    });

    it('should skip empty lines and comments', () => {
      const yaml = `# This is a comment
version: 1.0.0

agent:
  id: test`;

      const result = parseYAML(yaml);

      expect(result.version).toBe('1.0.0');
    });
  });

  describe('detectFormat', () => {
    it('should detect JSON', () => {
      const json = '{ "version": "1.0.0" }';
      expect(detectFormat(json)).toBe('json');
    });

    it('should detect JSON array', () => {
      const json = '[1, 2, 3]';
      expect(detectFormat(json)).toBe('json');
    });

    it('should detect XML', () => {
      const xml = '<agentspec version="1.0.0"></agentspec>';
      expect(detectFormat(xml)).toBe('xml');
    });

    it('should detect YAML', () => {
      const yaml = 'version: 1.0.0\nname: test';
      expect(detectFormat(yaml)).toBe('yaml');
    });

    it('should default to JSON', () => {
      const unknown = 'some random text';
      expect(detectFormat(unknown)).toBe('json');
    });
  });

  describe('parseSpec', () => {
    it('should parse JSON spec', () => {
      const json = JSON.stringify({
        version: '1.0.0',
        agent: { id: 'test', name: 'Test', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        capabilities: [],
        boundaries: [],
      });

      const result = parseSpec(json, 'json');

      expect(result.version).toBe('1.0.0');
    });

    it('should auto-detect format', () => {
      const json = JSON.stringify({
        version: '1.0.0',
        agent: { id: 'test', name: 'Test', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
        capabilities: [],
        boundaries: [],
      });

      const result = parseSpec(json);

      expect(result.version).toBe('1.0.0');
    });

    it('should throw on unsupported format', () => {
      expect(() => parseSpec('{}', 'unknown' as any)).toThrow();
    });
  });
});
