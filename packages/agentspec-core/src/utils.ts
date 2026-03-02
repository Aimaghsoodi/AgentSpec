/**
 * Utility functions for AgentSpec core
 */

let counter = 0;

export function generateId(): string {
  counter++;
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${randomPart}${counter}`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function deepClone<T>(value: T): T {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

export function groupBy<T extends Record<string, any>>(
  items: T[],
  key: string
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}

export function indexBy<T extends Record<string, any>>(
  items: T[],
  key: string
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const item of items) {
    result[String(item[key])] = item;
  }
  return result;
}

export function findDuplicates<T extends Record<string, any>>(
  items: T[],
  key: string
): T[] {
  const seen = new Set<unknown>();
  const duplicates: T[] = [];
  for (const item of items) {
    const val = item[key];
    if (seen.has(val)) {
      duplicates.push(item);
    } else {
      seen.add(val);
    }
  }
  return duplicates;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

export function compact<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      (result as any)[key] = value;
    }
  }
  return result;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}

export function pick<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      (result as any)[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): Partial<T> {
  const result: Partial<T> = {};
  const keySet = new Set(keys);
  for (const [key, value] of Object.entries(obj)) {
    if (!keySet.has(key)) {
      (result as any)[key] = value;
    }
  }
  return result;
}
