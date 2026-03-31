# Plan: Fix APIMatic Portal Skill — Eval & QA Failures

## Context

The `apimatic-portal` skill was evaluated against 25 evals (evals.json) and received QA team feedback (qa-feedback.md). Current pass rate is 81% (126/156 assertions). 13 evals have failures, and QA identified 19 separate issues mapped to eval IDs. The skill needs fixes across reference files and SKILL.md to address these gaps.

---

## Failures Summary

### Group A — Wrong/missing property names in reference docs (fixes to reference files)

| Eval | QA # | Issue | Fix |
|------|-------|-------|-----|
| 17 | QA #4 | `disableModeSelector` is correct but assertion checks for `"disableSwitch": false` — the **reference** must use `disableSwitch` inside `colorMode` | Add `colorMode.disableSwitch` section to `theme-and-appearance.md` |
| 26 | QA #14 | Agent says HTTP→REST rename not supported; needs `"renameHttpToRest": true` in `generatePortal` | Add `renameHttpToRest` field to `build-directory.md` or SKILL.md |
| 28 | QA #16 | Agent uses recipe `verify` pattern; needs `"focusAuthSectionOnUnauthorizedError": true` in `portalSettings` | Add `focusAuthSectionOnUnauthorizedError` to `build-directory.md` or SKILL.md |
| 27 | QA #15 | Response shows `"enableConsoleCalls": true` while describing change; assertion `not-enable-console-calls-true` fails | Fix: response must not include the old `true` value; fix in SKILL.md guidance |
| 13 | QA #8 | In explanatory text, agent mentions raw language names (`"python":`, `"typescript":` etc.) triggering `not_contains_any` assertions | Fix: navigation-and-content or SKILL.md must warn: never use raw names in explanatory text |
| 21 | QA #9/10 | When adding `languageSettings`, agent must also ask about/add `initialPlatform` inside `portalSettings` | Add `initialPlatform` guidance to SKILL.md / reference |
| 19 | QA #6 | Agent uses `dynamicConfigurations` + `contextPlugins` (build-time) instead of `APIMaticDevPortal.ready + setConfig` (runtime JS) for dynamic auth | Add JS-based dynamic auth pattern to SKILL.md + new reference section |
| 30 | QA #18 | Agent configures theme statically via JSON; needs Theme Control Hook `window.APIMaticDevPortal.setThemeMode(type)` | Add Theme Control Hook reference to SKILL.md |

### Group B — TOC/navigation format fixes

| Eval | QA # | Issue | Fix |
|------|-------|-------|-----|
| 11 | QA #1 | toc.yml custom page entry must use `page:` + `file:` keys (not `generate:` + `from:`) | Fix `navigation-and-content.md` to show correct `page:` + `file:` format |
| 14 | QA #2 | Card internal URLs must use `page:` prefix (`url="page:guides/getting-started"`) not `/` or `https://` absolute paths | Fix Card component example in `navigation-and-content.md` |
| 31 | QA #19 | Outer versioned portal `APIMATIC-BUILD.json` example in response contains `generatePortal.apiSpecs` — it should not | Fix SKILL.md / add versioned-portal reference with explicit warning |

### Group C — Wizard step-aside language

| Eval | QA # | Issue | Fix |
|------|-------|-------|-----|
| 1 | — | `first-time-setup.md` says "step aside" but agent response doesn't say it clearly enough — assertion checks for specific phrases | Ensure `first-time-setup.md` Step A4 and SKILL.md Path A use one of: "step aside", "wizard will", "wizard prompts", "let the wizard" |
| 4 | — | Same issue for `apimatic portal recipe new` — agent doesn't use "step aside" language | Add explicit "step aside" instruction in SKILL.md API Recipes section |

### Group D — Missing context (from QA feedback not yet covered)

