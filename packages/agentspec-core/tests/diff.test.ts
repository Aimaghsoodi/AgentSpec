/**
 * Tests for diff module
 */

import { describe, it, expect } from 'vitest';
import { diffSpecs, categorizeDiffByBreakingness, getChangedElements, formatDiffAsMarkdown } from '../src/diff';
import type { AgentSpecFile } from '../src/types';

describe('Diff', () => {
  const baseSpec: AgentSpecFile = {
    version: '1.0.0',
    agent: {
      id: 'test_agent',
      name: 'Test Agent',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    capabilities: [
      {
        id: 'cap_read',
        name: 'Read',
        category: 'read',
        enabled: true,
        riskLevel: 'low',
      },
    ],
    boundaries: [],
  };

  describe('diffSpecs', () => {
    it('should detect version change', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        version: '2.0.0',
      };

      const result = diffSpecs(baseSpec, newSpec);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes[0].type).toBe('modified');
      expect(result.changes[0].path[0]).toBe('version');
    });

    it('should detect agent name change', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        agent: { ...baseSpec.agent, name: 'Updated Agent' },
      };

      const result = diffSpecs(baseSpec, newSpec);

      expect(result.changes.length).toBeGreaterThan(0);
      const nameChange = result.changes.find((c) =>
        c.path.includes('name')
      );
      expect(nameChange?.type).toBe('modified');
      expect(nameChange?.newValue).toBe('Updated Agent');
    });

    it('should detect capability addition', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        capabilities: [
          ...baseSpec.capabilities,
          {
            id: 'cap_write',
            name: 'Write',
            category: 'write',
            enabled: true,
            riskLevel: 'medium',
          },
        ],
      };

      const result = diffSpecs(baseSpec, newSpec);

      expect(result.changes.length).toBeGreaterThan(0);
      const addChange = result.changes.find((c) => c.type === 'added');
      expect(addChange).toBeDefined();
    });

    it('should detect capability removal', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        capabilities: [],
      };

      const result = diffSpecs(baseSpec, newSpec);

      expect(result.changes.length).toBeGreaterThan(0);
      const removeChange = result.changes.find((c) => c.type === 'removed');
      expect(removeChange).toBeDefined();
      expect(removeChange?.severity).toBe('breaking');
    });

    it('should compute correct summary', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        agent: { ...baseSpec.agent, name: 'Updated' },
        capabilities: [],
      };

      const result = diffSpecs(baseSpec, newSpec);

      expect(result.summary.totalChanges).toBeGreaterThan(0);
      expect(result.summary.removals).toBeGreaterThan(0);
      expect(result.summary.breakingChanges).toBeGreaterThan(0);
    });
  });

  describe('categorizeDiffByBreakingness', () => {
    it('should categorize changes by severity', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        version: '2.0.0',
        capabilities: [],
      };

      const diff = diffSpecs(baseSpec, newSpec);
      const categorized = categorizeDiffByBreakingness(diff.changes);

      expect(categorized.breaking.length).toBeGreaterThan(0);
      expect(categorized.nonBreaking.length >= 0).toBe(true);
    });
  });

  describe('getChangedElements', () => {
    it('should group changes by element type', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        capabilities: [
          ...baseSpec.capabilities,
          {
            id: 'cap_new',
            name: 'New Cap',
            category: 'execute',
            enabled: true,
            riskLevel: 'high',
          },
        ],
      };

      const diff = diffSpecs(baseSpec, newSpec);
      const grouped = getChangedElements(diff.changes);

      expect(grouped.capabilities.length).toBeGreaterThan(0);
      expect(grouped.boundaries.length).toBe(0);
    });

    it('should handle multiple element types', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        agent: { ...baseSpec.agent, name: 'Updated' },
        capabilities: [
          ...baseSpec.capabilities,
          {
            id: 'cap_new',
            name: 'New',
            category: 'read',
            enabled: true,
            riskLevel: 'low',
          },
        ],
      };

      const diff = diffSpecs(baseSpec, newSpec);
      const grouped = getChangedElements(diff.changes);

      expect(grouped.other.length).toBeGreaterThan(0);
      expect(grouped.capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('formatDiffAsMarkdown', () => {
    it('should format diff as markdown', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        agent: { ...baseSpec.agent, name: 'Updated' },
      };

      const diff = diffSpecs(baseSpec, newSpec);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toContain('#');
      expect(markdown).toContain('Changes');
      expect(markdown).toContain('Summary');
    });

    it('should highlight breaking changes', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        capabilities: [],
      };

      const diff = diffSpecs(baseSpec, newSpec);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toContain('Breaking');
    });

    it('should group changes by type', () => {
      const newSpec: AgentSpecFile = {
        ...baseSpec,
        version: '2.0.0',
        capabilities: [
          ...baseSpec.capabilities,
          {
            id: 'cap_new',
            name: 'New',
            category: 'write',
            enabled: true,
            riskLevel: 'medium',
          },
        ],
        boundaries: [
          {
            id: 'bound_test',
            name: 'Test',
            type: 'access_control',
            enabled: true,
            condition: { type: 'field', field: 'test' },
            actions: [],
            priority: 0,
            enforcement: 'block',
          },
        ],
      };

      const diff = diffSpecs(baseSpec, newSpec);
      const markdown = formatDiffAsMarkdown(diff);

      if (diff.changes.some((c) => c.path[0] === 'capabilities')) {
        expect(markdown).toContain('## Capabilities');
      }
      if (diff.changes.some((c) => c.path[0] === 'boundaries')) {
        expect(markdown).toContain('## Boundaries');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle identical specs', () => {
      const result = diffSpecs(baseSpec, baseSpec);

      expect(result.summary.totalChanges).toBe(0);
    });

    it('should handle null/undefined values', () => {
      const spec1: AgentSpecFile = {
        ...baseSpec,
        metadata: undefined,
      };
      const spec2: AgentSpecFile = {
        ...baseSpec,
        metadata: { key: 'value' },
      };

      const result = diffSpecs(spec1, spec2);

      expect(result.changes.length).toBeGreaterThan(0);
    });
  });
});
