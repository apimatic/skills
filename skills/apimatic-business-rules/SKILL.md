---
name: apimatic-business-rules
description: Use when a user gives business rules or business logic for their API, in any form (notes, pasted text, URLs, source code, spreadsheets, CSV or JSON tables, PDFs, Word files, screenshots), by putting it in the src/rules/ folder of an APIMatic project, pasting or linking it in the conversation, or pointing at files, and wants it turned into the Markdown rule files that folder keeps (rules.md, every-request.md, background.md, operations/<area>.md). Also use when the user adds more material to src/rules/, asks to check, fix or update those rule files, or asks how to write down their API's business rules.
---

# APIMatic Business Rules

Turn the business logic the user gives you (files dropped into `src/rules/`, text pasted in the conversation, links, files elsewhere) into Markdown rule files in `src/rules/`, each rule under the API operation (endpoint) it applies to, as the API definition in `src/spec/` lists them. The skill body IS the instructions: do every step yourself; ask the user only where a step says to.

A **business rule** is logic the API applies that the API definition cannot express: a field required only in some case, an action refused in some state, a call that must come first, a setting that must be on, a side effect, a value the server computes, a limit, what an error means. The rule files tell a developer (or an AI coding assistant) what their app must do about each one.

The rules are written from the material as given; nothing here calls the API to test them. The skill assumes the material is up to date with the live API (what its sandbox does), and tells the user so in its report.

## When to Use

- The user dropped files, links or notes into `src/rules/` and wants them translated, formatted, organized or "turned into rules"
- The user pasted rules into the conversation, gave links, or pointed at files elsewhere, and wants them recorded as their API's business rules
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
- About to delete, rewrite or rename any of the user's files → originals in `src/rules/` are moved, unchanged, into `src/rules/sources/`; files elsewhere are copied there and left where they are; nothing the user gave is ever deleted
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
  sources/              the user's originals, unchanged, saved copies of the pages they linked, and what they pasted in the conversation
```

Every rule is one line in a fixed format. `references/rule-format.md` has the format, the category values, ids, sources and a worked example. Read it before writing the first rule.

## Workflow

### Step 1: Look at the project

1. Find the project root (the directory containing `src/`). If there is no `src/rules/`, create it.
2. Run `node <skill-dir>/scripts/rules.mjs ops`. It prints every operation of the API definition: the file its rules go in, the section heading to use, and the id prefix. Keep the output; you file every rule by it. If it fails to find a definition, tell the user what it said and stop.
3. Collect the new material: everything in `src/rules/` that is not part of the layout above, plus whatever the user gave in the conversation (pasted text, links, paths to files elsewhere). If there is none, tell the user `src/rules/` is ready, that they can drop their material there in any form or paste or link it in the conversation, and stop. If the layout files already exist, this is a re-run: see *Adding material later*.

### Step 2: Read the material

Read `references/reading-inputs.md`, then read every item, whatever its form: text, links (fetch each page and save it under `src/rules/sources/urls/`), code, tables, documents, images, archives. Note for each item what you could not read.

### Step 3: Keep the originals in `sources/`

Every item of new material goes into `src/rules/sources/` unchanged. Do this before writing rules, so every rule cites the path the file will keep. Keep each item's name and any subfolders; add `-2`, `-3` before the extension if a name is taken.

- **Items in `src/rules/`:** move them. Use `git mv` when the project is a git repository and the file is tracked.
- **Files elsewhere** (in the project or outside it): copy them, and leave the originals where they are.
- **Text pasted in the conversation:** save it, word for word, as `src/rules/sources/chat-<YYYY-MM-DD>.md`.
- **Links given in the conversation:** the page copies Step 2 saved in `sources/urls/` are enough.

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
- your questions, all together;
- in one line, that the rules come from their material and were not tested against the API: they assume the material is up to date with the live API (its sandbox).

When the user answers, save the answer like pasted text (Step 3) so the rules can cite it, update the rule files, then run `index` and `check` again.

## Adding material later

When `src/rules/` already holds rule files and the user adds more:

1. Treat only the new items (anything outside the layout, and whatever the user gives in the conversation) as new material; the files in `sources/` are already done.
2. Read the existing rule files for the areas the new material touches before writing, so you don't write a rule twice. If the new material restates an existing rule, add the new source to that rule. If it changes one, update the rule in place, keep its id, and add the source.
3. New rules take the next free number for their id prefix; never renumber.
4. Then Steps 3, 5 and 6 as above.

## References

- `references/rule-format.md`: the rule line format, category values, ids, sources and an example
- `references/reading-inputs.md`: what counts as a business rule, and how to read each kind of material
- `scripts/rules.mjs`: `ops`, `index` and `check`
