---
name: apimatic-portal
description: Use when a user wants to build, generate, configure, customize, or publish an APIMatic developer portal. Also use when the user asks about portal theme, navigation, API Copilot, LLMs.txt, SEO, custom pages, dynamic configurations, context plugins, header/footer customization, or API recipes in an APIMatic Docs as Code project.
---

# APIMatic Portal

Guide a user from zero to a running local developer portal. Execute these steps in order. The skill body IS the instructions — run each command directly; do not ask the user to run CLI commands unless explicitly noted.

## When to Use

- User wants to create, serve, build, or deploy an APIMatic developer portal
- User asks to configure theme, colors, fonts, navigation, SEO, LLMs.txt, API Copilot, dynamic configs, context plugins, custom pages, header/footer, or API recipes
- User has a `src/APIMATIC-BUILD.json` or is setting one up

**When NOT to use:** Non-APIMatic portals (Docusaurus, ReadMe, etc.) — this skill covers only the Docs as Code Portals built using the `@apimatic/cli` toolchain.

## Red Flags — STOP and re-read the relevant section

- About to `cd src/` before running a portal command → commands run from project root, never from inside `src/`
- About to nest `recipes.workflows` inside `generatePortal` → it is a top-level sibling, not nested
- About to nest `apiCopilotConfig` inside `generatePortal` → it is a top-level sibling, not nested
- About to use an absolute URL (`/guides/...` or `https://...`) in a `<Card>` internal link → use `page:` prefix (e.g., `url="page:guides/getting-started"`)
- About to show `"enableConsoleCalls": true` while describing how to disable the playground → the value to show is `false`
- About to use raw language names (`"python"`, `"typescript"`, `"csharp"`) as `languageSettings` keys → use template name identifiers only (e.g., `python_generic_lib`, `typescript_generic_lib`)


## Prerequisites

Confirm these are in place before starting:

- Node.js >= 20 and npm installed
- APIMatic account (free trial available at app.apimatic.io)
- APIMatic CLI installed globally:

```
npm install -g @apimatic/cli
```

- Verify the CLI is available:

```
apimatic --version
```

If the version command fails, the CLI is not installed. Re-run the install command above.

## Step 1: Authenticate with APIMatic

**Primary flow (browser-based):**

Run the auth launcher script from the project directory. It spawns `apimatic auth login` as a detached process so the terminal does not block:

```
node {skill_dir}/scripts/auth-login.mjs
```

Where `{skill_dir}` is the absolute path to the directory containing this skill file.

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

## Step 2: Determine setup path and get spec location

If you do not know whether the user is starting from scratch or has an existing project, ask these two questions before continuing:

1. "Do you already have an APIMatic portal project directory with a `src/` folder, or are you starting from scratch?"
   - **No `src/` yet (new project) → follow Path A**
   - **`src/` already exists → follow Path B** (skip spec question below)

2. If following Path A, ask: "What is the path to your API specification file? (OpenAPI JSON/YAML, Postman collection, or other supported format)"

Store the spec path. You will need it to bootstrap the Portal.

---

## Path A: First-Time Setup (Guided Onboarding)

Read `references/first-time-setup.md` and follow every step in order. Do not skip steps or summarize — execute each step exactly as written.

---

## Path B: Subsequent Local Development

Use this path when a build directory (`src/`) already exists from a previous quickstart run or manual setup.

### Step 3B: Navigate to the project root

The project root is the directory that contains the `src/` folder — not inside `src/` itself.

```
cd your-project-directory
```

### Step 4B: Start the local dev server

First check whether a server is already running from a previous session:

```
node {skill_dir}/scripts/serve.mjs status
```

If a running process is detected, ask the user whether to reuse it or stop and restart — do not blindly start a second instance.

If no server is running, start it:

```
node {skill_dir}/scripts/serve.mjs start --input ./
```

Where `{skill_dir}` is the absolute path to the directory containing this skill file, and `--input` is the project root (the directory containing `src/`).

The script spawns `apimatic portal serve` and streams its output live — the user sees build progress (and any errors) in real time. The script exits automatically once the local URL line appears. When the URL appears, surface it to the user and append the shutdown reminder at the end of this response and every subsequent response while the server is running:

"Your portal is running at http://localhost:3000"

> Portal server is running. It will stop automatically after 30 minutes of inactivity. To stop it now, tell me: **"shut down the portal"**

**Additional serve subcommands:**

Check server status and recent logs:

