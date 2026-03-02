/**
 * Serialization module — serialize/deserialize AgentSpec files
 */

import yaml from 'js-yaml';
import type { AgentSpecFile, SerializeOptions } from './types';

export function serializeJSON(spec: AgentSpecFile, pretty?: boolean): string {
  return pretty ? JSON.stringify(spec, null, 2) : JSON.stringify(spec);
}

function serializeYAML(spec: AgentSpecFile): string {
  return yaml.dump(spec, { indent: 2, lineWidth: 120 });
}

function objectToXML(obj: any, indent: number = 0): string {
  const pad = '  '.repeat(indent);
  let xml = '';
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      xml += `${pad}<${key}>\n`;
      for (const item of value) {
        if (typeof item === 'object' && item !== null) {
          xml += `${pad}  <item>\n${objectToXML(item, indent + 2)}${pad}  </item>\n`;
        } else {
          xml += `${pad}  <item>${String(item)}</item>\n`;
        }
      }
      xml += `${pad}</${key}>\n`;
    } else if (typeof value === 'object') {
      xml += `${pad}<${key}>\n${objectToXML(value, indent + 1)}${pad}</${key}>\n`;
    } else {
      xml += `${pad}<${key}>${String(value)}</${key}>\n`;
    }
  }
  return xml;
}

function serializeXML(spec: AgentSpecFile): string {
  return `<agentspec>\n${objectToXML(spec, 1)}</agentspec>`;
}

export function serializeSpec(
  spec: AgentSpecFile,
  options: SerializeOptions
): string {
  switch (options.format) {
    case 'json':
      return serializeJSON(spec, options.pretty);
    case 'yaml':
      return serializeYAML(spec);
    case 'xml':
      return serializeXML(spec);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

export function deserializeSpec(input: unknown): AgentSpecFile {
  if (input === null || input === undefined) {
    throw new Error('Input cannot be null or undefined');
  }

  if (typeof input === 'object' && !Array.isArray(input)) {
    return input as AgentSpecFile;
  }

  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as AgentSpecFile;
    } catch {
      // Try YAML
      try {
        const result = yaml.load(input);
        if (typeof result === 'object' && result !== null) {
          return result as AgentSpecFile;
        }
      } catch {
        // fall through
      }
      throw new Error('Failed to deserialize input');
    }
  }

  throw new Error(`Unsupported input type: ${typeof input}`);
}

export function isJSON(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

export function isYAML(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('<')) {
    return false;
  }
  return /^[a-zA-Z_][a-zA-Z0-9_]*\s*:/m.test(trimmed);
}

export function isXML(input: string): boolean {
  return input.trim().startsWith('<');
}
