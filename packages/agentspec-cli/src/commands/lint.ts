import { Command } from 'commander';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { displaySuccess, displayWarning, displayError } from '../display';
import { getSpecFile } from '../config';

interface LintIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
  path?: string;
}

export const lintCommand = new Command()
  .name('lint')
  .description('Lint an AgentSpec document for best practices')
  .argument('[file]', 'Path to spec file')
  .action((file) => {
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

      const issues: LintIssue[] = [];

      // Check for metadata completeness
      if (spec.metadata) {
        if (!spec.metadata.description) {
          issues.push({
            level: 'warning',
            message: 'Missing description in metadata',
            path: 'metadata.description',
          });
        }
        if (!spec.metadata.author) {
          issues.push({
            level: 'info',
            message: 'Consider adding an author',
            path: 'metadata.author',
          });
        }
      }

      // Check capabilities
      if (spec.spec?.capabilities) {
        const capNames = new Set();
        spec.spec.capabilities.forEach((cap: any, idx: number) => {
          if (capNames.has(cap.name)) {
            issues.push({
              level: 'error',
              message: `Duplicate capability name: ${cap.name}`,
              path: `spec.capabilities[${idx}].name`,
            });
          }
          capNames.add(cap.name);

          if (!cap.description) {
            issues.push({
              level: 'warning',
              message: `Capability '${cap.name}' missing description`,
              path: `spec.capabilities[${idx}].description`,
            });
          }

          if (!cap.timeout && !cap.limit) {
            issues.push({
              level: 'warning',
              message: `Capability '${cap.name}' has no limits`,
              path: `spec.capabilities[${idx}]`,
            });
          }
        });
      }

      // Check boundaries
      if (spec.spec?.boundaries) {
        const boundNames = new Set();
        spec.spec.boundaries.forEach((boundary: any, idx: number) => {
          if (boundNames.has(boundary.name)) {
            issues.push({
              level: 'error',
              message: `Duplicate boundary name: ${boundary.name}`,
              path: `spec.boundaries[${idx}].name`,
            });
          }
          boundNames.add(boundary.name);

          if (
            !boundary.severity ||
            !['low', 'medium', 'high', 'critical'].includes(boundary.severity)
          ) {
            issues.push({
              level: 'warning',
              message: `Boundary '${boundary.name}' has invalid or missing severity`,
              path: `spec.boundaries[${idx}].severity`,
            });
          }

          if (!boundary.description) {
            issues.push({
              level: 'warning',
              message: `Boundary '${boundary.name}' missing description`,
              path: `spec.boundaries[${idx}].description`,
            });
          }
        });
      }

      // Check obligations
      if (spec.spec?.obligations) {
        const oblNames = new Set();
        spec.spec.obligations.forEach((obl: any, idx: number) => {
          if (oblNames.has(obl.name)) {
            issues.push({
              level: 'error',
              message: `Duplicate obligation name: ${obl.name}`,
              path: `spec.obligations[${idx}].name`,
            });
          }
          oblNames.add(obl.name);

          if (!obl.description) {
            issues.push({
              level: 'warning',
              message: `Obligation '${obl.name}' missing description`,
              path: `spec.obligations[${idx}].description`,
            });
          }
        });
      }

      // Check verification coverage
      const capNames = spec.spec?.capabilities?.map((c: any) => c.name) || [];
      if (capNames.length > 0 && (!spec.spec?.verification || spec.spec.verification.length === 0)) {
        issues.push({
          level: 'warning',
          message: `No verification tests defined for ${capNames.length} capability(ies)`,
          path: 'spec.verification',
        });
      }

      // Report results
      if (issues.length === 0) {
        displaySuccess(`${specFile} passes all linting checks`);
      } else {
        const errors = issues.filter((i) => i.level === 'error');
        const warnings = issues.filter((i) => i.level === 'warning');
        const infos = issues.filter((i) => i.level === 'info');

        if (errors.length > 0) {
          displayError(`Found ${errors.length} error(s):`);
          errors.forEach((issue) => {
            console.log(`  ${issue.path}: ${issue.message}`);
          });
        }

        if (warnings.length > 0) {
          displayWarning(`Found ${warnings.length} warning(s):`);
          warnings.forEach((issue) => {
            console.log(`  ${issue.path}: ${issue.message}`);
          });
        }

        if (infos.length > 0) {
          console.log(`Found ${infos.length} info message(s):`);
          infos.forEach((issue) => {
            console.log(`  ${issue.path}: ${issue.message}`);
          });
        }

        if (errors.length > 0) {
          process.exit(1);
        }
      }
    } catch (error) {
      displayError(`Linting failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });
