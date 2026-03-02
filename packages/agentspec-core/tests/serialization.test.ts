/**
 * Tests for serialization module
 */

import { describe, it, expect } from 'vitest';
import {
  serializeJSON,
  serializeSpec,
  deserializeSpec,
  isJSON,
  isYAML,
  isXML,
} from '../src/serialization';
import type { AgentSpecFile } from '../src/types';

describe('Serialization', () => {
  const validSpec: AgentSpecFile = {
    version: '1.0.0',
    agent: {
      id: 'test_agent',
      name: 'Test Agent',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    capabilities: [],
    boundaries: [],
  };

  describe('serializeJSON', () => {
    it('should serialize spec to compact JSON', () => {
      const json = serializeJSON(validSpec);

      expect(json).toBeTruthy();
      expect(json).not.toContain('\n');
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.0.0');
    });

    it('should serialize spec to pretty JSON', () => {
      const json = serializeJSON(validSpec, true);

      expect(json).toBeTruthy();
      expect(json).toContain('\n');
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('1.0.0');
    });

    it('should exclude undefined fields', () => {
      const json = serializeJSON(validSpec);
      const parsed = JSON.parse(json);

      expect(parsed.metadata).toBeUndefined();
      expect(parsed.obligations).toBeUndefined();
    });
  });

  describe('serializeSpec', () => {
    it('should serialize to JSON', () => {
      const result = serializeSpec(validSpec, { format: 'json' });

      expect(result).toBeTruthy();
      const parsed = JSON.parse(result);
      expect(parsed.version).toBe('1.0.0');
    });

    it('should serialize to YAML', () => {
      const result = serializeSpec(validSpec, { format: 'yaml' });

      expect(result).toBeTruthy();
      expect(result).toContain('version:');
      expect(result).toContain('agent:');
    });

    it('should serialize to XML', () => {
      const result = serializeSpec(validSpec, { format: 'xml' });

      expect(result).toBeTruthy();
      expect(result).toContain('<agentspec>');
      expect(result).toContain('</agentspec>');
    });

    it('should throw on unsupported format', () => {
      expect(() =>
        serializeSpec(validSpec, { format: 'unknown' as any })
      ).toThrow();
    });
  });

  describe('deserializeSpec', () => {
    it('should deserialize from JSON string', () => {
      const json = JSON.stringify(validSpec);
      const result = deserializeSpec(json);

      expect(result.version).toBe('1.0.0');
      expect(result.agent.id).toBe('test_agent');
    });

    it('should deserialize from object', () => {
      const result = deserializeSpec(validSpec);

      expect(result.version).toBe('1.0.0');
    });

    it('should throw on invalid input', () => {
      expect(() => deserializeSpec('not json')).toThrow();
      expect(() => deserializeSpec(null)).toThrow();
    });
  });

  describe('Format detection', () => {
    it('should detect JSON', () => {
      const json = JSON.stringify(validSpec);
      expect(isJSON(json)).toBe(true);
    });

    it('should detect YAML', () => {
      const yaml = `version: 1.0.0
agent:
  id: test`;

      expect(isYAML(yaml)).toBe(true);
    });

    it('should detect XML', () => {
      const xml = '<agentspec><version>1.0.0</version></agentspec>';
      expect(isXML(xml)).toBe(true);
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve data through JSON serialization', () => {
      const json = serializeJSON(validSpec);
      const deserialized = deserializeSpec(json) as AgentSpecFile;

      expect(deserialized.version).toBe(validSpec.version);
      expect(deserialized.agent.id).toBe(validSpec.agent.id);
    });
  });
});