```
node {skill_dir}/scripts/serve.mjs status
```

Stop the server:

```
node {skill_dir}/scripts/serve.mjs stop
```

**If portal serve fails:**

1. **Port conflict (EADDRINUSE):** The script automatically retries on the next port up to 3 times (3000 → 3001 → 3002). If all three ports are in use, the script prints an error — ask the user to free a port or provide one manually, then retry with `--port=NNNN`.

2. **Missing spec file:** Check that `src/spec/` contains the API spec file. If missing, copy the user's spec file there and retry.

3. **`apimatic` command not found:** The script prints install instructions. Run `npm install -g @apimatic/cli` and verify with `apimatic --version`, then retry.

4. **Permission error or script cannot run:** The script prints the specific error and path. If the error cannot be resolved automatically, tell the user:

   > "I was unable to start the portal server automatically due to a permissions or environment issue. To start it manually, run this command in your project root (the directory that contains `src/`):
   >
   > `apimatic portal serve`
   >
   > Once you see a URL like `http://localhost:3000` in your terminal, come back here and tell me the server is running."

   Then ask the user: "Is the server running? What URL do you see? (e.g. http://localhost:3000, a different port, or tell me if you got an error)"

5. **Any other error:** Read the exact error message from the CLI output above. Do not retry automatically — diagnose the specific error first.

---

## CI / Production Builds

Use `apimatic portal generate` (without serve) when building for CI pipelines or production deployment. This builds the portal output without starting a local server.

```
apimatic portal generate
```

**With an API key directly (recommended for CI — no interactive auth needed):**

```
apimatic portal generate --auth-key=YOUR_API_KEY
```

The generated portal files are written to `./portal/` by default. Use `--destination` to specify a different output directory:

```
apimatic portal generate --destination=./dist/portal
```

**GitHub Actions pattern:**

Set `APIMATIC_API_KEY` as a repository secret, then pass it via `--auth-key` in your workflow step. A complete sample workflow is available at: github.com/apimatic/sample-docs-as-code-portal

**Additional flags:**
- `--force, -f` : Overwrite if a portal already exists in the destination. Use for repeated CI builds.
- `--zip` : Download the generated portal as a .zip archive instead of a directory.

---

## Quick Reference

