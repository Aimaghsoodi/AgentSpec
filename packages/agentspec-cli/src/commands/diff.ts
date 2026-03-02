import { Command } from 'commander';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { displaySuccess, displayError, displayDiff } from '../display';

interface DiffResult {
  field: string;
  oldValue: any;
  newValue: any;
}

export const diffCommand = new Command()
  .name('diff')
  .description('Compare two AgentSpec documents')
  .argument('<file1>', 'First spec file')
  .argument('<file2>', 'Second spec file')
  .action((file1, file2) => {
    try {
      if (!fs.existsSync(file1)) {
        displayError(`File not found: ${file1}`);
        process.exit(1);
      }

      if (!fs.existsSync(file2)) {
        displayError(`File not found: ${file2}`);
        process.exit(1);
      }

      const spec1 = loadSpec(file1);
      const spec2 = loadSpec(file2);

      const diffs = findDifferences(spec1, spec2);

      if (diffs.length === 0) {
        displaySuccess('No differences found');
      } else {
        console.log(`Found ${diffs.length} difference(s):\n`);
        diffs.forEach((diff) => {
          displayDiff(diff.field, diff.oldValue, diff.newValue);
        });
        console.log();
      }
    } catch (error) {
      displayError(`Diff failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

function loadSpec(file: string): any {
  const content = fs.readFileSync(file, 'utf-8');
  if (file.endsWith('.yaml') || file.endsWith('.yml')) {
    return yaml.parse(content);
  }
  return JSON.parse(content);
}

function findDifferences(spec1: any, spec2: any): DiffResult[] {
  const diffs: DiffResult[] = [];

  // Compare metadata
  if (spec1.metadata?.name !== spec2.metadata?.name) {
    diffs.push({
      field: 'metadata.name',
      oldValue: spec1.metadata?.name,
      newValue: spec2.metadata?.name,
    });
  }

  if (spec1.metadata?.version !== spec2.metadata?.version) {
    diffs.push({
      field: 'metadata.version',
      oldValue: spec1.metadata?.version,
      newValue: spec2.metadata?.version,
    });
  }

  // Compare capabilities
  const caps1 = spec1.spec?.capabilities || [];
  const caps2 = spec2.spec?.capabilities || [];

  if (caps1.length !== caps2.length) {
    diffs.push({
      field: 'spec.capabilities.length',
      oldValue: caps1.length,
      newValue: caps2.length,
    });
  }

  const capNames1 = new Set(caps1.map((c: any) => c.name));
  const capNames2 = new Set(caps2.map((c: any) => c.name));

  // Find added/removed capabilities
  capNames2.forEach((name) => {
    if (!capNames1.has(name)) {
      diffs.push({
        field: `spec.capabilities.${name}`,
        oldValue: 'not present',
        newValue: 'added',
      });
    }
  });

  capNames1.forEach((name) => {
    if (!capNames2.has(name)) {
      diffs.push({
        field: `spec.capabilities.${name}`,
        oldValue: 'present',
        newValue: 'removed',
      });
    }
  });

  // Compare boundaries
  const bounds1 = spec1.spec?.boundaries || [];
  const bounds2 = spec2.spec?.boundaries || [];

  if (bounds1.length !== bounds2.length) {
    diffs.push({
      field: 'spec.boundaries.length',
      oldValue: bounds1.length,
      newValue: bounds2.length,
    });
  }

  // Compare obligations
  const obls1 = spec1.spec?.obligations || [];
  const obls2 = spec2.spec?.obligations || [];

  if (obls1.length !== obls2.length) {
    diffs.push({
      field: 'spec.obligations.length',
      oldValue: obls1.length,
      newValue: obls2.length,
    });
  }

  return diffs;
}
