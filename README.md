# APIMatic Skills

A curated collection of AI agent skills for working with [APIMatic](https://www.apimatic.io) — a Developer and Agent Experience Platform.

Agent skills extend AI coding assistants with domain-specific knowledge and step-by-step workflows.  

Each skill lives in `skills/<name>/` and is defined by a `SKILL.md` file that the agent loads automatically when it detects a matching task.

## Available skills

| Skill                                                | Description                                                           | When to use                                                                                                                                                                                        |
|------------------------------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`apimatic-portal`](skills/apimatic-portal/SKILL.md) | Build, configure, and publish API Portals using a Docs as Code workflow | Creating, previewing, or deploying an APIMatic portal; configuring `src/apimatic.json` (branding, header links, AI page actions, SDK languages, hosting under a path), Markdown pages and `nav.json` navigation and tabs, Context Plugins, and upgrading CLI v1 portal projects. |
| [`apimatic-sdk`](skills/apimatic-sdk/SKILL.md) | Generate, customize, and publish SDKs using the APIMatic CLI | Generating C#, Python, or TypeScript SDKs; validating, checking, or transforming API definitions; customizing generated code with change tracking; publishing SDKs to NuGet, PyPI, npm, or GitHub. |

## Prerequisites

- Node.js 24 or later and npm
- An APIMatic account — [sign up free at app.apimatic.io](https://app.apimatic.io)
- APIMatic CLI v2 installed globally:

```bash
npm install -g @apimatic/cli
```

These skills target APIMatic CLI v2, documented at [docs.apimatic.io/v4](https://docs.apimatic.io/v4).

## Which skill version do I need?

There are two versions of these skills, one for each major version of the APIMatic CLI. Use the version that matches the CLI your project is built with.

|                         | v2 skills (`main`)                                  | v1 skills (`v1` branch)                                                    |
|-------------------------|-----------------------------------------------------|----------------------------------------------------------------------------|
| APIMatic CLI            | v2 — `npm install -g @apimatic/cli`                 | v1 — `npm install -g @apimatic/cli@1`                                      |
| Node.js                 | 24 or later                                         | 20 or later                                                                |
| Portal configuration    | `src/apimatic.json` and `nav.json` files            | `src/APIMATIC-BUILD.json` and `toc.yml`                                    |
| Portal features         | Branding, header links, tabs, AI page actions, Context Plugins | Themes, API Recipes, API Copilot, dynamic configurations, custom header and footer |
| SDK languages           | C#, Python, TypeScript                              | C#, Java, PHP, Python, Ruby, TypeScript, Go                                |
| SDK customization       | Change tracking                                     | CodeGen settings (`APIMATIC-META.json`) and change tracking                |
| Documentation           | [docs.apimatic.io/v4](https://docs.apimatic.io/v4)  | [docs.apimatic.io](https://docs.apimatic.io)                               |

**Not sure which one you have?**

- Run `apimatic --version`. Output starting with `@apimatic/cli/2.` means v2; `@apimatic/cli/1.` means v1.
- Or look in your project's `src/` folder. A `src/apimatic.json` means v2. A `src/APIMATIC-BUILD.json` with no `apimatic.json` means a v1 project — use the v1 skills, or use the v2 `apimatic-portal` skill to upgrade the project to CLI v2.

**Installing the v1 skills.** Point the installer at the `v1` branch:

```bash
npx skills add https://github.com/apimatic/skills/tree/v1/skills/apimatic-portal
npx skills add https://github.com/apimatic/skills/tree/v1/skills/apimatic-sdk
```

Or clone that branch (`git clone --branch v1 https://github.com/apimatic/skills`) and copy the skill folders as described in [Option 3](#option-3--manual-copy). The tag `v1.0.0` marks the last v1 release made from `main`.

**Fixing the v1 skills.** The v1 skills are maintained on the `v1` branch. Open pull requests against `v1`, not `main`; each fix is released as a `v1.0.x` tag.

## Installation

### Option 1 — Install via [skills.sh](https://skills.sh)

```bash
npx skills add apimatic/skills --skill apimatic-portal
npx skills add apimatic/skills --skill apimatic-sdk
```

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

### Option 3 — Manual copy

Download or clone this repository, then copy the skill folder(s) you want into the skills directory for your agent:

| Agent         | Skills Location   |
|---------------|-------------------|
| Claude Code   | `.claude/skills/` |
| ChatGPT Codex | `.agents/skills/` |
| Cursor        | `.agents/skills/` |

For example, to install `apimatic-portal`, copy the `skills/apimatic-portal` folder into the appropriate directory above.

## Usage

Once installed, the agent automatically selects the appropriate skill based on what you're working on. No special invocation is needed — just describe your task naturally.

For example:

> "I want to set up an APIMatic developer portal for my OpenAPI spec."

The agent will invoke the right skill and guide you through the workflow step by step.

## Resources

- [APIMatic cli](https://www.npmjs.com/package/@apimatic/cli)
- [APIMatic documentation](https://docs.apimatic.io/v4)
- [APIMatic app](https://app.apimatic.io)

## Maintaining these skills

See [MAINTAINING.md](MAINTAINING.md) for the v1 maintenance branch and how to keep up with CLI releases.
