# Maintaining the APIMatic skills

Notes for the people who maintain this repository. Users of the skills should start with [README.md](README.md).

## Skill versions and branches

| Branch | Targets | Notes |
|--------|---------|-------|
| `main` | APIMatic CLI v2 (`@apimatic/cli@2`), docs at https://docs.apimatic.io/v4 | Day-to-day development. |
| `v1` | APIMatic CLI v1 (`@apimatic/cli@1`) | Maintenance only. Branched from the `v1.0.0` tag. |

To fix a v1 skill, branch from `v1`, open the pull request against `v1`, and tag the merge as the next `v1.0.x`. Port a fix to `main` only if it also applies to CLI v2.

## Keeping up with CLI releases

The skills describe a specific CLI behavior, so check each CLI v2 release for changes the skills need:

- Release notes: https://github.com/apimatic/apimatic-cli/releases
- Docs: https://docs.apimatic.io/v4 (they can lag behind the CLI; when they disagree, the CLI's release notes and `--help` output are what users will see)

Look in particular for an "Upgrading from …" section in the release notes. Those list breaking changes, such as a new required key in `nav.json` or a new redirect URI to register.

## The plugin

The repository root is the `apimatic` agent plugin and its own marketplace, `apimatic-skills`. Every `skills/<name>/SKILL.md` is part of it, so a new skill needs no registration. Each host reads its own manifest:

| File | Read by |
|------|---------|
| `plugin.json` | The portable manifest ([Agent Plugins 1.0.0](https://agent-plugins.org/specification)), read first by VS Code, GitHub Copilot CLI, Cursor and Codex. Codex's display fields are in `extensions["com.openai"].interface`. Keep `$schema` at 1.0.0: Codex rejects 1.1.0. |
| `.claude-plugin/plugin.json` | Claude Code, which does not read the root `plugin.json` |
| `.cursor-plugin/plugin.json` | Cursor builds without Agent Plugins support |
| `.codex-plugin/plugin.json` | Codex builds without Agent Plugins support |
| `.claude-plugin/marketplace.json` | The marketplace for Claude Code, VS Code and Copilot CLI |
| `.agents/plugins/marketplace.json` | The marketplace for Codex, with the `policy` and `category` its docs ask for |

Do not add a root `marketplace.json`, `.plugin/marketplace.json` or `.github/plugin/marketplace.json`: VS Code and Copilot CLI read the first of those that exists, ahead of `.claude-plugin/marketplace.json`.

**Releasing.** Claude Code and Codex cache an installed plugin by its `version`, so users get skill changes only when it changes. Raise `version` in all four manifests (`check-plugin.sh` fails while they differ) and merge to `main`: a patch for skill fixes, a minor version for a new skill, a major version for a new APIMatic CLI major version. `claude plugin tag` tags the release as `apimatic--v<version>`.

**Checks.** `bash check-plugin.sh` checks that the manifests follow Agent Plugins 1.0.0 and agree with each other, that the skills follow the Agent Skills format, and that `claude plugin validate --strict` passes. Each skill's `skills/<name>/check.sh` has its own regression checks.

**Evals with Claude.** `evals/` is the plugin's suite for `claude plugin eval` (Claude Code 2.1.269 or later). Each case runs in a fresh Claude Code session with only this plugin loaded, and again without it, so the report shows what the plugin changes:

```bash
# Each skill fires on its own kind of request, gives CLI v2 guidance, and none fires on an unrelated request
claude plugin eval . --tag trigger --no-publish
# The bundled scripts run from wherever the plugin is installed
claude plugin eval . --tag shell --scaffold --allow-tools Bash --ablation none --no-publish
```

The `shell` cases grant a shell, which `claude plugin eval` runs only inside its OS sandbox: run them on Linux, macOS or WSL2, since native Windows refuses them. Results go to `evals/results/`, which is git-ignored. The suites in `skills/<name>/evals/` are separate; see their READMEs.
