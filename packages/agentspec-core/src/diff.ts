/**
 * Diff module — compare two AgentSpec files
 */

import type { AgentSpecFile, DiffChange, DiffResult, DiffSummary } from './types';

function diffValues(
  path: string[],
  oldVal: unknown,
  newVal: unknown,
  changes: DiffChange[]
): void {
  if (oldVal === newVal) return;
  if (oldVal === undefined && newVal === undefined) return;

  if (oldVal === undefined || oldVal === null) {
    changes.push({
      type: 'added',
      path,
      newValue: newVal,
      severity: 'non-breaking',
    });
    return;
  }

  if (newVal === undefined || newVal === null) {
    const isBreaking =
      path[0] === 'capabilities' ||
      path[0] === 'boundaries' ||
      path[0] === 'version';
    changes.push({
      type: 'removed',
      path,
      oldValue: oldVal,
      severity: isBreaking ? 'breaking' : 'non-breaking',
    });
    return;
  }

  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    diffArrays(path, oldVal, newVal, changes);
    return;
  }

  if (typeof oldVal === 'object' && typeof newVal === 'object') {
    diffObjects(path, oldVal as Record<string, unknown>, newVal as Record<string, unknown>, changes);
    return;
  }

  if (oldVal !== newVal) {
    changes.push({
      type: 'modified',
      path,
      oldValue: oldVal,
      newValue: newVal,
      severity: 'non-breaking',
    });
  }
}

function diffArrays(
  path: string[],
  oldArr: unknown[],
  newArr: unknown[],
  changes: DiffChange[]
): void {
  // For arrays of objects with 'id', use id-based comparison
  const oldHasIds = oldArr.every(
    (item) => typeof item === 'object' && item !== null && 'id' in item
  );
  const newHasIds = newArr.every(
    (item) => typeof item === 'object' && item !== null && 'id' in item
  );

  if (oldHasIds && newHasIds) {
    const oldMap = new Map(
      oldArr.map((item: any) => [item.id, item])
    );
    const newMap = new Map(
      newArr.map((item: any) => [item.id, item])
    );

    // Removed items
    for (const [id, item] of oldMap) {
      if (!newMap.has(id)) {
        changes.push({
          type: 'removed',
          path: [...path, id],
          oldValue: item,
          severity: 'breaking',
        });
      }
    }

    // Added items
    for (const [id, item] of newMap) {
      if (!oldMap.has(id)) {
        changes.push({
          type: 'added',
          path: [...path, id],
          newValue: item,
          severity: 'non-breaking',
        });
      }
    }

    // Modified items
    for (const [id, oldItem] of oldMap) {
      const newItem = newMap.get(id);
      if (newItem) {
        diffObjects(
          [...path, id],
          oldItem as Record<string, unknown>,
          newItem as Record<string, unknown>,
          changes
        );
      }
    }
  } else {
    // Simple length/content comparison
    if (oldArr.length !== newArr.length || JSON.stringify(oldArr) !== JSON.stringify(newArr)) {
      const isRemoval = newArr.length < oldArr.length;
      changes.push({
        type: 'modified',
        path,
        oldValue: oldArr,
        newValue: newArr,
        severity: isRemoval ? 'breaking' : 'non-breaking',
      });
    }
  }
}

function diffObjects(
  path: string[],
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  changes: DiffChange[]
): void {
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    diffValues([...path, key], oldObj[key], newObj[key], changes);
  }
}

export function diffSpecs(
  source: AgentSpecFile,
  target: AgentSpecFile
): DiffResult {
  const changes: DiffChange[] = [];

  diffValues([], source as any, target as any, changes);

  // Flatten top-level object diff to meaningful changes
  const flatChanges: DiffChange[] = [];
  for (const change of changes) {
    if (change.path.length > 0) {
      flatChanges.push(change);
    }
  }

  const summary: DiffSummary = {
    totalChanges: flatChanges.length,
    additions: flatChanges.filter((c) => c.type === 'added').length,
    removals: flatChanges.filter((c) => c.type === 'removed').length,
    modifications: flatChanges.filter((c) => c.type === 'modified').length,
    breakingChanges: flatChanges.filter((c) => c.severity === 'breaking').length,
    nonBreakingChanges: flatChanges.filter((c) => c.severity === 'non-breaking').length,
  };

  return { changes: flatChanges, summary };
}

export function categorizeDiffByBreakingness(changes: DiffChange[]): {
  breaking: DiffChange[];
  nonBreaking: DiffChange[];
} {
  return {
    breaking: changes.filter((c) => c.severity === 'breaking'),
    nonBreaking: changes.filter((c) => c.severity === 'non-breaking'),
  };
}

export function getChangedElements(changes: DiffChange[]): {
  capabilities: DiffChange[];
  boundaries: DiffChange[];
  obligations: DiffChange[];
  escalations: DiffChange[];
  other: DiffChange[];
} {
  return {
    capabilities: changes.filter((c) => c.path[0] === 'capabilities'),
    boundaries: changes.filter((c) => c.path[0] === 'boundaries'),
    obligations: changes.filter((c) => c.path[0] === 'obligations'),
    escalations: changes.filter((c) => c.path[0] === 'escalationRules' || c.path[0] === 'escalations'),
    other: changes.filter(
      (c) =>
        c.path[0] !== 'capabilities' &&
        c.path[0] !== 'boundaries' &&
        c.path[0] !== 'obligations' &&
        c.path[0] !== 'escalationRules' &&
        c.path[0] !== 'escalations'
    ),
  };
}

export function formatDiffAsMarkdown(diff: DiffResult): string {
  const lines: string[] = [];

  lines.push('# Spec Diff');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total Changes: ${diff.summary.totalChanges}`);
  lines.push(`- Additions: ${diff.summary.additions}`);
  lines.push(`- Removals: ${diff.summary.removals}`);
  lines.push(`- Modifications: ${diff.summary.modifications}`);
  lines.push(`- Breaking Changes: ${diff.summary.breakingChanges}`);
  lines.push('');

  const grouped = getChangedElements(diff.changes);

  if (grouped.capabilities.length > 0) {
    lines.push('## Capabilities');
    lines.push('');
    for (const change of grouped.capabilities) {
      const label = change.severity === 'breaking' ? '[Breaking]' : '';
      lines.push(`- ${change.type}: ${change.path.join('.')} ${label}`);
    }
    lines.push('');
  }

  if (grouped.boundaries.length > 0) {
    lines.push('## Boundaries');
    lines.push('');
    for (const change of grouped.boundaries) {
      const label = change.severity === 'breaking' ? '[Breaking]' : '';
      lines.push(`- ${change.type}: ${change.path.join('.')} ${label}`);
    }
    lines.push('');
  }

  if (grouped.obligations.length > 0) {
    lines.push('## Obligations');
    lines.push('');
    for (const change of grouped.obligations) {
      lines.push(`- ${change.type}: ${change.path.join('.')}`);
    }
    lines.push('');
  }

  if (grouped.other.length > 0) {
    lines.push('## Other Changes');
    lines.push('');
    for (const change of grouped.other) {
      const label = change.severity === 'breaking' ? '[Breaking]' : '';
      lines.push(`- ${change.type}: ${change.path.join('.')} ${label}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
