# agentspec (CLI)

Command-line tool for managing AgentSpec specifications.

## Installation

npm install -g agentspec

## Quick Start

Create a new specification:

agentspec create claude-research.agent

Validate a specification:

agentspec validate claude-research.agent

Check permissions:

agentspec check claude-research.agent --action write --resource documents

## Commands

agentspec create <file> - Create new specification (interactive)

agentspec validate <file> - Validate specification syntax and consistency

agentspec check <file> --action <action> --resource <resource> - Check if action allowed

agentspec list - List all agent specifications in directory

agentspec inherit <file> --parent <parent-file> - Create child spec inheriting from parent

agentspec test <file> - Test specification with scenarios

agentspec export <file> --format <json|yaml> - Export specification

agentspec import <file> - Import specification from JSON

agentspec verify <file> - Formally verify spec has no conflicts

agentspec generate-enforcer <file> - Generate runtime enforcer

## Examples

Create a new spec:

agentspec create my-agent.agent

This opens an editor with a template.

Validate all specs:

agentspec validate *.agent

Check specific permission:

agentspec check claude.agent --action write --resource code

Create child spec:

agentspec inherit claude-special.agent --parent claude.agent

Test spec:

agentspec test claude.agent
# Runs test scenarios from spec definition

## Configuration

Config at ~/.agentspec/config.yaml:

editor: vim
defaultFormat: yaml
strictMode: true

## Output Formats

Tree view:

agentspec check claude.agent --format tree

JSON:

agentspec export claude.agent --format json

## Development

npm run dev - Development mode
npm run build - Build
npm test - Test
npm run lint - Lint

## Documentation

- Main README: ../../README.md
- Language Spec: ../../spec/agentspec-lang-v0.1.md
- Quickstart: ../../spec/agentspec-quickstart.md
- Inheritance: ../../spec/inheritance-model.md
- Conflict Resolution: ../../spec/conflict-resolution.md

## License

MIT - See LICENSE
