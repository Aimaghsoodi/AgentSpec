"""
Utility functions for AgentSpec.

Includes condition evaluation, value comparison, path traversal,
and helper functions for building condition expressions.
"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence, Union

from .types import (
    ComparisonCondition,
    ComparisonOperator,
    ConditionExpression,
    FieldCondition,
    LogicalCondition,
    RegexCondition,
    CustomCondition,
)


# ============================================================
# PATH TRAVERSAL
# ============================================================


def get_value_from_path(obj: Dict[str, Any], path: str) -> Any:
    """
    Retrieve a nested value from a dictionary using a dot-separated path.

    Args:
        obj: The dictionary to traverse.
        path: A dot-separated path, e.g. ``"agent.name"``.

    Returns:
        The value at the path, or ``None`` if not found.
    """
    parts = path.split(".")
    current: Any = obj
    for part in parts:
        if current is None:
            return None
        if isinstance(current, dict):
            current = current.get(part)
        else:
            return None
    return current


# ============================================================
# VALUE COMPARISON
# ============================================================


def compare_values(actual: Any, expected: Any, operator: str) -> bool:
    """
    Compare two values using a named operator.

    Args:
        actual: The value being tested.
        expected: The value to compare against.
        operator: One of the :class:`ComparisonOperator` values.

    Returns:
        ``True`` if the comparison holds.
    """
    if operator == "equals":
        return actual == expected
    elif operator == "not_equals":
        return actual != expected
    elif operator == "greater_than":
        try:
            return float(actual) > float(expected)
        except (TypeError, ValueError):
            return False
    elif operator == "less_than":
        try:
            return float(actual) < float(expected)
        except (TypeError, ValueError):
            return False
    elif operator == "greater_or_equal":
        try:
            return float(actual) >= float(expected)
        except (TypeError, ValueError):
            return False
    elif operator == "less_or_equal":
        try:
            return float(actual) <= float(expected)
        except (TypeError, ValueError):
            return False
    elif operator == "contains":
        if isinstance(actual, str):
            return str(expected) in actual
        if isinstance(actual, (list, tuple)):
            return expected in actual
        return False
    elif operator == "not_contains":
        return not compare_values(actual, expected, "contains")
    elif operator == "starts_with":
        return isinstance(actual, str) and actual.startswith(str(expected))
    elif operator == "ends_with":
        return isinstance(actual, str) and actual.endswith(str(expected))
    elif operator == "matches":
        try:
            return bool(re.search(str(expected), str(actual)))
        except re.error:
            return False
    elif operator == "in":
        return isinstance(expected, (list, tuple)) and actual in expected
    elif operator == "not_in":
        return isinstance(expected, (list, tuple)) and actual not in expected
    return False


# ============================================================
# CONDITION EVALUATION
# ============================================================


def evaluate_condition(
    condition: Optional[ConditionExpression],
    context: Dict[str, Any],
) -> bool:
    """
    Evaluate a condition expression against a context dictionary.

    Args:
        condition: The condition expression to evaluate. If ``None``, returns ``True``.
        context: A dictionary providing the data for the condition.

    Returns:
        ``True`` if the condition is satisfied.
    """
    if condition is None:
        return True

    result: bool

    if isinstance(condition, FieldCondition):
        value = get_value_from_path(context, condition.field)
        result = bool(value)

    elif isinstance(condition, ComparisonCondition):
        actual = get_value_from_path(context, condition.field)
        result = compare_values(actual, condition.value, condition.comparison.value)

    elif isinstance(condition, LogicalCondition):
        if condition.operator == "and":
            result = all(
                evaluate_condition(c, context) for c in condition.conditions
            )
        else:
            result = any(
                evaluate_condition(c, context) for c in condition.conditions
            )

    elif isinstance(condition, RegexCondition):
        field_value = get_value_from_path(context, condition.field)
        if not isinstance(field_value, str):
            result = False
        else:
            try:
                flags = 0
                if condition.flags:
                    if "i" in condition.flags:
                        flags |= re.IGNORECASE
                    if "m" in condition.flags:
                        flags |= re.MULTILINE
                    if "s" in condition.flags:
                        flags |= re.DOTALL
                result = bool(re.search(condition.value, field_value, flags))
            except re.error:
                result = False

    elif isinstance(condition, CustomCondition):
        # Custom conditions are not evaluated in the Python implementation
        # for security reasons. They always return True unless negated.
        result = True

    else:
        result = True

    if getattr(condition, "negate", False):
        return not result
    return result


# ============================================================
# CONDITION BUILDERS
# ============================================================


def build_condition(
    field: str, value: Any, comparison: str
) -> ComparisonCondition:
    """Build a comparison condition."""
    return ComparisonCondition(
        field=field,
        comparison=ComparisonOperator(comparison),
        value=value,
    )


def build_and(*conditions: ConditionExpression) -> LogicalCondition:
    """Build an AND logical condition."""
    return LogicalCondition(
        operator="and",
        conditions=list(conditions),
    )


def build_or(*conditions: ConditionExpression) -> LogicalCondition:
    """Build an OR logical condition."""
    return LogicalCondition(
        operator="or",
        conditions=list(conditions),
    )


def build_regex(
    field: str, value: str, flags: Optional[str] = None
) -> RegexCondition:
    """Build a regex condition."""
    return RegexCondition(field=field, value=value, flags=flags)


def condition_to_string(condition: ConditionExpression) -> str:
    """
    Convert a condition expression to a human-readable string.

    Args:
        condition: The condition expression to convert.

    Returns:
        A human-readable representation.
    """
    _symbols = {
        "equals": "==",
        "not_equals": "!=",
        "greater_than": ">",
        "less_than": "<",
        "greater_or_equal": ">=",
        "less_or_equal": "<=",
        "contains": "contains",
        "not_contains": "not contains",
        "starts_with": "starts with",
        "ends_with": "ends with",
        "matches": "matches",
        "in": "in",
        "not_in": "not in",
    }

    if isinstance(condition, FieldCondition):
        return f"{condition.field} is truthy"
    elif isinstance(condition, ComparisonCondition):
        symbol = _symbols.get(condition.comparison.value, condition.comparison.value)
        return f"{condition.field} {symbol} {condition.value!r}"
    elif isinstance(condition, LogicalCondition):
        op = " AND " if condition.operator == "and" else " OR "
        parts = [condition_to_string(c) for c in condition.conditions]
        return f"({op.join(parts)})"
    elif isinstance(condition, RegexCondition):
        return f"{condition.field} matches /{condition.value}/"
    elif isinstance(condition, CustomCondition):
        return f"custom: {condition.custom}"
    return "unknown condition"


# ============================================================
# VALIDATION HELPERS
# ============================================================


_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]+$")


def is_valid_id(value: str) -> bool:
    """Check whether a string is a valid AgentSpec identifier."""
    return bool(_ID_PATTERN.match(value))


def is_valid_iso_date(value: str) -> bool:
    """Check whether a string is a valid ISO 8601 date."""
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except (ValueError, AttributeError):
        return False


def is_valid_url(value: str) -> bool:
    """Check whether a string looks like a valid HTTP(S) URL."""
    return value.startswith("http://") or value.startswith("https://")


def is_valid_email(value: str) -> bool:
    """Check whether a string looks like a valid email address."""
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value))
