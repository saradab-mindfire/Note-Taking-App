# Claude Agents

This directory contains agent definitions for Claude Code's multi-agent workflows.

Agents are specialized sub-agents that Claude can spawn for specific tasks.

## Structure

Each agent is a `.md` file with:
- A description of what the agent does
- Tools it has access to
- Instructions for the agent

## Available Agents

None configured yet. Add agent files as needed.

## Example Agent

```markdown
---
name: code-reviewer
description: Reviews TypeScript code for correctness, style, and security issues
tools:
  - Read
  - Grep
  - Glob
---

You are a TypeScript code reviewer...
```
