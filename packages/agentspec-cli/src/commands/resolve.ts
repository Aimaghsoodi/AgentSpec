import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { displaySuccess, displayError } from '../display';
import { getSpecFile } from '../config';

export const resolveCommand = new Command()
  .name('resolve')
  .description('Resolve spec inheritance and write consolidated spec')
  .argument('[file]', 'Path to spec file')
  .option('--output <file>', 'Output file path')
  .action((file, options) => {
    try {
      const specFile = file || getSpecFile();

      if (!fs.existsSync(specFile)) {
        displayError(`File not found: ${specFile}`);
        process.exit(1);
      }

      const content = fs.readFileSync(specFile, 'utf-8');
      let spec: any;

      if (specFile.endsWith('.yaml') || specFile.endsWith('.yml')) {
        spec = yaml.parse(content);
      } else {
        spec = JSON.parse(content);
      }

      // Resolve inheritance
      const resolved = resolveInheritance(spec, path.dirname(specFile));

      // Write output
      const outputFile =
        options.output || specFile.replace(/\.(yaml|yml|json)$/, '.resolved.yaml');

      let output: string;
      if (outputFile.endsWith('.json')) {
        output = JSON.stringify(resolved, null, 2);
      } else {
        output = yaml.stringify(resolved, {
          indent: 2,
          nullStr: 'null',
        });
      }

      fs.writeFileSync(outputFile, output);
      displaySuccess(`Resolved spec written to ${outputFile}`);
    } catch (error) {
      displayError(`Resolution failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

function resolveInheritance(spec: any, basePath: string): any {
  const resolved: any = JSON.parse(JSON.stringify(spec)); // Deep clone

  if (!spec.inherits_from || spec.inherits_from.length === 0) {
    return resolved;
  }

  // Process parent specs (depth-first, left-to-right)
  const parents = spec.inherits_from.map((parent: string) => {
    const parentPath = path.join(basePath, parent);
    if (!fs.existsSync(parentPath)) {
      throw new Error(`Parent spec not found: ${parentPath}`);
    }

    const content = fs.readFileSync(parentPath, 'utf-8');
    let parentSpec: any;

    if (parentPath.endsWith('.yaml') || parentPath.endsWith('.yml')) {
      parentSpec = yaml.parse(content);
    } else {
      parentSpec = JSON.parse(content);
    }

    // Recursively resolve parent inheritance
    return resolveInheritance(parentSpec, path.dirname(parentPath));
  });

  // Merge all parents (left to right) then current spec
  const merged = parents.reduce((acc: any, parent: any) => {
    return mergeSpecs(acc, parent);
  }, {});

  return mergeSpecs(merged, spec);
}

function mergeSpecs(parent: any, child: any): any {
  const merged = JSON.parse(JSON.stringify(parent)); // Deep clone parent

  // Merge metadata (child overrides parent)
  merged.metadata = {
    ...parent.metadata,
    ...child.metadata,
  };

  // Merge spec
  if (child.spec) {
    merged.spec = merged.spec || {};

    // Merge arrays by combining (avoiding duplicates by name)
    if (child.spec.capabilities) {
      const parentCaps = merged.spec.capabilities || [];
      const childCaps = child.spec.capabilities;
      const capMap = new Map();

      parentCaps.forEach((cap: any) => capMap.set(cap.name, cap));
      childCaps.forEach((cap: any) => capMap.set(cap.name, cap));

      merged.spec.capabilities = Array.from(capMap.values());
    }

    if (child.spec.boundaries) {
      const parentBounds = merged.spec.boundaries || [];
      const childBounds = child.spec.boundaries;
      const boundMap = new Map();

      parentBounds.forEach((b: any) => boundMap.set(b.name, b));
      childBounds.forEach((b: any) => boundMap.set(b.name, b));

      merged.spec.boundaries = Array.from(boundMap.values());
    }

    if (child.spec.obligations) {
      const parentObls = merged.spec.obligations || [];
      const childObls = child.spec.obligations;
      const oblMap = new Map();

      parentObls.forEach((o: any) => oblMap.set(o.name, o));
      childObls.forEach((o: any) => oblMap.set(o.name, o));

      merged.spec.obligations = Array.from(oblMap.values());
    }

    if (child.spec.verification) {
      const parentVer = merged.spec.verification || [];
      const childVer = child.spec.verification;
      const verMap = new Map();

      parentVer.forEach((v: any) => verMap.set(v.name, v));
      childVer.forEach((v: any) => verMap.set(v.name, v));

      merged.spec.verification = Array.from(verMap.values());
    }
  }

  // Remove inheritance directive
  delete merged.inherits_from;

  return merged;
}
