import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CliConfig {
  specFile?: string;
  format?: 'yaml' | 'json';
  defaultNamespace?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.agentspec');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function loadConfig(): CliConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Silently fail if config doesn't exist
  }
  return {};
}

export function saveConfig(config: CliConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

export function getSpecFile(configPath?: string): string {
  const configFile = configPath || 'agentspec.yaml';
  return fs.existsSync(configFile) ? configFile : 'agentspec.json';
}
