# APIMatic Skills

A curated collection of AI agent skills for working with [APIMatic](https://www.apimatic.io) — a Developer and Agent Experience Platform.

Agent skills extend AI coding assistants with domain-specific knowledge and step-by-step workflows.  

Each skill lives in `skills/<name>/` and is defined by a `SKILL.md` file that the agent loads automatically when it detects a matching task.

## Available skills

| Skill                                                | Description                                                           | When to use                                                                                                                                                                                        |
|------------------------------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`apimatic-portal`](skills/apimatic-portal/SKILL.md) | Build, configure, and publish API Portals using a Docs as Code workflow | Creating, serving, or deploying an APIMatic portal; configuring themes, navigation, API Copilot, LLMs.txt, SEO, custom pages, dynamic configurations, context plugins, API recipes and more. |

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

| Agent         | Skills Location |
|---------------|-----------------------|
| Claude Code   | `.claude/skills/`   |
| ChatGPT Codex | `.agents/skills/`    | 
| Cursor        | `.agents/skills/`   |

For example, to install `apimatic-portal`, copy the `skills/apimatic-portal` folder into the appropriate directory above.

### Option 2 — Prompt your agent to install it

Paste the following prompt into your AI agent:

```text
I want to install the APIMatic skills from this GitHub repository:
https://github.com/apimatic/skills

Please do the following:
1. Clone or download the repository (e.g. `git clone https://github.com/apimatic/skills` or download the zip) into a temporary directory. If you cannot do this, stop and let me know — I will do this step manually.
2. Copy each skill folder into the correct skills directory
3. Confirm which skills were installed and where.
4. Clean up the temporary directory
```

## Usage

Once installed, the agent automatically selects the appropriate skill based on what you're working on. No special invocation is needed — just describe your task naturally.

For example:

> "I want to set up an APIMatic developer portal for my OpenAPI spec."

The agent will invoke the right skill and guide you through the workflow step by step.


## Resources

- [APIMatic cli](https://www.npmjs.com/package/@apimatic/cli)
- [APIMatic documentation](https://docs.apimatic.io)
- [APIMatic app](https://app.apimatic.io)