| QA # | Issue | Fix location |
|-------|-------|-------------|
| QA #3 | Page Configurations missing from portal setup | Add `pageTitle`, `navTitle`, `logoUrl`, `faviconUrl` to `build-directory.md` minimal config |
| QA #5 | Linking Context missing + Debug Report missing | Add linking context section to `navigation-and-content.md`; add debug report section to SKILL.md |
| QA #7 | `apiCopilotConfig` placed in wrong location in build file | Reinforce in `copilot-and-ai.md` and SKILL.md red flags |
| QA #11 | Agent says `useProxyForConsoleCalls` not configurable via BUILD | Add `useProxyForConsoleCalls` field to build-directory.md/SKILL.md |
| QA #12 | Agent says stability level tag not configurable via BUILD | Add stability level `languageSettings` field documentation |
| QA #13 | Missing `portalSettings.layout` context | Add `portalSettings.layout` to reference docs |
| QA #17 | Agent says `codeSampleApi` not configurable via BUILD | Add `codeSampleApi` top-level field (sibling of `generatePortal`) to SKILL.md |
| QA #19 | Missing Versioned Portal context | Add versioned portal reference (new reference file or section) |

---

## Files to Modify

### 1. `references/navigation-and-content.md`
- Fix the "Adding Custom Markdown Pages" section: replace the workflow showing `generate:` + `from:` with the correct `page:` + `file:` toc.yml entry format for custom markdown pages
- Fix the Card component example: use `url="page:guides/getting-started"` syntax (not absolute URL or root-relative `/`)
- Add a "Linking Context" section explaining how portal pages link to each other

### 2. `references/theme-and-appearance.md`
- Add `colorMode.disableSwitch` field documentation (the Theme Switch toggle, separate from `disableModeSelector` which locks the OS preference)
- Add the Theme Control Hook section: `window.APIMaticDevPortal.setThemeMode('light' | 'dark')` with availability check pattern

### 3. `references/build-directory.md`
- Add `renameHttpToRest: true` field under `generatePortal` (renames HTTP tab to REST in the portal)
- Add `focusAuthSectionOnUnauthorizedError: true` field under `portalSettings`
- Add `useProxyForConsoleCalls` under `portalSettings`
- Add `codeSampleApi` as a top-level sibling of `generatePortal`
- Add page configuration fields: `pageTitle`, `navTitle`, `logoUrl`, `faviconUrl`
- Add `portalSettings.layout` documentation
- Add stability level field to `languageSettings` docs

### 4. `references/copilot-and-ai.md`
- Reinforce that `apiCopilotConfig` is a **top-level sibling** of `generatePortal` (already documented, needs a red flag / stronger emphasis)

### 5. `SKILL.md`
- **Red Flags section**: Add red flags for:
  - About to put `apiCopilotConfig` inside `generatePortal`
  - About to use absolute URL (`/` or `https://`) in a `<Card>` internal link → use `page:` prefix
  - About to show old value while describing a change (e.g., show `"enableConsoleCalls": true` while saying "change it to false")
- **Path A**: Add explicit "step aside" phrase in quickstart wizard instruction
- **API Recipes section**: Add explicit "step aside" phrase for `apimatic portal recipe new`
- **Custom Markdown Pages section**: Add explicit warning that toc.yml custom pages use `page:` + `file:` keys, NOT `generate:` + `from:`
- **New section: Dynamic Auth (JS API)**: Document `APIMaticDevPortal.ready(({ setConfig }) => setConfig({ auth: {...} }))` pattern + `tailIncludes` reference
- **New section: Versioned Portals**: Add reference to versioned portal structure — outer file uses `generateVersionedPortal`, NOT `generatePortal`; add red flag
- **SDK Language Settings section**: Add `initialPlatform` — when adding `languageSettings` for first time, ask user for `initialPlatform` and add it to `portalSettings`
- **Portal Settings reference**: Add `focusAuthSectionOnUnauthorizedError`, `useProxyForConsoleCalls`, `layout`

### 6. New file: `references/versioned-portals.md`
- Full reference for versioned portal setup: outer `APIMATIC-BUILD.json` with `generateVersionedPortal.versions`, directory structure, per-version `APIMATIC-BUILD.json` (uses `generatePortal`)
- Explicit warning: outer file must NOT contain `generatePortal.apiSpecs`

### 7. `references/first-time-setup.md`
- Step A4: Add explicit "step aside" phrase: "Step aside — the wizard handles all prompts directly with the user."

---

## Detailed Fixes Per Failing Eval

