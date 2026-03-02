import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';

export const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  dim: chalk.dim,
  bold: chalk.bold,
};

export function displayHeader(title: string): void {
  console.log(
    boxen(chalk.bold(title), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue',
    })
  );
}

export function displayCapabilities(capabilities: any[]): void {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Resources'),
      chalk.cyan('Actions'),
      chalk.cyan('Limit'),
    ],
    colWidths: [20, 30, 20, 15],
    wordWrap: true,
  });

  capabilities.forEach((cap) => {
    table.push([
      cap.name,
      cap.resources.join(', '),
      cap.actions.join(', '),
      cap.limit || 'N/A',
    ]);
  });

  console.log(table.toString());
}

export function displayBoundaries(boundaries: any[]): void {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Applies To'),
      chalk.cyan('Severity'),
      chalk.cyan('Description'),
    ],
    colWidths: [20, 30, 12, 25],
    wordWrap: true,
  });

  boundaries.forEach((boundary) => {
    table.push([
      boundary.name,
      boundary.applies_to?.join(', ') || 'N/A',
      boundary.severity || 'medium',
      boundary.description || '',
    ]);
  });

  console.log(table.toString());
}

export function displayObligations(obligations: any[]): void {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Applies To'),
      chalk.cyan('Audit'),
      chalk.cyan('Description'),
    ],
    colWidths: [20, 30, 15, 25],
    wordWrap: true,
  });

  obligations.forEach((obligation) => {
    table.push([
      obligation.name,
      obligation.applies_to?.join(', ') || 'N/A',
      obligation.audit || 'basic',
      obligation.description || '',
    ]);
  });

  console.log(table.toString());
}

export function displaySuccess(message: string): void {
  console.log(colors.success(`✓ ${message}`));
}

export function displayError(message: string): void {
  console.error(colors.error(`✗ ${message}`));
}

export function displayWarning(message: string): void {
  console.warn(colors.warning(`⚠ ${message}`));
}

export function displayInfo(message: string): void {
  console.log(colors.info(`ℹ ${message}`));
}

export function displayDiff(
  field: string,
  oldValue: any,
  newValue: any
): void {
  console.log(
    `${chalk.yellow(field)}: ${chalk.red(JSON.stringify(oldValue))} → ${chalk.green(JSON.stringify(newValue))}`
  );
}

export function displaySpecOverview(spec: any): void {
  const title = `AgentSpec: ${spec.metadata?.name || 'Unknown'}`;
  console.log();
  displayHeader(title);

  if (spec.metadata?.description) {
    console.log(chalk.dim(spec.metadata.description));
    console.log();
  }

  if (spec.spec?.capabilities && spec.spec.capabilities.length > 0) {
    console.log(chalk.bold.cyan('Capabilities:'));
    displayCapabilities(spec.spec.capabilities);
    console.log();
  }

  if (spec.spec?.boundaries && spec.spec.boundaries.length > 0) {
    console.log(chalk.bold.red('Boundaries:'));
    displayBoundaries(spec.spec.boundaries);
    console.log();
  }

  if (spec.spec?.obligations && spec.spec.obligations.length > 0) {
    console.log(chalk.bold.yellow('Obligations:'));
    displayObligations(spec.spec.obligations);
    console.log();
  }

  if (spec.spec?.verification && spec.spec.verification.length > 0) {
    console.log(chalk.bold.magenta(`Verifications: ${spec.spec.verification.length} tests`));
    console.log();
  }
}

export function displayAsciiVisualization(spec: any): void {
  const name = spec.metadata?.name || 'Agent';
  const capCount = spec.spec?.capabilities?.length || 0;
  const boundCount = spec.spec?.boundaries?.length || 0;
  const obligCount = spec.spec?.obligations?.length || 0;

  const viz = `
┌─────────────────────────────────────┐
│     AgentSpec: ${name.padEnd(25)}   │
├─────────────────────────────────────┤
│ Capabilities: ${String(capCount).padStart(3, ' ')}               │
│ Boundaries:   ${String(boundCount).padStart(3, ' ')}               │
│ Obligations:  ${String(obligCount).padStart(3, ' ')}               │
└─────────────────────────────────────┘
  `;

  console.log(viz);
}
