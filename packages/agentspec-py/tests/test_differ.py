"""Tests for AgentSpec differ"""

import pytest

from agentspec import diff_specs, categorize_diff, format_diff_as_markdown


def test_no_diff():
    spec = {"version": "1.0", "capabilities": [], "boundaries": []}
    result = diff_specs(spec, spec)
    assert result.summary.total_changes == 0


def test_added_capability():
    old = {"version": "1.0", "capabilities": [], "boundaries": []}
    new = {
        "version": "1.0",
        "capabilities": [{"id": "c1", "name": "read"}],
        "boundaries": [],
    }
    result = diff_specs(old, new)
    assert result.summary.total_changes > 0


def test_version_change():
    old = {"version": "1.0", "capabilities": [], "boundaries": []}
    new = {"version": "2.0", "capabilities": [], "boundaries": []}
    result = diff_specs(old, new)
    assert result.summary.modifications >= 1


def test_categorize():
    old = {"version": "1.0", "capabilities": [{"id": "c1"}], "boundaries": []}
    new = {"version": "1.0", "capabilities": [], "boundaries": []}
    result = diff_specs(old, new)
    cats = categorize_diff(result.changes)
    assert "breaking" in cats


def test_format_markdown():
    old = {"version": "1.0", "capabilities": [], "boundaries": []}
    new = {"version": "2.0", "capabilities": [], "boundaries": []}
    result = diff_specs(old, new)
    md = format_diff_as_markdown(result)
    assert "# Spec Diff" in md