### Eval 1 & 4 — Wizard step-aside language
**Files:** `references/first-time-setup.md` (Step A4), SKILL.md (Path A, API Recipes)
**Change:** Add exact phrase using one of: "step aside", "wizard will", "wizard prompts", "let the wizard", "CLI handles"

### Eval 11 — toc.yml custom page format
**File:** `references/navigation-and-content.md`
**Change:** In "Adding Custom Markdown Pages", show correct toc.yml entry:
```yaml
- page: overview
  file: guides/overview.md
```
Not `generate:` + `from:`.

### Eval 13 — Raw language names in explanatory text
**File:** SKILL.md (languageSettings guidance)
**Change:** Add warning: "NEVER use raw language names (`"python":`, `"typescript":`, etc.) as `languageSettings` keys — use template identifiers only. Do not mention raw names in explanatory text either."

### Eval 14 — Card internal URL format
**File:** `references/navigation-and-content.md`
**Change:** Fix Card component example to use `url="page:guides/getting-started"` and add note: "For internal portal pages, always use the `page:` prefix. Do NOT use root-relative paths (`url="/"`) or absolute URLs (`url="https://..."`) for links within the portal."

### Eval 17 — disableSwitch vs disableModeSelector
**File:** `references/theme-and-appearance.md`
**Change:** Add `colorMode` section with `disableSwitch: false` field.

### Eval 19 — Dynamic auth via JS runtime (not dynamicConfigurations build-time)
**File:** SKILL.md (new Dynamic Auth section) + `references/build-directory.md`
**Change:** Add section documenting the runtime JS pattern:
```javascript
// src/static/scripts/dynamic-auth.js
window.APIMaticDevPortal.ready(({ setConfig }) => {
  setConfig({
    auth: { bearerAuth: { AccessToken: getTokenFromCookieOrStorage() } }
  });
});
```
Reference it in `generatePortal.tailIncludes` (NOT `headIncludes`).

### Eval 21 — initialPlatform when adding languageSettings
**File:** SKILL.md (languageSettings guidance)
**Change:** "When `languageSettings` doesn't exist yet, ask the user which language should be selected by default and add `\"initialPlatform\": \"<template-id>\"` to `portalSettings`."

### Eval 26 — renameHttpToRest
**File:** `references/build-directory.md`
**Change:** Add `"renameHttpToRest": true` field documentation — goes directly inside `generatePortal`, renames the HTTP tab to REST.

### Eval 27 — Don't show old value while describing change
**File:** SKILL.md
**Change:** Add guidance: "When modifying a boolean field, only show the NEW value in code examples — never include the old value alongside the new."

### Eval 28 — focusAuthSectionOnUnauthorizedError
**File:** `references/build-directory.md`
**Change:** Add `"focusAuthSectionOnUnauthorizedError": true` under `portalSettings`.

### Eval 30 — Theme Control Hook (setThemeMode)
**File:** `references/theme-and-appearance.md`
**Change:** Add Theme Control Hook section:
```javascript
if (window.APIMaticDevPortal && window.APIMaticDevPortal.setThemeMode) {
  window.APIMaticDevPortal.setThemeMode('dark'); // or 'light'
}
```

### Eval 31 — Versioned portal outer file must not contain generatePortal
**File:** SKILL.md Red Flags + new `references/versioned-portals.md`
**Change:** Add red flag + full reference file.

---

## Execution Order

- [x] Fix `references/navigation-and-content.md` (evals 11, 14)
- [x] Fix `references/theme-and-appearance.md` (evals 17, 30)
- [x] Fix `references/build-directory.md` (evals 26, 27, 28 + QA missing items)
- [x] Fix `references/copilot-and-ai.md` (QA #7)
- [x] Create `references/versioned-portals.md` (eval 31, QA #19)
- [x] Update `references/first-time-setup.md` (eval 1)
- [x] Update `SKILL.md` (evals 4, 13, 19, 21, 27, 30 + red flags)
- [ ] Re-run failing evals to verify fixes

---

## Verification

After implementing all fixes:
```bash
cd /Users/sohaibtariq/Documents/Apimatic/apimatic-docs
python3 skills/apimatic-portal/evals/grade.py
```
Target: all 13 currently failing evals reach 100% pass rate.
Expected overall: 156/156 (100%) or close to it.
