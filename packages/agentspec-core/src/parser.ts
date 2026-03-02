/**
 * Parser module — Parse YAML/JSON/auto-detect into AgentSpecFile
 */

import yaml from 'js-yaml';
import type { AgentSpecFile } from './types';

export type FormatType = 'json' | 'yaml' | 'xml';

export function parseJSON(input: string): AgentSpecFile {
  try {
    return JSON.parse(input) as AgentSpecFile;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${(e as Error).message}`);
  }
}

export function parseYAML(input: string): AgentSpecFile {
  try {
    const result = yaml.load(input);
    if (typeof result !== 'object' || result === null) {
      throw new Error('YAML did not produce an object');
    }
    return result as AgentSpecFile;
  } catch (e) {
    throw new Error(`Failed to parse YAML: ${(e as Error).message}`);
  }
}

export function detectFormat(input: string): FormatType {
  const trimmed = input.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  if (trimmed.startsWith('<')) {
    return 'xml';
  }
  if (trimmed.includes(':')) {
    return 'yaml';
  }
  return 'json';
}

export function parseSpec(input: string, format?: FormatType): AgentSpecFile {
  const detectedFormat = format || detectFormat(input);

  switch (detectedFormat) {
    case 'json':
      return parseJSON(input);
    case 'yaml':
      return parseYAML(input);
    default:
      throw new Error(`Unsupported format: ${detectedFormat}`);
  }
}
