---
name: apimatic-sdk
description: Use when a user wants to generate, create, customize, or download an SDK using the APIMatic CLI. Also use when the user has already customized a generated SDK and wants to save those changes, when the user wants to make a specific change to an SDK (e.g. "change the analyzer", "switch the linter"), or when the user asks about CodeGen settings, SDK configuration, or APIMATIC-META.json (e.g. "enable retry on timeout", "disable linting", "set the project name").
---

# APIMatic SDK

Generate SDKs for your APIs in multiple languages using the APIMatic CLI.

## When to Use

- User wants to create, generate, or download an SDK using the APIMatic CLI
- User wants to customize an SDK, asks about custom code injection, or wants to preserve customizations across regenerations
- User mentions `sdk save-changes` or asks how to save SDK changes
- User says they have already customized a generated SDK and want to save or commit those changes
- User asks to customize an SDK in a specific way (e.g. "change the analyzer", "switch the linter", "update the formatter in the PHP SDK")
- User asks to change a CodeGen setting (e.g. "enable retry on timeout", "set the project name", "disable linting", "change the timeout", "enable HTTP cache") — these can be applied via `APIMATIC-META.json` and a regeneration

## Red Flags — STOP and re-read the relevant section

- About to pass the spec file path to `--input` → `--input` must point to the parent directory that contains `src/`, not the spec file itself (e.g., `--input=./my-project`, not `--input=./openapi.yaml`) → commands run from project root, never from inside `src/`
- About to add `--zip` when the user didn't ask for it → only include `--zip` if the user explicitly requested a zip download
- About to rerun `sdk generate` with `--force` without asking → when the CLI reports an SDK already exists, ask the user before adding `--force`
- About to `cd src/` before running generate → run from the project root (the directory that _contains_ `src/`), never from inside `src/`
- About to proceed to SDK generation before the user confirms browser auth → wait for user confirmation after launching browser login, then verify with `apimatic auth status`
- About to run `sdk save-changes` without `--track-changes` having been enabled → change tracking must be initialized during generation; regenerate with `--track-changes` first
- About to add `--api-version` when user hasn't mentioned a specific API version → only include `--api-version` when the user explicitly names a version
- About to ask for information the user already stated in their prompt → use what was given; only ask for genuinely unknown values
- About to edit a generated SDK file for a change that could be a CodeGen setting → read each file in `references/` that covers settings (e.g. `endpoint-settings.md`, `http-configuration-settings.md`, `timeout-and-retries-settings.md`, `sdk-interface-customization-settings.md`, etc.) and check whether the change maps to a listed setting; if it does, update `APIMATIC-META.json` and regenerate instead of modifying generated files
- About to pick the first matching CodeGen setting without reading all reference files → read all reference files first, then pick the most suitable match
- About to manually delete or remove a generated folder or file (e.g., `docs/`, `README.md`) as a customization → check codegen settings first; (e.g., removing docs maps to `DisableDocs: true` in `APIMATIC-META.json`) — set this before generating, not after via file deletion or custom code injection
- About to open, read, or edit the `.<language>` files inside `sdk-source-tree/` (e.g., `.typescript`, `.python`) → these files are managed exclusively by the CLI; never touch them directly under any circumstance
- About to manually compare or inspect customizations by reading `sdk-source-tree/` → if the user wants to see what changed between a plain generation and their customized one, regenerate using `--skip-changes` to produce a clean copy, then compare that against the customized SDK; do not manipulate or read the source tree files

## Communication Guidelines

This skill is used by developers of all experience levels. All messages shown to the user must be clear, non-technical, and action-oriented. Follow these rules in every response:

- **Never forward raw CLI output:** Do not paste or quote terminal output, spinner characters, ANSI escape codes, or build logs. Summarize what happened in plain language.
- **Use the verbatim blocks provided:** When this skill provides a specific message to show, output it exactly as written. Do not paraphrase or add technical context around it.
- **Keep error guidance actionable:** When something fails, tell the user what went wrong in simple terms and what they can do about it. Do not describe the internal recovery steps you are attempting — just attempt them silently and report the outcome.
- **When in doubt, less is more:** If you are unsure whether a detail is useful to the user, leave it out.

## Fast Path — Already-Customized SDK

If the user's message indicates they have **already made customizations** to a generated SDK and want to save those changes (e.g. "I customized my SDK", "I made changes to the generated SDK", "save my SDK changes", "save changes in it"):

