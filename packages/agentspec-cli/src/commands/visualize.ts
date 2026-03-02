import { Command } from 'commander';
import * as fs from 'fs';
import * as yaml from 'yaml';
import chalk from 'chalk';
import {
  displaySpecOverview,
  displayAsciiVisualization,
  colors,
} from '../display';
import { getSpecFile } from '../config';

export const visualizeCommand = new Command()
  .name('visualize')
  .description('Visualize AgentSpec structure (ASCII tree or JSON)')
  .argument('[file]', 'Path to spec file')
  .option('--format <ascii|tree|json>', 'Output format', 'ascii')
  .action((file, options) => {
    try {
      const specFile = file || getSpecFile();

      if (!fs.existsSync(specFile)) {
        console.error(`File not found: ${specFile}`);
        process.exit(1);
      }

      const content = fs.readFileSync(specFile, 'utf-8');
      let spec: any;

      if (specFile.endsWith('.yaml') || specFile.endsWith('.yml')) {
        spec = yaml.parse(content);
      } else {
        spec = JSON.parse(content);
      }

      switch (options.format) {
        case 'json':
          console.log(JSON.stringify(spec, null, 2));
          break;

        case 'tree':
          displayTreeFormat(spec);
          break;

        case 'ascii':
        default:
          displayAsciiVisualization(spec);
          displayTreeFormat(spec);
          break;
      }
    } catch (error) {
      console.error(`Visualization failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

function displayTreeFormat(spec: any): void {
  console.log();
  console.log(
    chalk.bold.cyan(
      `AgentSpec: ${spec.metadata?.name || 'Unknown'} (v${spec.metadata?.version || '0.1.0'})`
    )
  );
  console.log('');

  const prefix = (depth: number) => '  '.repeat(depth) + '├─ ';
  const lastPrefix = (depth: number) => '  '.repeat(depth) + '└─ ';

  // Capabilities
  if (spec.spec?.capabilities && spec.spec.capabilities.length > 0) {
    console.log(chalk.bold.green('Capabilities'));
    spec.spec.capabilities.forEach((cap: any, idx: number, arr: any[]) => {
      const isLast = idx === arr.length - 1;
      console.log(`${isLast ? lastPrefix(0) : prefix(0)}${cap.name}`);

      if (cap.description) {
        const dPrefix = isLast ? '     ' : '│    ';
        console.log(
          `${dPrefix}${chalk.dim(`↳ ${cap.description.substring(0, 50)}...`)}`
        );
      }

      const childPrefix = isLast ? '     ' : '│    ';
      if (cap.actions) {
        console.log(`${childPrefix}├─ actions: ${cap.actions.join(', ')}`);
      }
      if (cap.resources) {
        console.log(`${childPrefix}└─ resources: ${cap.resources.join(', ')}`);
      }
    });
    console.log('');
  }

  // Boundaries
  if (spec.spec?.boundaries && spec.spec.boundaries.length > 0) {
    console.log(chalk.bold.red('Boundaries'));
    spec.spec.boundaries.forEach((bound: any, idx: number, arr: any[]) => {
      const isLast = idx === arr.length - 1;
      const severity = bound.severity || 'medium';
      const severityColor =
        severity === 'critical'
          ? chalk.red
          : severity === 'high'
            ? chalk.yellow
            : chalk.yellow;

      console.log(
        `${isLast ? lastPrefix(0) : prefix(0)}${bound.name} ${severityColor(`[${severity}]`)}`
      );

      if (bound.description) {
        const dPrefix = isLast ? '     ' : '│    ';
        console.log(
          `${dPrefix}${chalk.dim(`↳ ${bound.description.substring(0, 50)}...`)}`
        );
      }
    });
    console.log('');
  }

  // Obligations
  if (spec.spec?.obligations && spec.spec.obligations.length > 0) {
    console.log(chalk.bold.yellow('Obligations'));
    spec.spec.obligations.forEach((obl: any, idx: number, arr: any[]) => {
      const isLast = idx === arr.length - 1;
      console.log(`${isLast ? lastPrefix(0) : prefix(0)}${obl.name}`);

      if (obl.require && obl.require.length > 0) {
        const dPrefix = isLast ? '     ' : '│    ';
        console.log(
          `${dPrefix}├─ requires: ${obl.require.join(', ')}`
        );
      }

      if (obl.description) {
        const dPrefix = isLast ? '     ' : '│    ';
        console.log(
          `${dPrefix}${chalk.dim(`↳ ${obl.description.substring(0, 50)}...`)}`
        );
      }
    });
    console.log('');
  }

  // Verification
  if (spec.spec?.verification && spec.spec.verification.length > 0) {
    console.log(chalk.bold.magenta('Verification Tests'));
    console.log(`${spec.spec.verification.length} test(s) defined`);
    console.log('');
  }

  // Inheritance
  if (spec.inherits_from && spec.inherits_from.length > 0) {
    console.log(chalk.bold.cyan('Inheritance'));
    spec.inherits_from.forEach((parent: string) => {
      console.log(`${prefix(0)}${parent}`);
    });
    console.log('');
  }
}
