import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import inquirer from 'inquirer';
import { displaySuccess, displayError } from '../display';

interface ExtractedSpec {
  capabilities: any[];
  boundaries: any[];
  obligations: any[];
}

export const convertCommand = new Command()
  .name('convert')
  .description(
    'Convert system prompt or instructions to AgentSpec (heuristic parsing)'
  )
  .argument('[file]', 'Path to system prompt file')
  .option('--name <name>', 'Agent name')
  .option('--output <file>', 'Output file path')
  .action(async (file, options) => {
    try {
      let promptText: string;

      if (file) {
        if (!fs.existsSync(file)) {
          displayError(`File not found: ${file}`);
          process.exit(1);
        }
        promptText = fs.readFileSync(file, 'utf-8');
      } else {
        // Interactive mode - ask user to paste prompt
        const answers = await inquirer.prompt([
          {
            type: 'editor',
            name: 'prompt',
            message: 'Paste your system prompt (editor will open):',
          },
        ]);
        promptText = answers.prompt;
      }

      if (!promptText.trim()) {
        displayError('No prompt text provided');
        process.exit(1);
      }

      const agentName =
        options.name ||
        (file ? path.basename(file, path.extname(file)) : 'agent-from-prompt');

      // Extract spec components from prompt
      const extracted = extractSpecFromPrompt(promptText);

      // Create AgentSpec document
      const spec = {
        apiVersion: 'agentspec.io/v1',
        kind: 'AgentSpec',
        metadata: {
          name: agentName.toLowerCase().replace(/\s+/g, '-'),
          namespace: 'default',
          version: '0.1.0',
          author: 'Converted from prompt',
          created: new Date().toISOString(),
          description: `Automatically converted from system prompt`,
        },
        spec: {
          capabilities: extracted.capabilities,
          boundaries: extracted.boundaries,
          obligations: extracted.obligations,
          verification: [],
        },
      };

      // Determine output format
      let outputFile =
        options.output ||
        `${agentName.toLowerCase().replace(/\s+/g, '-')}-agentspec.yaml`;

      let output: string;
      if (outputFile.endsWith('.json')) {
        output = JSON.stringify(spec, null, 2);
      } else {
        output = yaml.stringify(spec, {
          indent: 2,
          nullStr: 'null',
        });
      }

      fs.writeFileSync(outputFile, output);
      displaySuccess(`Converted spec written to ${outputFile}`);
      console.log(
        `\nNote: This is a heuristic conversion. Please review and refine the generated spec.`
      );
    } catch (error) {
      displayError(`Conversion failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

function extractSpecFromPrompt(prompt: string): ExtractedSpec {
  const capabilities: any[] = [];
  const boundaries: any[] = [];
  const obligations: any[] = [];

  const lines = prompt.split('\n');
  let capIndex = 0;
  let boundIndex = 0;
  let oblIndex = 0;

  lines.forEach((line) => {
    const trimmed = line.toLowerCase().trim();

    // Look for capability patterns: "can", "able to", "provide", "generate"
    if (/\bcan\b|\bprovide\b|\bgenerate\b|\ballow|\bcapability\b/.test(trimmed)) {
      const words = line.split(/[,.!?;:]/)[0].trim();
      if (words.length > 10) {
        // Simple heuristic: extract a capability name
        const capName = extractName(words, 'capability');
        if (capName && !capabilities.some((c) => c.name === capName)) {
          capabilities.push({
            name: capName,
            resources: ['data'],
            actions: ['read', 'process'],
            description: words,
          });
        }
      }
    }

    // Look for boundary patterns: "don't", "cannot", "must not", "should not", "never"
    if (
      /\bdon't\b|\bcannot\b|\bmust not\b|\bshould not\b|\bnever\b|\bprohibit\b|\bforbid\b/.test(
        trimmed
      )
    ) {
      const boundName = `boundary_${boundIndex++}`;
      boundaries.push({
        name: boundName,
        deny_patterns: [extractPattern(trimmed)],
        severity: 'high',
        description: line.trim(),
      });
    }

    // Look for obligation patterns: "always", "must", "should", "require", "ensure"
    if (
      /\balways\b|\bmust\b|\bshould\b|\brequire\b|\bensure\b|\bneed to\b/.test(
        trimmed
      )
    ) {
      const oblName = `obligation_${oblIndex++}`;
      obligations.push({
        name: oblName,
        require: [extractName(line, 'requirement')],
        description: line.trim(),
      });
    }
  });

  // Remove duplicates
  const uniqueCapabilities = Array.from(
    new Map(capabilities.map((c) => [c.name, c])).values()
  );
  const uniqueBoundaries = Array.from(
    new Map(boundaries.map((b) => [b.name, b])).values()
  );
  const uniqueObligations = Array.from(
    new Map(obligations.map((o) => [o.name, o])).values()
  );

  return {
    capabilities: uniqueCapabilities,
    boundaries: uniqueBoundaries,
    obligations: uniqueObligations,
  };
}

function extractName(text: string, type: string): string {
  // Simple heuristic name extraction
  const words = text.split(/\s+/).filter((w) => w.length > 2 && !isCommonWord(w));
  const name = words
    .slice(0, 3)
    .join('_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
  return name || `${type}_${Math.floor(Math.random() * 1000)}`;
}

function extractPattern(text: string): string {
  // Extract a pattern name from boundary text
  const words = text
    .split(/\s+/)
    .slice(0, 4)
    .join(' ');
  return words.substring(0, 50);
}

function isCommonWord(word: string): boolean {
  const common = [
    'the',
    'is',
    'a',
    'an',
    'and',
    'or',
    'in',
    'to',
    'of',
    'that',
    'this',
  ];
  return common.includes(word.toLowerCase());
}
