import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { displaySuccess, displayError, displayWarning } from '../display';
import { getSpecFile } from '../config';

export const validateCommand = new Command()
  .name('validate')
  .description('Validate an AgentSpec document against schema')
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

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields
      if (!spec.apiVersion) {
        errors.push('Missing required field: apiVersion');
      } else if (spec.apiVersion !== 'agentspec.io/v1') {
        errors.push(`Invalid apiVersion: ${spec.apiVersion}`);
      }

      if (!spec.kind) {
        errors.push('Missing required field: kind');
      } else if (spec.kind !== 'AgentSpec') {
        errors.push(`Invalid kind: ${spec.kind}`);
      }

      if (!spec.metadata) {
        errors.push('Missing required field: metadata');
      } else {
        if (!spec.metadata.name) {
          errors.push('Missing required field: metadata.name');
        } else if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(spec.metadata.name)) {
          errors.push(
            'Invalid metadata.name format (must be DNS subdomain format)'
          );
        }
      }

      if (!spec.spec) {
        errors.push('Missing required field: spec');
      }

      // Validate spec structure
      if (spec.spec) {
        if (spec.spec.capabilities && !Array.isArray(spec.spec.capabilities)) {
          errors.push('capabilities must be an array');
        }
        if (spec.spec.boundaries && !Array.isArray(spec.spec.boundaries)) {
          errors.push('boundaries must be an array');
        }
        if (spec.spec.obligations && !Array.isArray(spec.spec.obligations)) {
          errors.push('obligations must be an array');
        }
        if (spec.spec.verification && !Array.isArray(spec.spec.verification)) {
          errors.push('verification must be an array');
        }

        // Validate capabilities
        if (spec.spec.capabilities) {
          spec.spec.capabilities.forEach((cap: any, idx: number) => {
            if (!cap.name)
              errors.push(`Capability ${idx}: missing required field 'name'`);
            if (!cap.resources || !Array.isArray(cap.resources))
              errors.push(`Capability ${idx}: invalid or missing 'resources'`);
            if (!cap.actions || !Array.isArray(cap.actions))
              errors.push(`Capability ${idx}: invalid or missing 'actions'`);
          });
        }

        // Validate boundaries
        if (spec.spec.boundaries) {
          spec.spec.boundaries.forEach((boundary: any, idx: number) => {
            if (!boundary.name)
              errors.push(`Boundary ${idx}: missing required field 'name'`);
          });
        }

        // Validate obligations
        if (spec.spec.obligations) {
          spec.spec.obligations.forEach((obl: any, idx: number) => {
            if (!obl.name)
              errors.push(`Obligation ${idx}: missing required field 'name'`);
          });
        }
      }

      if (errors.length === 0) {
        displaySuccess(`${specFile} is valid`);
      } else {
        displayError(`${specFile} has validation errors:`);
        errors.forEach((err) => console.log(`  - ${err}`));
        process.exit(1);
      }

      if (warnings.length > 0) {
        displayWarning(`Warnings:`);
        warnings.forEach((warn) => console.log(`  - ${warn}`));
      }
    } catch (error) {
      displayError(`Validation failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });
