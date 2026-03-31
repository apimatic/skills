# APIMatic Skills

A curated collection of AI agent skills for working with [APIMatic](https://docs.apimatic.io) — covering everything from optimizing OpenAPI definitions and generating SDKs to building and managing developer portals.

## Overview

Agent skills extend AI coding assistants with domain-specific knowledge and step-by-step workflows. The skills in this repository are designed for users of [APIMatic](https://docs.apimatic.io) — a Developer and Agent Experience Platform.

Each skill lives in `skills/<name>/` and is defined by a `SKILL.md` file that the agent loads automatically when it detects a matching task.

## Available skills

| Skill                                                | Description                                                           | When to use                                                                                                                                                                                        |
|------------------------------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`apimatic-portal`](skills/apimatic-portal/SKILL.md) | Build, configure, and publish APIMatic Docs as Code developer portals | Creating, serving, or deploying an APIMatic portal; configuring themes, navigation, API Copilot, LLMs.txt, SEO, custom pages, dynamic configurations, context plugins, header/footer, or API recipes |

## Prerequisites

- Node.js >= 20 and npm
- An APIMatic account — [sign up free at app.apimatic.io](https://app.apimatic.io)
- APIMatic CLI installed globally:

```bash
npm install -g @apimatic/cli
```

## Installation

### Option 1 — Manual copy

Download or clone this repository, then copy the skill folder(s) you want into the skills directory for your agent:

| Agent         | Global (all projects) | Project-level      |
|---------------|-----------------------|--------------------|
| Claude Code   | `~/.claude/skills/`   | `.claude/skills/`  |
| ChatGPT Codex | `~/.codex/skills/`    | —                  |
| Cursor        | `~/.cursor/skills/`   | `.cursor/skills/`  |

For example, to install `apimatic-portal`, copy the `skills/apimatic-portal` folder into the appropriate directory above.

### Option 2 — Prompt your agent to install it

Paste the following prompt into your AI agent:

```text
I want to install the APIMatic skills from this GitHub repository:
https://github.com/apimatic/skills

Please do the following:
1. Clone or download the repository (e.g. `git clone https://github.com/apimatic/skills` or download the zip). If you cannot do this, stop and let me know — I will do this step manually.
2. Copy each skill folder into the correct skills directory
3. Confirm which skills were installed and where.
```

## Usage

Once installed, the agent automatically selects the appropriate skill based on what you're working on. No special invocation is needed — just describe your task naturally.

For example:

> "I want to set up an APIMatic developer portal for my OpenAPI spec."

The agent will invoke the right skill and guide you through the workflow step by step.

## Repository structure

```text
apimatic-skills/
└── skills/
    └── apimatic-portal/
        ├── SKILL.md           # Skill instructions and frontmatter
        ├── check.sh           # Regression test runner
        ├── evals/             # AI evaluation test cases
        ├── examples/          # Working configuration examples
        └── references/        # Detailed reference documentation
```

## License

This project is licensed under the MIT License. A `LICENSE` file will be added to the repository root.

## Resources

- [APIMatic documentation](https://docs.apimatic.io)
- [APIMatic account](https://app.apimatic.io)
- [Agent skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [ChatGPT Codex documentation](https://developers.openai.com/codex)