| Task | Command / Location |
|------|-------------------|
| First-time setup | Download sample portal and scaffold `src/` — see [Path A](#path-a-first-time-setup-guided-onboarding) |
| Start local dev server | `node {skill_dir}/scripts/serve.mjs start --input ./` |
| Server status / stop | `node {skill_dir}/scripts/serve.mjs status` / `stop` |
| Build for CI/production | `apimatic portal generate --auth-key=KEY` |
| Regenerate toc.yml | `apimatic portal toc new` |
| Configure API Copilot | `apimatic portal copilot` (wizard) |
| Scaffold a recipe | Follow the [API Recipes](#api-recipes) section below |
| Theme / colors / fonts | `generatePortal.portalSettings.theme` in `APIMATIC-BUILD.json` |
| SEO mode | `generatePortal.baseUrl` + `generatePortal.indexable: {}` |
| LLMs.txt | `generatePortal.baseUrl` + `generatePortal.llmsContextGeneration.enable: true` |
| Custom markdown page | Create `.md` in `src/content/`, then `apimatic portal toc new` |
| Custom header HTML | `src/components/header.html` (replaces default portal header) |
| Custom footer HTML | `src/components/footer.html` |
| Inject CSS into `<head>` | `generatePortal.headIncludes` in `APIMATIC-BUILD.json` |
| Inject JS before `</body>` | `generatePortal.tailIncludes` in `APIMATIC-BUILD.json` |
| Dynamic auth (runtime) | `APIMaticDevPortal.ready({ setConfig })` + `generatePortal.tailIncludes` |
| Context Plugins (IDE AI) | `portalSettings.languageSettings.<lang>.aiIntegration` |

---

## Portal Configuration

After generating a working portal (Path A or B), configure appearance and content by editing `src/APIMATIC-BUILD.json` and `src/content/` files.

**After making any change**, follow this two-step preview protocol:

**Step 1 — Check that the server is running:**

Run:

```
node {skill_dir}/scripts/serve.mjs status
```

- Output contains `Running (PID` → server is live. Continue to Step 2.
- Output contains `No server running` or stale PID → ask the user: "No preview server is running. Would you like me to start it now so you can preview your changes?"
  - User says yes → run `node {skill_dir}/scripts/serve.mjs start --input ./`. Once the URL appears, surface it, append the shutdown reminder, then continue to Step 2.
  - User says no → skip Step 2 and continue without a preview.

**Step 2 — Wait for regeneration to complete:**

Inform the user: "Your changes have been saved. The portal is regenerating — this typically takes 15–60 seconds. Watching for completion..."

Then run:

```
node {skill_dir}/scripts/serve.mjs watch
```

- Exit code 0 → relay to the user: "Your portal has been successfully regenerated. Open http://localhost:3000 in your browser to review the changes."
- Exit code 1 (timeout) → tell the user: "Portal generation is still in progress — it's taking longer than usual. Refresh your browser in a moment to see the changes once it completes."

Apply this protocol after every configuration change in any sub-section below.

**If `apimatic portal serve` fails after a config change**, stop and read the exact error message from the CLI output before retrying. Common causes: malformed JSON in `APIMATIC-BUILD.json` (missing comma, mismatched brace) or a `portalSetting` key that does not exist. Fix the specific error, then re-run serve.

### Theme

Edit `portalSettings.theme` inside `generatePortal` in `APIMATIC-BUILD.json` to set colors, typography, base theme, and dark mode behavior.

For **runtime theme switching** (e.g., syncing with a host application's dark/light toggle), use the Theme Control Hook — `window.APIMaticDevPortal.setThemeMode('light' | 'dark')`. This is triggered externally from your application, not via the build file.

Read `references/theme-and-appearance.md` for all theme fields, accepted values, the complete `colorMode` object structure, and the Theme Control Hook integration guide.

### API Copilot

Prompt the user to run the interactive wizard — it updates `APIMATIC-BUILD.json` automatically:

```
apimatic portal copilot
```

**Step aside — the CLI handles all prompts directly with the user.** Do not intercept or answer the wizard prompts on the user's behalf. The wizard will ask for the subscription key and an optional welcome message, then write the copilot block to `APIMATIC-BUILD.json`. Copilot can only be active on one portal at a time.

Read `references/copilot-and-ai.md` for the written configuration block and indexing time expectations.

### LLMs.txt

Add `baseUrl` and `llmsContextGeneration` to `generatePortal` in `APIMATIC-BUILD.json`. Set `baseUrl` to the production domain, not `http://localhost:3000`.

Read `references/copilot-and-ai.md` for the exact field names, values, and verification steps.

### SEO

Add `baseUrl` and `indexable` to `generatePortal` in `APIMATIC-BUILD.json`. `baseUrl` is required and must be the production URL.

Read `references/seo-and-discovery.md` for the full list of generated files, required fields, and deployment guidance.

### Navigation (toc.yml)

Edit `src/content/toc.yml` directly to reorder sections or add manual entries. To regenerate it from current files:

```
apimatic portal toc new
```

The wizard overwrites the existing `toc.yml` — review the output after running.

Read `references/navigation-and-content.md` for the full toc.yml format including groups, dirs, generated sections, and custom UI component syntax.

### Custom Markdown Pages

Create a `.md` file in `src/content/guides/` (or any subdirectory of `src/content/`), then run `apimatic portal toc new` to update navigation.

Read `references/navigation-and-content.md` for the custom UI component list and syntax examples.

### Context Plugins for AI assistants (AI Integration)

Context Plugins give developers one-click access to your API's SDK context directly inside their IDE — Cursor, VS Code, or Claude Code. Once installed, AI assistants in those IDEs can generate accurate, SDK-specific code completions without the developer leaving their editor.

**Prerequisites:**
- API Copilot must be configured with a valid key (`portalSettings.copilot.key`) — Context Plugins use Copilot infrastructure
- SDKs must be published (not just generated)

**Configuration:** Add `aiIntegration` under `portalSettings.languageSettings` for each SDK language you want to support. The language key must be the APIMatic SDK template name identifier (e.g., `python_generic_lib`, `typescript_generic_lib`, `java_eclipse_jre_lib`).

> **Warning:** NEVER use raw language names (`"python"`, `"typescript"`, `"csharp"`, etc.) as `languageSettings` keys — they will be silently ignored. Always use the full template name identifier. Do not mention raw language names in explanatory text either.

When adding `languageSettings` for the first time, also ask the user which language should be shown by default and set `initialPlatform` in `portalSettings`:

```json
{
  "generatePortal": {
    "portalSettings": {
      "initialPlatform": "python_generic_lib",
      "languageSettings": {
        "python_generic_lib": { }
      }
    }
  }
}
```

```json
{
  "portalSettings": {
    "languageSettings": {
      "python_generic_lib": {
        "aiIntegration": {
          "cursor": { "isEnabled": true },
          "vscode": { "isEnabled": true },
          "claudeCode": { "isEnabled": true }
        }
      }
    }
  }
}
```

Enable only the IDEs you want to support — each `isEnabled: true` adds the corresponding integration button in the portal's SDK Reference section. After updating the config, regenerate the portal with `apimatic portal generate` or `apimatic portal serve`.

See `examples/comprehensive-build.json` for a complete `languageSettings` + `aiIntegration` example covering multiple languages.

### Dynamic Configurations

There are two mechanisms — use the right one for the task:

**Runtime JS (for auth credentials, OAuth tokens, dynamic config values):**

Use `APIMaticDevPortal.ready(({ setConfig }) => setConfig({...}))` to inject values at portal load time. Create a JS file in `src/static/` and inject it via `generatePortal.tailIncludes`:

```javascript
// src/static/scripts/config.js
APIMaticDevPortal.ready(({ setConfig }) =>
  setConfig((defaultConfig) => {
    return {
      ...defaultConfig,
      auth: {
        oauth_2_0: {
          OAuthClientId: "your-client-id",
          OAuthClientSecret: "your-client-secret",
          OAuthRedirectUri: "https://your-app.com/callback",
          OAuthToken: "",
          OAuthScopes: ["read"],
        },
      },
    };
  })
);
```

```json
{
  "generatePortal": {
    "tailIncludes": "<script defer src='static/scripts/config.js'></script>"
  }
}
```

Read `references/dynamic-configurations.md` for the full `setConfig` callback reference, discovering available properties, and a complete consolidated example.

### Header and Footer Customization

There are two distinct mechanisms. Use the right one for the job:

| Goal | Mechanism |
|------|-----------|
| Replace the portal header with custom HTML | `src/components/header.html` |
| Add a footer | `src/components/footer.html` |
| Load custom CSS on every page | `generatePortal.headIncludes` — injected into `<head>` |
| Load custom JS / analytics | `generatePortal.tailIncludes` — injected just before `</body>` |

**IMPORTANT:** `headIncludes` and `tailIncludes` are for CSS and JS only — never put header or footer HTML markup in them. `tailIncludes` injects at the bottom of the page; any HTML placed there will appear as a footer, not a header.

#### Replacing the portal header

Create `src/components/header.html`. This file fully replaces the default APIMatic portal header.

**CRITICAL:** APIMatic automatically wraps the contents of `header.html` in `<div class="portal-header">`. Do NOT include that wrapper in your file, Write only the inner content:

```html
<!-- header.html — do NOT add a portal-header wrapper, APIMatic adds it automatically -->
<div class="custom-header-inner">
  <!-- your header content goes here -->
</div>
```

Similarly, create `src/components/footer.html` to add a footer. APIMatic wraps it in `<div class="portal-footer">` automatically — same rule applies:

```html
<!-- footer.html — do NOT add a portal-footer wrapper, APIMatic adds it automatically -->
<div class="custom-footer-inner">
  <!-- your footer content goes here -->
</div>
```

The `src/components/` directory sits alongside `src/content/`, `src/spec/`, and `src/static/`:

```
src/
├── components/
│   ├── header.html
│   └── footer.html
├── content/
├── spec/
├── static/
└── APIMATIC-BUILD.json
```

#### Loading CSS and JS for your components

Place CSS and JS files in `src/static/` and reference them in `APIMATIC-BUILD.json`:

```json
{
  "generatePortal": {
    "headIncludes": "<link rel=\"stylesheet\" href=\"./static/custom.css\">",
    "tailIncludes": "<script src=\"./static/custom.js\"></script>"
  }
}
```

For complete worked examples see `examples/components/header.html` and `examples/components/footer.html`.

### Versioned Portals

When the user needs multiple versions of their documentation (e.g., v1.0 and v2.0) with a version selector in the portal:

> **Critical:** The outer `APIMATIC-BUILD.json` for a versioned portal uses `generateVersionedPortal` — **not** `generatePortal`. Never include `generatePortal.apiSpecs` or any `generatePortal` fields in the outer file.

Read `references/versioned-portals.md` for the full directory structure, outer build file format, per-version build file format, and migration steps.

---

### API Recipes

The CLI provides an interactive wizard (`apimatic portal recipe new`) for creating API Recipes. The wizard is interactive — it prompts the user directly, so the agent cannot drive it. Create recipes manually instead.

When creating a recipe manually (without the CLI wizard), four things are required:
1. Create `src/content/recipes/RecipeName.md` (at least one line of content)
2. Add a `page:` entry in `toc.yml` pointing to `recipes/RecipeName.md`
3. Register in `APIMATIC-BUILD.json` under top-level `recipes.workflows` with `"permalink": "page:recipes/RecipeName"`
4. Create `src/static/scripts/recipes/RecipeName.js` using `export default function RecipeName(workflowCtx, portal)` returning a step object

Read `references/recipes.md` for the full registration schema, all step types, and a complete example.

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Running `apimatic portal serve` from inside `src/` | Run from the project root (the directory that *contains* `src/`) |
| Setting `baseUrl` to `http://localhost:3000` in a production build | Set to the real production domain (e.g., `https://developers.yourcompany.com`) |
| Nesting `recipes.workflows` inside `generatePortal` | `recipes` is a **top-level sibling** of `generatePortal`, not inside it |
| Nesting `apiCopilotConfig` inside `generatePortal` | `apiCopilotConfig` is a **top-level sibling** of `generatePortal` |
| JSON syntax error in `APIMATIC-BUILD.json` causing serve to fail | Read the exact CLI error; fix the specific line (missing comma, extra brace, wrong key name) |
| Recipe function exported as `async` or as named export | Must be `export default function RecipeName(workflowCtx, portal)` — not async, not named |
| Reading stepState without optional chaining | Always use `stepState?.["Step N"]?.data?.field` — never assume a step has completed |
| Wrapping `header.html` content in `<div class="portal-header">` | APIMatic adds this wrapper automatically — write only the inner content. Double-wrapping causes the default navbar to bleed through. |
| Putting header or footer HTML in `tailIncludes` | `tailIncludes` injects just before `</body>` (bottom of page). Use `src/components/header.html` to replace the portal header. |

---

## Reference Files

- `references/build-directory.md` — Build directory layout, `spec/` and `content/` directory rules, sample `toc.yml`, minimal `APIMATIC-BUILD.json` with field explanations, and guidance on which directory to run commands from.
- `references/theme-and-appearance.md` — Complete `portalSettings.theme` schema: colors, typography, baseTheme, `colorMode` object (`defaultMode`, `disableSwitch`), consolidated example, and the Theme Control Hook (`window.APIMaticDevPortal.setThemeMode`) for runtime theme switching.
- `references/versioned-portals.md` — Versioned portal directory structure, outer `APIMATIC-BUILD.json` using `generateVersionedPortal`, per-version build files using `generatePortal`, migration guide, and recommended practices.
- `references/copilot-and-ai.md` — API Copilot CLI wizard walkthrough, the written APIMATIC-BUILD.json copilot block, LLMs.txt `llmsContextGeneration` configuration, and production `baseUrl` warning.
- `references/seo-and-discovery.md` — SEO mode configuration (`indexable`, `baseUrl`), generated file list, and when to use SEO vs SPA mode.
- `references/navigation-and-content.md` — toc.yml format with all entry types, `apimatic portal toc new` usage, custom markdown page workflow, and custom UI component syntax.
- `references/dynamic-configurations.md` — Dynamic portal configurations using `APIMaticDevPortal.ready` with `setConfig`, discovering available properties via browser dev tools, `tailIncludes` script injection, and a complete consolidated example.
- `references/recipes.md` — Recipe registration schema (`recipes.workflows` in `APIMATIC-BUILD.json`), `.js` file authoring guide covering all step types (`showContent`, `showEndpoint`, `stepState`, `portal.setConfig`, `showConfettiAnimation`, `nextRecipe`), and a complete consolidated example.
- `examples/` — Comprehensive working examples: `comprehensive-build.json` (all configuration sections in one file), `toc.yml` (all navigation patterns), `complete-recipe.js` (all recipe step types in a real-world scenario), and `components/header.html` + `components/footer.html` (header/footer injection). Use these files as authoritative reference when writing portal configuration.

Read the relevant reference file when the user asks about any configuration area. Multiple reference files may apply for combined changes (e.g., SEO + LLMs.txt share `baseUrl`).
