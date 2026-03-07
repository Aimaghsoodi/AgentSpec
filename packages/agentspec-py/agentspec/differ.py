"""AgentSpec Differ - Compare two AgentSpec files"""

from __future__ import annotations

import json
from typing import Any, Dict, List

from .types import DiffChange, DiffChangeType, DiffResult, DiffSeverity, DiffSummary


def _diff_values(
    path: List[str], old: Any, new: Any, changes: List[DiffChange]
) -> None:
    if old == new:
        return
    if old is None and new is None:
        return

    if old is None:
        changes.append(DiffChange(
            type=DiffChangeType.ADDED, path=path,
            new_value=new, severity=DiffSeverity.NON_BREAKING,
        ))
        return

    if new is None:
        is_breaking = (
            len(path) > 0
            and path[0] in ("capabilities", "boundaries", "version")
        )
        changes.append(DiffChange(
            type=DiffChangeType.REMOVED, path=path, old_value=old,
            severity=DiffSeverity.BREAKING if is_breaking else DiffSeverity.NON_BREAKING,
        ))
        return

    if isinstance(old, list) and isinstance(new, list):
        _diff_arrays(path, old, new, changes)
        return

    if isinstance(old, dict) and isinstance(new, dict):
        _diff_objects(path, old, new, changes)
        return

    if old != new:
        changes.append(DiffChange(
            type=DiffChangeType.MODIFIED, path=path,
            old_value=old, new_value=new,
            severity=DiffSeverity.NON_BREAKING,
        ))


def _diff_arrays(
    path: List[str], old: List, new: List, changes: List[DiffChange]
) -> None:
    old_has_ids = all(
        isinstance(item, dict) and "id" in item for item in old
    ) if old else False
    new_has_ids = all(
        isinstance(item, dict) and "id" in item for item in new
    ) if new else False

    if old_has_ids and new_has_ids:
        old_map = {item["id"]: item for item in old}
        new_map = {item["id"]: item for item in new}

        for id_, item in old_map.items():
            if id_ not in new_map:
                changes.append(DiffChange(
                    type=DiffChangeType.REMOVED, path=path + [id_],
                    old_value=item, severity=DiffSeverity.BREAKING,
                ))
        for id_, item in new_map.items():
            if id_ not in old_map:
                changes.append(DiffChange(
                    type=DiffChangeType.ADDED, path=path + [id_],
                    new_value=item, severity=DiffSeverity.NON_BREAKING,
                ))
        for id_, old_item in old_map.items():
            if id_ in new_map:
                _diff_objects(path + [id_], old_item, new_map[id_], changes)
    else:
        old_json = json.dumps(old, sort_keys=True, default=str)
        new_json = json.dumps(new, sort_keys=True, default=str)
        if old_json != new_json:
            is_removal = len(new) < len(old)
            changes.append(DiffChange(
                type=DiffChangeType.MODIFIED, path=path,
                old_value=old, new_value=new,
                severity=DiffSeverity.BREAKING if is_removal else DiffSeverity.NON_BREAKING,
            ))


def _diff_objects(
    path: List[str], old: Dict, new: Dict, changes: List[DiffChange]
) -> None:
    all_keys = set(list(old.keys()) + list(new.keys()))
    for key in all_keys:
        _diff_values(path + [key], old.get(key), new.get(key), changes)


def diff_specs(source: Any, target: Any) -> DiffResult:
    src = source.model_dump(by_alias=True) if hasattr(source, "model_dump") else source
    tgt = target.model_dump(by_alias=True) if hasattr(target, "model_dump") else target

    changes: List[DiffChange] = []
    _diff_objects([], src, tgt, changes)

    flat = [c for c in changes if len(c.path) > 0]

    summary = DiffSummary(
        total_changes=len(flat),
        additions=sum(1 for c in flat if c.type == DiffChangeType.ADDED),
        removals=sum(1 for c in flat if c.type == DiffChangeType.REMOVED),
        modifications=sum(1 for c in flat if c.type == DiffChangeType.MODIFIED),
        breaking_changes=sum(1 for c in flat if c.severity == DiffSeverity.BREAKING),
        non_breaking_changes=sum(1 for c in flat if c.severity == DiffSeverity.NON_BREAKING),
    )
    return DiffResult(changes=flat, summary=summary)


def categorize_diff(
    changes: List[DiffChange],
) -> Dict[str, List[DiffChange]]:
    return {
        "breaking": [c for c in changes if c.severity == DiffSeverity.BREAKING],
        "non_breaking": [c for c in changes if c.severity == DiffSeverity.NON_BREAKING],
    }


def get_changed_elements(
    changes: List[DiffChange],
) -> Dict[str, List[DiffChange]]:
    return {
        "capabilities": [c for c in changes if c.path and c.path[0] == "capabilities"],
        "boundaries": [c for c in changes if c.path and c.path[0] == "boundaries"],
        "obligations": [c for c in changes if c.path and c.path[0] == "obligations"],
        "escalations": [
            c for c in changes
            if c.path and c.path[0] in ("escalationRules", "escalations")
        ],
        "other": [
            c for c in changes
            if not c.path
            or c.path[0] not in (
                "capabilities", "boundaries", "obligations",
                "escalationRules", "escalations",
            )
        ],
    }


def format_diff_as_markdown(diff: DiffResult) -> str:
    lines = [
        "# Spec Diff", "",
        "## Summary", "",
        f"- Total Changes: {diff.summary.total_changes}",
        f"- Additions: {diff.summary.additions}",
        f"- Removals: {diff.summary.removals}",
        f"- Modifications: {diff.summary.modifications}",
        f"- Breaking Changes: {diff.summary.breaking_changes}",
        "",
    ]

    grouped = get_changed_elements(diff.changes)

    section_map = [
        ("capabilities", "Capabilities"),
        ("boundaries", "Boundaries"),
        ("obligations", "Obligations"),
        ("other", "Other Changes"),
    ]

    for section, label in section_map:
        items = grouped[section]
        if items:
            lines.extend([f"## {label}", ""])
            for c in items:
                tag = " [Breaking]" if c.severity == DiffSeverity.BREAKING else ""
                type_val = c.type.value if hasattr(c.type, "value") else c.type
                lines.append(f"- {type_val}: {'.'.join(c.path)}{tag}")
            lines.append("")

    return "\n".join(lines)