1. Confirm the Prerequisites section below is satisfied (Node.js, CLI installed).
2. Complete Step 1: Authenticate with APIMatic below.
3. **Check for `sdk-source-tree`** — see the [SDK Source Tree Check](#sdk-source-tree-check) section below.

## Fast Path — Apply a Specific Customization to an SDK

If the user asks Claude to make a specific change to an SDK (e.g. "change the phan analyzer to something else", "switch the linter in my PHP SDK", "update the test framework in my TypeScript SDK"):

1. Confirm the Prerequisites section below is satisfied (Node.js, CLI installed).
2. Complete Step 1: Authenticate with APIMatic below.
3. **Check if the change is a CodeGen setting first** — see the [CodeGen Settings Check](#codegen-settings-check) section below. If the change maps to a CodeGen setting, follow that path instead.
4. If the change is not a CodeGen setting, **check for `sdk-source-tree`** — see the [SDK Source Tree Check](#sdk-source-tree-check) section below.

Do not ask whether the user wants to customize or save — they have already told you what change to make. Proceed without prompting unless something is genuinely unknown.

## CodeGen Settings Check

Before editing any generated SDK files for a customization, check whether the change can be applied as a CodeGen setting in `APIMATIC-META.json`.

Read each of the following reference files one by one and check whether the requested change maps to a setting described in that file. Read all of them before deciding — pick the most suitable match:

- `references/user-agent-settings.md`
- `references/code-branding-settings.md`
- `references/endpoint-settings.md`
- `references/enum-settings.md`
- `references/exception-settings.md`
- `references/http-configuration-settings.md`
- `references/miscellaneous-settings.md`
- `references/model-settings.md`
- `references/sdk-docs-configuration-settings.md`
- `references/sdk-interface-customization-settings.md`
- `references/serialization-settings.md`
- `references/timeout-and-retries-settings.md`

**If a matching setting is found in any of those files:**

Follow the numbered steps in that reference file to apply the setting and verify the output. Then continue below:

1. If the input directory is not already known, ask: "What is the path to the directory that contains the `src/` folder?"
2. Open `<input-dir>/src/spec/APIMATIC-META.json`. If this is a fresh project being scaffolded (the main Step 2 — Determine the input directory — is in progress), note the setting and apply it to `APIMATIC-META.json` as part of scaffolding — then continue to generation. If the file does not exist and the project should already have it, follow `references/first-time-setup.md` to scaffold the project first.
3. Locate the `CodeGenSettings` object. Add or update the relevant key with the appropriate value.
4. Save the file.
5. Regenerate the SDK — proceed from [Step 3 to Step 7](#step-3-choose-the-language), skip the steps for which you have the values already known (language, destination, and API version).

This is always the preferred approach when a CodeGen setting covers the request. Settings applied this way are baked into the generation config and survive every future regeneration — no manual file edits required.

**If the setting is not listed there:**

Continue to the [SDK Source Tree Check](#sdk-source-tree-check) for file-level customization.

---

## SDK Source Tree Check

Look for `<input-dir>/sdk-source-tree/` and within it a file named after the target language (e.g. `.php`, `.typescript`, `.python`).

**If `sdk-source-tree` is present and has an entry for the target language:**

Proceed directly to `references/save-changes.md`.

**If `sdk-source-tree` is absent or has no entry for the target language:**

Change tracking has never been initialized. Follow Steps 2 through 7 below to generate the SDK with `--track-changes`. Use any values already known from context (language, input dir, API version) — do not ask for them again. Only ask for values that are genuinely unknown.

There is one additional concern depending on context:

- **User has already made customizations (Fast Path — Already-Customized SDK):**
  The SDK must **not** be generated into the same folder as the user's existing customized SDK — doing so will overwrite their changes. Before running Step 7, ask only for the destination: "Change tracking isn't enabled for this SDK yet. I need to run a fresh generation to initialize it, but generating into your current SDK folder would overwrite your changes. Would you like me to use a temporary folder, or do you have a preferred destination?"
  - If user provides a path → use it as `--destination` in Step 4.
  - If user says temporary/default → use `<input>/sdk/temp/<language>` as `--destination` in Step 4. After generation, delete the `<input>/sdk/temp` directory — it is not needed.
    After Step 7 completes, follow `references/save-changes.md` with `--sdk` pointing at the user's **original** customized SDK path, so their customizations are captured — not the temp output.

- **Claude is applying the customization (Fast Path — Apply a Specific Customization):**
  No destination conflict — proceed through Steps 2–7 normally with `--track-changes`. After generation, apply the requested customizations to the generated SDK following the [Customization Guidelines](#customization-guidelines) section, then follow `references/save-changes.md`.

---

## Prerequisites

Confirm these are in place before starting:

- **Node.js >= 20 and npm installed**
  If not installed, download from https://nodejs.org (LTS version recommended). Verify with:

  ```
  node --version
  ```

- **APIMatic account**
  Free trial available at app.apimatic.io. Required for authentication.

- **APIMatic CLI installed globally:**

  ```
  npm install -g @apimatic/cli
  ```

  Verify the CLI is available:

  ```
  apimatic --version
  ```

  If the version command fails, the CLI is not installed. Re-run the install command above.

---

## Step 1: Authenticate with APIMatic

First check whether the user is already authenticated:

```
apimatic auth status
```

If the output shows an account email, authentication is already in place — skip to Step 2.

**Primary flow (browser-based):**

Run the auth launcher script from the project directory. It spawns `apimatic auth login` as a detached process so the terminal does not block:

```
node {skill_dir}/scripts/auth-login.mjs
```

Where `{skill_dir}` is the absolute path to the directory containing the `apimatic-sdk` skill file (the `auth-login.mjs` script lives there).

The script launches the browser OAuth flow and immediately returns. Relay the following message to the user: "A browser window has opened. Complete sign-in in the browser, then confirm here when done."

Wait for the user to confirm sign-in is complete before proceeding.

After confirmation, verify auth succeeded:

```
apimatic auth status
```

The output should show the account email. If it does not, authentication did not complete — try the fallback below.

**Fallback flow (API key):**

Use this when browser auth is not available (CI environment, headless system) or when the user prefers a key-based approach.

Option 1 — CLI flag:

```
apimatic auth login --auth-key=YOUR_API_KEY
```

Option 2 — environment variable (no login command needed):

```bash
# macOS / Linux / bash / zsh:
export APIMATIC_API_KEY=YOUR_API_KEY

# Windows PowerShell:
$env:APIMATIC_API_KEY = "YOUR_API_KEY"

# Windows Command Prompt:
set APIMATIC_API_KEY=YOUR_API_KEY
```

API keys are generated at: APIMatic Dashboard > Account > API Keys.

**If both methods fail:**

Stop the workflow. Tell the user:

"Authentication failed. Check that your APIMatic account is active, your API key is correct, and you have internet access to apimatic.io. If using browser login, try the --auth-key fallback instead."

Do not proceed past this point until authentication is confirmed.

## Step 2: Determine the input directory

If you do not know whether the user has an existing project with a `src/` folder, ask:

"Is this your first time generating an SDK for this API, or have you generated one before?"

- **Has a `src/` folder →** Ask: "What is the path to the directory that contains the `src/` folder?"
  The `--input` flag will point to this directory.

- **Starting from scratch →** Read `references/first-time-setup.md` and follow every step in order to scaffold the project directory with `src/spec/`, the user's API spec, and `APIMATIC-META.json`. Then continue to Step 3.

## Step 3: Choose the language

If the language is not already known from context, ask the user which language they want to generate the SDK in. Present the supported options:

| Flag value   | Language   |
| ------------ | ---------- |
| `csharp`     | C#         |
| `java`       | Java       |
| `php`        | PHP        |
| `python`     | Python     |
| `ruby`       | Ruby       |
| `typescript` | TypeScript |
| `go`         | Go         |

## Step 4: Choose the destination

If the destination is not already known from context, ask: "Do you have a specific path where you want the SDK to be generated, or should I use the default location?"

- **User provides a path →** Use the `--destination` flag with the given path.
- **User says default / no preference →** Omit the `--destination` flag. The SDK will be generated at `<input>/sdk/<language>` (or `<input>/sdk/<api-version>/<language>` if multiple API versions exist).

## Step 5: Choose the API version

Check whether the user wants to generate the SDK for a specific API version. Look for phrases like "versioned build", "specific version", "for version X", "v2", "api version", or any mention of targeting a particular version of their API.

- **User specifies a version →** Add `--api-version=<version>` to the generate command (e.g., `--api-version=v2`).
- **User doesn't mention versioning →** Omit the `--api-version` flag. Do not ask.

## Step 6: Customization intent

If the user has already described a specific change they want (e.g., "remove the docs folder", "disable documentation", "set the project name", "disable linting"), **check codegen settings first** — see the [CodeGen Settings Check](#codegen-settings-check) section, which will have you scan the individual reference files — before planning any manual file edits or deletions or additions.

If the change maps to a CodeGen setting:

- **New project (being scaffolded now):** Apply the setting to `APIMATIC-META.json` before generating. The setting is baked in from the start — no post-generation editing needed.
- **Existing project (already has `APIMATIC-META.json`):** Apply the setting now and regenerate. The setting takes effect automatically.

**Never plan to apply a CodeGen-covered customization by manually editing or deleting or adding generated files.** For example, "remove the docs folder" maps to `DisableDocs: true` — the correct fix is to set it before generation, not to delete the output folder afterward as a custom code injection.

If the change does not map to any CodeGen setting, continue below.

If not already known from context, ask: "Would you like to customize the SDK after generating it? (e.g., add custom code, modify generated files)"

- **User says yes →**

  Ask: "Do you already have a generated SDK you've customized, or are you starting fresh?"
  - **Already has a customized SDK →** Skip generation entirely. Ask: "Would you like me to apply the customizations, or will you handle them yourself?" then follow the appropriate path below.
  - **Starting fresh →** Add the `--track-changes` flag to the generate command. After generation completes in Step 7, ask: "Would you like me to apply the customizations, or will you handle them yourself?" then follow the appropriate path below.

  **If the skill applies customizations:**

  Ask the user what changes they want made. Apply them following the [Customization Guidelines](#customization-guidelines) section at the bottom of this file. Once the changes are in place, follow `references/save-changes.md`. See `examples/generate-customize-save.md` for the expected flow of commands — flags and paths will differ based on the user's setup.

  **If the user applies customizations:**

  See `examples/generate-customize-save.md` for the expected flow of commands — flags and paths will differ based on the user's setup.

  Share these tips before handing off:

  > - Add custom logic in a **new file** where possible — new files are never overwritten on regeneration.
  > - Avoid editing generated files directly.
  > - If you must edit a generated file, add your changes at the **top or bottom** to reduce merge conflicts.

  Then prompt: "Make your customizations now, then let me know when you're ready to save them." Once they confirm, follow `references/save-changes.md`.

- **User says no / no preference →** Omit the `--track-changes` flag.

## Step 7: Generate the SDK

Navigate to the project root (the directory that contains `src/`):

```
cd your-project-directory
```

Run the generate command with the chosen language:

```
apimatic sdk generate --language=<language>
```

To specify the input directory explicitly (the parent directory containing `src/`):

```
apimatic sdk generate --input=path/to/parent-of-src --language=<language>
```

**With an API key directly (recommended for CI — no interactive auth needed):**

```
apimatic sdk generate --input=path/to/parent-of-src --language=<language> --auth-key=YOUR_API_KEY
```

**If SDK generation fails:**

1. **Authentication error:** Re-run `apimatic auth status` to verify. If expired, re-authenticate (Step 1).
2. **Missing `src/` folder or spec file:** Check that the input directory contains a `src/` folder with the API spec in `src/spec/`.
3. **SDK already exists at destination:** The CLI will refuse to overwrite. Immediately ask the user: "An SDK already exists at the destination. Would you like to overwrite it?" If yes, re-run the same command with `--force` appended (see Additional flags). If no, ask for a different destination path and re-run with `--destination=<new-path>`.
4. **`apimatic` command not found:** Run `npm install -g @apimatic/cli` and verify with `apimatic --version`.
5. **Any other error:** Read the exact error message from the CLI output. Do not retry automatically — diagnose the specific error first.

## Additional flags

- `--force, -f` : Overwrite if an SDK already exists in the destination. Use for repeated CI builds.
- `--zip` : Download the generated SDK as a .zip archive instead of a directory.
- `--track-changes` : Enable change tracking to preserve manual customizations across regenerations. Must be used during the initial generation to set up the source tree. See `references/save-changes.md` for how to save changes after generation.
- `--skip-changes` : Generate the SDK without reapplying saved customizations, even if change tracking is enabled. Use when the user wants to preview the plain generated output. Saved customizations are not modified and will still be applied in future runs unless explicitly removed.

## Customization Guidelines

Apply these principles whenever you are making SDK customizations on the user's behalf, and share them as tips when the user is customizing themselves.

1. **Add custom logic in a new file** where possible.
2. **Avoid editing generated files directly.**
3. **If you must edit a generated file**, add your changes at the top or bottom to reduce merge conflicts.

---
