import { Command } from 'commander';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { displaySuccess, displayError, displayWarning } from '../display';
import { getSpecFile } from '../config';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export const testCommand = new Command()
  .name('test')
  .description('Run verification tests defined in an AgentSpec')
  .argument('[file]', 'Path to spec file')
  .option('--filter <pattern>', 'Filter tests by name pattern')
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

      const tests = spec.spec?.verification || [];
      if (tests.length === 0) {
        displayWarning('No verification tests defined');
        return;
      }

      const results: TestResult[] = [];
      let passed = 0;
      let failed = 0;

      tests.forEach((test: any) => {
        if (options.filter && !test.name.includes(options.filter)) {
          return;
        }

        const result = runTest(test, spec);
        results.push(result);

        if (result.passed) {
          passed++;
          console.log(`✓ ${result.name}`);
        } else {
          failed++;
          displayError(`✗ ${result.name}`);
          if (result.message) {
            console.log(`  ${result.message}`);
          }
        }
      });

      console.log();
      console.log(`Tests: ${passed} passed, ${failed} failed, ${results.length} total`);

      if (failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      displayError(`Test execution failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

function runTest(test: any, spec: any): TestResult {
  const name = test.name || 'Unnamed test';

  try {
    // Validate test has required fields
    if (!test.test_type) {
      return {
        name,
        passed: false,
        message: 'Missing test_type',
      };
    }

    if (!test.target) {
      return {
        name,
        passed: false,
        message: 'Missing target',
      };
    }

    // Simulate test execution based on type
    switch (test.test_type) {
      case 'capability_test': {
        const capability = findCapability(spec, test.target);
        if (!capability) {
          return {
            name,
            passed: false,
            message: `Capability '${test.target}' not found`,
          };
        }
        // Basic validation
        if (!capability.actions || capability.actions.length === 0) {
          return {
            name,
            passed: false,
            message: 'Capability has no actions defined',
          };
        }
        return { name, passed: true };
      }

      case 'boundary_check': {
        const boundary = findBoundary(spec, test.target);
        if (!boundary) {
          return {
            name,
            passed: false,
            message: `Boundary '${test.target}' not found`,
          };
        }
        // Verify boundary can be evaluated
        if (!boundary.deny_patterns && !boundary.deny_domains && !boundary.deny_if) {
          return {
            name,
            passed: false,
            message: 'Boundary has no denial conditions',
          };
        }
        return { name, passed: true };
      }

      case 'obligation_test': {
        const obligation = findObligation(spec, test.target);
        if (!obligation) {
          return {
            name,
            passed: false,
            message: `Obligation '${test.target}' not found`,
          };
        }
        // Verify obligation has requirements
        if (!obligation.require || obligation.require.length === 0) {
          return {
            name,
            passed: false,
            message: 'Obligation has no requirements',
          };
        }
        return { name, passed: true };
      }

      default:
        return {
          name,
          passed: false,
          message: `Unknown test_type: ${test.test_type}`,
        };
    }
  } catch (error) {
    return {
      name,
      passed: false,
      message: (error as Error).message,
    };
  }
}

function findCapability(spec: any, name: string): any {
  return spec.spec?.capabilities?.find((c: any) => c.name === name);
}

function findBoundary(spec: any, name: string): any {
  return spec.spec?.boundaries?.find((b: any) => b.name === name);
}

function findObligation(spec: any, name: string): any {
  return spec.spec?.obligations?.find((o: any) => o.name === name);
}
