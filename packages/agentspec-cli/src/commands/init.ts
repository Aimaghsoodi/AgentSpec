import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { displaySuccess, displayError } from '../display';

const templates = {
  basic: {
    apiVersion: 'agentspec.io/v1',
    kind: 'AgentSpec',
    metadata: {
      name: 'my-agent',
      namespace: 'default',
      version: '0.1.0',
      author: 'You',
      created: new Date().toISOString(),
      description: 'My custom agent specification',
    },
    spec: {
      capabilities: [],
      boundaries: [],
      obligations: [],
      verification: [],
    },
  },
  assistant: {
    apiVersion: 'agentspec.io/v1',
    kind: 'AgentSpec',
    metadata: {
      name: 'assistant-agent',
      namespace: 'default',
      version: '0.1.0',
      author: 'You',
      created: new Date().toISOString(),
      description: 'General-purpose assistant agent',
    },
    spec: {
      capabilities: [
        {
          name: 'read_documents',
          resources: ['documents'],
          actions: ['read', 'search'],
          description: 'Read and search documents',
        },
        {
          name: 'generate_content',
          resources: ['output'],
          actions: ['write', 'create'],
          description: 'Generate and write content',
        },
      ],
      boundaries: [
        {
          name: 'no_sensitive_data',
          applies_to: ['read_documents'],
          deny_domains: ['pii', 'financial', 'medical'],
          severity: 'critical',
          description: 'Do not access sensitive personal data',
        },
      ],
      obligations: [
        {
          name: 'cite_sources',
          applies_to: ['generate_content'],
          require: ['source_citations'],
          description: 'All generated content must cite sources',
        },
      ],
      verification: [],
    },
  },
  compliance: {
    apiVersion: 'agentspec.io/v1',
    kind: 'AgentSpec',
    metadata: {
      name: 'compliance-agent',
      namespace: 'default',
      version: '0.1.0',
      author: 'You',
      created: new Date().toISOString(),
      description: 'Compliance-focused agent with strict controls',
    },
    spec: {
      capabilities: [
        {
          name: 'audit_logs',
          resources: ['audit_logs'],
          actions: ['read', 'search'],
          description: 'Access audit logs',
        },
      ],
      boundaries: [
        {
          name: 'immutable_logs',
          applies_to: ['audit_logs'],
          deny_if: [
            {
              condition: 'modifies_audit_data',
              reason: 'Audit logs must be immutable',
            },
          ],
          severity: 'critical',
          description: 'Audit logs cannot be modified',
        },
      ],
      obligations: [
        {
          name: 'log_all_access',
          applies_to: ['audit_logs'],
          require: ['access_log'],
          audit: 'immutable_ledger',
          transparency: 'detailed',
          description: 'All access must be logged immutably',
        },
      ],
      verification: [],
    },
  },
};

export const initCommand = new Command()
  .name('init')
  .description('Create a new AgentSpec document')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Agent specification name:',
          default: 'my-agent',
          validate: (value) =>
            /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)
              ? true
              : 'Name must be DNS subdomain format',
        },
        {
          type: 'input',
          name: 'namespace',
          message: 'Namespace:',
          default: 'default',
        },
        {
          type: 'input',
          name: 'author',
          message: 'Author:',
          default: 'You',
        },
        {
          type: 'list',
          name: 'template',
          message: 'Choose a template:',
          choices: ['basic', 'assistant', 'compliance'],
          default: 'basic',
        },
        {
          type: 'list',
          name: 'format',
          message: 'File format:',
          choices: ['yaml', 'json'],
          default: 'yaml',
        },
      ]);

      const template = (templates as any)[answers.template];
      template.metadata.name = answers.name;
      template.metadata.namespace = answers.namespace;
      template.metadata.author = answers.author;

      const filename = `agentspec.${answers.format === 'yaml' ? 'yaml' : 'json'}`;

      if (fs.existsSync(filename)) {
        displayError(`File ${filename} already exists`);
        return;
      }

      let content: string;
      if (answers.format === 'yaml') {
        // Simple YAML serialization for basic objects
        content = toYAML(template);
      } else {
        content = JSON.stringify(template, null, 2);
      }

      fs.writeFileSync(filename, content);
      displaySuccess(`Created ${filename}`);
    } catch (error) {
      displayError(`Failed to initialize spec: ${(error as Error).message}`);
      process.exit(1);
    }
  });

function toYAML(obj: any, indent = 0): string {
  const spaces = ' '.repeat(indent);
  let result = '';

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        result += `${spaces}-\n${toYAML(item, indent + 2)}`;
      } else {
        result += `${spaces}- ${item}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result += `${spaces}${key}:\n${toYAML(value, indent + 2)}`;
      } else if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n${toYAML(value, indent + 2)}`;
      } else {
        result += `${spaces}${key}: ${JSON.stringify(value)}\n`;
      }
    });
  }

  return result;
}
