# Maintaining the APIMatic skills

Notes for the people who maintain this repository. Users of the skills should start with [README.md](README.md).

## Skill versions and branches

| Branch | Targets | Notes |
|--------|---------|-------|
| `main` | APIMatic CLI v2 (`@apimatic/cli`), docs at https://docs.apimatic.io/v4 | Day-to-day development. |
| `v1` | APIMatic CLI v1 (`@apimatic/cli@1`) | Maintenance only. Branched from the `v1.0.0` tag. |

To fix a v1 skill, branch from `v1`, open the pull request against `v1`, and tag the merge as the next `v1.0.x`. Port a fix to `main` only if it also applies to CLI v2.

## Keeping up with CLI releases

The skills describe a specific CLI behavior, so check each CLI v2 release for changes the skills need:

- Release notes: https://github.com/apimatic/apimatic-cli/releases
- Docs: https://docs.apimatic.io/v4 (they can lag behind the CLI; when they disagree, the CLI's release notes and `--help` output are what users will see)

Look in particular for an "Upgrading from …" section in the release notes. Those list breaking changes, such as a new required key in `nav.json` or a new redirect URI to register.
