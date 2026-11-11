---
name: apimatic-business-rules
description: Use when a user has put business rules or business logic for their API into the src/rules/ folder of an APIMatic project, in any form (notes, pasted text, URLs, source code, spreadsheets, CSV or JSON tables, PDFs, Word files, screenshots), and wants it turned into the Markdown rule files that folder keeps (rules.md, every-request.md, background.md, operations/<area>.md). Also use when the user adds more material to src/rules/, asks to check, fix or update those rule files, or asks how to write down their API's business rules.
---

# APIMatic Business Rules

Turn whatever the user put in `src/rules/` into Markdown rule files, filed by the operations of the API definition in `src/spec/`. The skill body IS the instructions: do every step yourself; ask the user only where a step says to.

A **business rule** is logic the API applies that the API definition cannot express: a field required only in some case, an action refused in some state, a call that must come first, a setting that must be on, a side effect, a value the server computes, a limit, what an error means. The rule files tell a developer (or an AI coding assistant) what their app must do about each one.

## When to Use

- The user dropped files, links or notes into `src/rules/` and wants them translated, formatted, organized or "turned into rules"
- The user added more material to a `src/rules/` that already holds rule files
- The user asks to check or fix the rule files, or asks how to document their API's business rules

**When NOT to use:** changing the API definition itself, generating SDKs or portals (the `apimatic-sdk` and `apimatic-portal` skills).

## Prerequisites

- Node.js 24 or later (for `scripts/rules.mjs`; it has no dependencies)
- An APIMatic project: a directory that contains `src/`, with the API definition in `src/spec/` (OpenAPI 3 or Swagger 2, JSON or YAML). No APIMatic login or CLI is needed.

`<skill-dir>` below is the directory holding this `SKILL.md`. Run every command from the project root (the directory that *contains* `src/`), never from inside `src/`.

## Red Flags — STOP and re-read the relevant section

- About to write a rule no input states, or "complete" a rule from what you know about this API or similar ones → record only what the user's material (or the API definition and `src/content/` pages it points to) states. A gap is a question for the user, not a guess
- About to record what the API definition already states (a type, `required`, an enum, a min/max, a pattern) → not a business rule, unless the material adds a condition the definition cannot express (see `references/reading-inputs.md`)
- About to record an internal implementation detail from code (logging, caching, table names, class structure) → a rule is something a caller of the API can run into
- About to delete, rewrite or rename any of the user's files → originals are moved, unchanged, into `src/rules/sources/`; nothing the user gave is ever deleted
- About to cite a URL directly → save the page into `src/rules/sources/urls/` first and cite the copy; a page you could not fetch is reported, never guessed
- About to edit `src/spec/` or `src/content/` → this skill writes only inside `src/rules/`
- About to write or edit `src/rules/rules.md` by hand → `node <skill-dir>/scripts/rules.mjs index` writes it
- About to renumber, reuse or delete an existing rule id → ids are permanent; new rules take the next free number
- About to invent an operation heading, file name or `operationId` → take them from `rules.mjs ops`
- About to finish while `rules.mjs check` reports an error → fix every error first
- About to ask the user several questions one at a time → collect them and ask once, after writing everything you could

## Communication Guidelines

- Tell the user what you are doing in plain words ("Reading your 6 files", "Writing the rules for Subscriptions"). Do not show script output, file trees or rule lines unless they ask.
- When something can't be read (a login-only page, a scanned PDF you can't read), say which item and why in one line, and carry on with the rest.
- When in doubt, less is more.

## The layout

```
src/rules/
  rules.md              the index; written by `rules.mjs index`
  every-request.md      rules for every request: auth, rate limits, headers, error format
  background.md         rules for what the API does on its own: renewals, retries, scheduled jobs, webhooks it sends
  operations/<area>.md  one file per tag of the API definition, one section per operation
  sources/              the user's originals, unchanged, and saved copies of the pages they linked
```

Every rule is one line in a fixed format. `references/rule-format.md` has the format, the category values, ids, sources and a worked example. Read it before writing the first rule.

## Workflow

### Step 1: Look at the project

1. Find the project root (the directory containing `src/`). If there is no `src/rules/`, ask the user where their material is.
2. Run `node <skill-dir>/scripts/rules.mjs ops`. It prints every operation of the API definition: the file its rules go in, the section heading to use, and the id prefix. Keep the output; you file every rule by it. If it fails to find a definition, tell the user what it said and stop.
3. List everything in `src/rules/` that is not part of the layout above: that is the new material. If the layout files already exist, this is a re-run: see *Adding material later*.

### Step 2: Read the material

Read `references/reading-inputs.md`, then read every item, whatever its form: text, links (fetch each page and save it under `src/rules/sources/urls/`), code, tables, documents, images, archives. Note for each item what you could not read.

### Step 3: Move the originals into `sources/`

Move each item of new material, unchanged, into `src/rules/sources/`, keeping its name and any subfolders (add `-2`, `-3` before the extension if a name is taken). Use `git mv` when the project is a git repository and the file is tracked. Do this before writing rules, so every rule cites the path the file will keep.

### Step 4: Write the rules

1. Go through the material and write one rule per condition and outcome, in the format of `references/rule-format.md`. Split a sentence that states two rules; merge the same rule stated in two places into one rule with both sources.
2. File each rule:
   - it applies to every request → `every-request.md`;
   - it is about something the API does on its own → `background.md`, under a `## <job>` section (`renewal`, `dunning`, `webhook-delivery`, ...);
   - otherwise → under each operation it governs, in the file and section `rules.mjs ops` gave. A rule on several operations is written under each one, with the same id, and names the others in `Also:`.
3. A rule you cannot place (the material names no operation you can match, or an endpoint the definition does not have) is not written: list it for the user in Step 6.
4. When two sources disagree, write the rule as the user's material states it and add a `**Conflict:**` note naming the other source. When it matters which is right, add it to your questions.
5. Write the files area by area as you finish each, so nothing is lost if the work stops. Create `every-request.md` and `background.md` with their titles even when they hold no rules.

### Step 5: Index and check

1. Run `node <skill-dir>/scripts/rules.mjs index` to write `rules.md`.
2. Run `node <skill-dir>/scripts/rules.mjs check`. Fix every **error** and run `index` and `check` again until it prints `OK`.
3. Read each **warning**. "No rule cites" a file is fine when that file states no rule (an overview, a page about something else): say so in your report.

### Step 6: Report

Tell the user, briefly:

- how many rules you wrote, from how many items, and which files they are in (loud and silent counts come from the first line of `rules.md`);
- anything you could not read, and why;
- rules you could not place, and conflicts you noted;
- your questions, all together.

When the user answers, update the rule files, then run `index` and `check` again.

## Adding material later

When `src/rules/` already holds rule files and the user adds more:

1. Treat only the new items (anything outside the layout) as new material; the files in `sources/` are already done.
2. Read the existing rule files for the areas the new material touches before writing, so you don't write a rule twice. If the new material restates an existing rule, add the new source to that rule. If it changes one, update the rule in place, keep its id, and add the source.
3. New rules take the next free number for their id prefix; never renumber.
4. Then Steps 3, 5 and 6 as above.

## References

- `references/rule-format.md`: the rule line format, category values, ids, sources and an example
- `references/reading-inputs.md`: what counts as a business rule, and how to read each kind of material
- `scripts/rules.mjs`: `ops`, `index` and `check`
