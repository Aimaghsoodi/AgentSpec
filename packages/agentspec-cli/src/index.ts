#!/usr/bin/env node

import { program } from 'commander';
import { version } from '../package.json';
import { initCommand } from './commands/init';
import { validateCommand } from './commands/validate';
import { lintCommand } from './commands/lint';
import { testCommand } from './commands/test';
import { diffCommand } from './commands/diff';
import { resolveCommand } from './commands/resolve';
import { convertCommand } from './commands/convert';
import { visualizeCommand } from './commands/visualize';

program.version(version).description('AgentSpec CLI — manage agent specifications');

// Register commands
program.addCommand(initCommand);
program.addCommand(validateCommand);
program.addCommand(lintCommand);
program.addCommand(testCommand);
program.addCommand(diffCommand);
program.addCommand(resolveCommand);
program.addCommand(convertCommand);
program.addCommand(visualizeCommand);

program.parse(process.argv);
