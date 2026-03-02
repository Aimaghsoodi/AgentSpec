/**
 * Condition expression evaluator
 */

import type {
  ConditionExpression,
  ComparisonOperator,
  LogicalCondition,
} from './types';

export function getValueFromPath(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function compareValues(
  actual: unknown,
  expected: unknown,
  operator: ComparisonOperator | string
): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'greater_than':
      return (actual as number) > (expected as number);
    case 'less_than':
      return (actual as number) < (expected as number);
    case 'greater_or_equal':
      return (actual as number) >= (expected as number);
    case 'less_or_equal':
      return (actual as number) <= (expected as number);
    case 'contains':
      if (typeof actual === 'string') {
        return actual.includes(expected as string);
      }
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      return false;
    case 'not_contains':
      return !compareValues(actual, expected, 'contains');
    case 'starts_with':
      return typeof actual === 'string' && actual.startsWith(expected as string);
    case 'ends_with':
      return typeof actual === 'string' && actual.endsWith(expected as string);
    case 'matches':
      try {
        const regex = new RegExp(expected as string);
        return regex.test(actual as string);
      } catch {
        return false;
      }
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(actual);
    default:
      return false;
  }
}

export function evaluateCondition(
  condition: ConditionExpression,
  context: Record<string, unknown>
): boolean {
  if (!condition || !condition.type) return true;

  let result: boolean;

  switch (condition.type) {
    case 'field': {
      const value = getValueFromPath(context, condition.field);
      result = !!value;
      break;
    }
    case 'comparison': {
      const actual = getValueFromPath(context, condition.field);
      result = compareValues(actual, condition.value, condition.comparison);
      break;
    }
    case 'logical': {
      const logicalCond = condition as LogicalCondition;
      if (logicalCond.operator === 'and') {
        result = logicalCond.conditions.every((c) =>
          evaluateCondition(c, context)
        );
      } else {
        result = logicalCond.conditions.some((c) =>
          evaluateCondition(c, context)
        );
      }
      break;
    }
    case 'regex': {
      const fieldValue = getValueFromPath(context, condition.field);
      if (typeof fieldValue !== 'string') {
        result = false;
        break;
      }
      try {
        const regex = new RegExp(condition.value, condition.flags);
        result = regex.test(fieldValue);
      } catch {
        result = false;
      }
      break;
    }
    case 'custom': {
      try {
        const fn = new Function('context', `return !!(${condition.custom})`);
        result = fn(context);
      } catch {
        result = false;
      }
      break;
    }
    default:
      result = true;
  }

  if ('negate' in condition && condition.negate) {
    return !result;
  }
  return result;
}

export function buildCondition(
  field: string,
  value: unknown,
  comparison: ComparisonOperator | string
): ConditionExpression {
  return {
    type: 'comparison',
    field,
    comparison: comparison as ComparisonOperator,
    value,
  };
}

export function buildLogicalCondition(
  conditions: ConditionExpression[],
  operator: 'and' | 'or'
): ConditionExpression {
  return {
    type: 'logical',
    operator,
    conditions,
  };
}

export function buildAnd(
  ...conditions: ConditionExpression[]
): ConditionExpression {
  return buildLogicalCondition(conditions, 'and');
}

export function buildOr(
  ...conditions: ConditionExpression[]
): ConditionExpression {
  return buildLogicalCondition(conditions, 'or');
}

export function buildRegexCondition(
  field: string,
  value: string,
  flags?: string
): ConditionExpression {
  return {
    type: 'regex',
    field,
    value,
    flags,
  };
}

export function simplifyCondition(
  condition: ConditionExpression
): ConditionExpression {
  if (
    condition.type === 'logical' &&
    'conditions' in condition &&
    condition.conditions &&
    condition.conditions.length === 1
  ) {
    return condition.conditions[0];
  }
  return condition;
}

const COMPARISON_SYMBOLS: Record<string, string> = {
  equals: '==',
  not_equals: '!=',
  greater_than: '>',
  less_than: '<',
  greater_or_equal: '>=',
  less_or_equal: '<=',
  contains: 'contains',
  not_contains: 'not contains',
  starts_with: 'starts with',
  ends_with: 'ends with',
  matches: 'matches',
  in: 'in',
  not_in: 'not in',
};

export function conditionToString(condition: ConditionExpression): string {
  switch (condition.type) {
    case 'field':
      return `${condition.field} is truthy`;
    case 'comparison':
      return `${condition.field} ${COMPARISON_SYMBOLS[condition.comparison] || condition.comparison} ${JSON.stringify(condition.value)}`;
    case 'logical': {
      const op = condition.operator === 'and' ? ' AND ' : ' OR ';
      const parts = (condition.conditions || []).map((c) =>
        conditionToString(c)
      );
      return `(${parts.join(op)})`;
    }
    case 'regex':
      return `${condition.field} matches /${condition.value}/`;
    case 'custom':
      return `custom: ${condition.custom}`;
    default:
      return 'unknown condition';
  }
}
