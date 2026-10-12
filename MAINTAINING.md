# Maintaining the APIMatic skills

Notes for the people who maintain this repository. Users of the skills should start with [README.md](README.md).

## Skill versions and branches

| Branch | Targets | Notes |
|--------|---------|-------|
| `main` | APIMatic CLI v2 (`@apimatic/cli@beta`), docs at https://docs.apimatic.io/v4 | Day-to-day development. |
| `v1` | APIMatic CLI v1 (`@apimatic/cli@1`) | Maintenance only. Branched from the `v1.0.0` tag. |

To fix a v1 skill, branch from `v1`, open the pull request against `v1`, and tag the merge as the next `v1.0.x`. Port a fix to `main` only if it also applies to CLI v2.

## When APIMatic CLI v2 goes GA

> **Reminder:** the v2 skills pin the CLI to the npm `beta` dist-tag (`@apimatic/cli@beta`), because `@apimatic/cli` and `@apimatic/cli@latest` still install CLI v1. When CLI v2 is published as `latest`, the `@beta` pin must be removed everywhere.

Find every place that depends on the beta:

```bash
grep -rn "@beta" README.md skills/
grep -rn -i "beta release\|@latest\|2\.0\.0-beta" README.md skills/
```

Then work through this checklist:

1. **Install commands.** Replace `npm install -g @apimatic/cli@beta` with `npm install -g @apimatic/cli` in `README.md`, both `SKILL.md` files, and every file under `references/`. This includes the upgrade message in each skill's Prerequisites and in `apimatic-portal/references/first-time-setup.md` (Step A2).
2. **CI examples.** Replace `npx @apimatic/cli@beta` (for example, the GitHub Actions snippet in `apimatic-portal/SKILL.md`).
3. **Schema URL.** Update `"$schema": "https://cdn.jsdelivr.net/npm/@apimatic/cli@beta/apimatic.schema.json"` in `apimatic-portal/references/apimatic-json.md`, `apimatic-portal/references/upgrading-from-v1.md`, and `apimatic-portal/examples/apimatic.json`. Use the URL the CLI's own scaffold writes at GA.
4. **"v1 is the default" guidance.** Rewrite the red flags and common-mistakes rows that say installing `@apimatic/cli` or `@apimatic/cli@latest` gives CLI v1. After GA those install v2, and v1 is `@apimatic/cli@1`.
5. **Beta-only caveats.** Revisit text that exists only because of the beta, such as the Change Tracking Availability Check in `apimatic-sdk/SKILL.md` ("not every CLI v2 beta release includes it") and the "Projects created before CLI 2.0.0-beta.3/beta.5" notes in the portal skill.
6. **Checks and evals.** Update `apimatic-portal/check.sh` (QUAL-01 and QUAL-07 require `@apimatic/cli@beta`) and every eval assertion that expects `@beta`. Run `grep -n "@beta" skills/*/evals/evals.json` to find them.
7. **README.** Update the Prerequisites and the "Which skill version do I need?" table.
8. **Verify.** Run `bash skills/apimatic-portal/check.sh` and the evals, then tag a release.

## Keeping up with CLI releases

The skills describe a specific CLI behavior, so check each CLI v2 release for changes the skills need:

- Release notes: https://github.com/apimatic/apimatic-cli/releases
- Docs: https://docs.apimatic.io/v4 (they can lag behind the CLI; when they disagree, the CLI's release notes and `--help` output are what users will see)

Look in particular for an "Upgrading from …" section in the release notes. Those list breaking changes, such as the root `nav.json` `tabs` key (2.0.0-beta.3) and the single OAuth callback page (2.0.0-beta.5).
