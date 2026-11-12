---
name: apimatic-business-rules
description: Use when a user wants the business rules of their API written down for its Context Plugin, meaning the rules its own API definition (src/spec/) and docs (src/content/) state that the definition's schema cannot express, filed by API operation in the src/rules/ folder of an APIMatic project (rules.md, every-request.md, background.md, operations/<area>.md). Also use when the user asks to update those rule files after the API definition or docs changed, asks to check or fix them, or asks how to add business rules to a Context Plugin.
---

# APIMatic Business Rules

Find the business rules that an API's own definition (`src/spec/`) and docs (`src/content/`) state, and write them into `src/rules/`, each under the API operation (endpoint) it governs. When the user generates a Context Plugin (`apimatic plugin generate`, in the `apimatic-portal` skill), APIMatic copies `src/rules/` into the plugin as `business-rules/`, and the plugin's planning step reads the rules of every operation the integration uses. The skill body IS the instructions: do every step yourself; ask the user only where a step says to.

A **business rule** is logic the API applies that the API definition's schema cannot express: a field required only in some case, an action refused in some state, a call that must come first, a setting that must be on, a side effect, a value the server computes, a limit, what an error means. A rule written only in a description is still a business rule. Each rule says what an app calling the API must do about it.

**The rules come only from the API definition and the docs.** Nothing here calls the API to test them. The skill assumes the docs and the definition are accurate and up to date with the live API (what its sandbox does), and tells the user so in its report.

## When to Use

- The user wants their API's business rules written down, or wants them in their Context Plugin
- The API definition or the docs changed and the rules need to follow
- The user asks to check or fix `src/rules/`, or how business rules get into a Context Plugin

**When NOT to use:** changing the API definition or the docs themselves; generating SDKs, portals or the plugin (the `apimatic-sdk` and `apimatic-portal` skills).

## Prerequisites

- Node.js 24 or later (for `scripts/rules.mjs`; it has no dependencies)
- An APIMatic project: a directory that contains `src/`, with the API definition in `src/spec/` (OpenAPI 3 or Swagger 2, JSON or YAML) and the portal docs, if there are any, in `src/content/`. No APIMatic login or CLI is needed.

`<skill-dir>` below is the directory holding this `SKILL.md`. Run every command from the project root (the directory that *contains* `src/`), never from inside `src/`.

## What goes where

```
src/
  spec/                      read: the API definition
  content/                   read: the docs
  rules/                     written by `rules.mjs write`, never by hand; all of it is published in the plugin
    rules.md                 the index
    every-request.md         rules for every request
    background.md            rules for jobs the API runs on its own, when there are any
    operations/<area>.md     one file per area (tag), one section per operation, headed with its route
rules-work/                  your working files: outside src/, so they are never uploaded or published
  groups.md                  the groups, and what each one reads
  records/<group>.jsonl      one record per rule, with the exact quote it comes from
  spec-<group>.txt           what the API definition says about the group's operations
  sample.jsonl, review-*.jsonl   the second pass
```

The records are the source of `src/rules/`; the next run builds on them. Keep `rules-work/`.

## Red Flags — STOP and re-read the relevant section

- About to write a rule that no file in `src/spec/` or `src/content/` states, or to "complete" one from what you know about this API or a similar one → a rule counts only if one of those files states it. If you are unsure whether a file states something, it does not
- About to read anything else for rules (the web, the user's code, other folders, the live API) → only `src/spec/` and `src/content/`
- About to record what the schema already states (a type, `required`, an enum, a format, a minimum or maximum, a pattern, `readOnly`) → not a business rule, unless the text adds a condition the schema cannot express (see `references/extracting.md`)
- About to put anything into `src/rules/` yourself, or to write keys, tokens, account or site ids into a rule → everything in `src/rules/` is published in the Context Plugin. Only `rules.mjs write` writes there; working files go in `rules-work/`
- About to write a quote from memory or in your own words → copy it exactly from the file; `rules.mjs quotes` checks every one
- About to edit a file in `src/rules/` → change the records, then run `rules.mjs write`
- About to give a record an id, or change or reuse one → `rules.mjs write` gives ids; they are permanent
- About to stop a group after some of its operations → every operation and every page of the group, not a sample
- About to invent an operation name, area or heading → take them from `rules.mjs ops`
- About to finish while `rules.mjs quotes` or `rules.mjs check` reports an error → fix every error first

## Communication Guidelines

- Tell the user what you are doing in plain words ("Reading the Subscriptions operations", "Checking a sample of the rules"). Do not show script output, records or rule lines unless they ask.
- When a file can't be read, say which one and why in one line, and carry on.
- Ask nothing until the report, unless Step 1 says to. Collect your questions and ask them once.

## Workflow

### Step 1: Look at the project

1. Find the project root (the directory containing `src/`).
2. Run `node <skill-dir>/scripts/rules.mjs ops`. It prints every operation of the API definition by area: the file its rules go in and the section heading. If it fails, tell the user what it said and stop.
3. List the docs: every `.md` and `.mdx` file under `src/content/`.
4. If `rules-work/records/` exists, this is a re-run: go to *Running it again*.
5. If `src/rules/` already holds files, someone wrote rules another way: `write` would replace them. Ask the user before going on.

### Step 2: Plan the groups

Split the operations into groups by area, about 20 to 40 operations each: put small areas together; a large area can be a group on its own. Add one group named `general` for the rules no single operation owns: rules for every request (authentication, keys, base URLs and sites, rate and concurrency limits, request and response formats, dates and times, paging in general, duplicate prevention, errors in general) and jobs the API runs on its own (renewals, retries, expiries, webhook delivery, scheduled changes).

Give every docs page to a group: a page about one area's operations (a tutorial, a guide to one resource) to that area's group; a page about the API as a whole to `general`. A page can go to more than one group. Write the plan to `rules-work/groups.md`: each group's name, its areas and its pages.

### Step 3: Extract the rules, group by group

Each group follows `references/extracting.md` and writes its records to `rules-work/records/<group>.jsonl` in the format of `references/record-format.md`.

- **If you can start subagents** (in Claude Code, the Agent tool), give each group to its own subagent, up to four at a time. Tell it the project root, the full paths of `<skill-dir>/references/extracting.md`, `<skill-dir>/references/record-format.md` and `<skill-dir>/scripts/rules.mjs`, its group's name, areas and pages, and that it must read both references first.
- **Otherwise** do the groups yourself, one after another, reading `references/extracting.md` and `references/record-format.md` first.

### Step 4: Check the quotes, then write

1. Run `node <skill-dir>/scripts/rules.mjs quotes`. Fix every error: copy the quote again, exactly, from the file, or drop the record if the file does not state the rule. Then run it again until it prints `OK`.
2. Read each "no record cites" warning. It is fine when that page states no business rule; otherwise read the page and record its rules.
3. Run `node <skill-dir>/scripts/rules.mjs write`. It gives every new record its id and writes `src/rules/`.

### Step 5: Merge duplicates

A rule stated where two groups read it (a shared parameter, a reused schema, a general page) gets recorded twice.

1. Run `node <skill-dir>/scripts/rules.mjs merge`. It lists pairs of records from different groups that may be one rule: the same quote, or nearly the same condition and outcome.
2. For each pair that is one rule, run `node <skill-dir>/scripts/rules.mjs merge <keep-id> <drop-id>`. The first keeps its id and takes the other's operations and sources; the other is marked removed. A pair that is two rules (one sentence that states two things) stays as it is.
3. Run `write` again.

### Step 6: The second pass

1. Run `node <skill-dir>/scripts/rules.mjs sample`. It picks 10% of each group's records into `rules-work/sample.jsonl`.
2. Check each one against its sources, as *The second pass* in `references/extracting.md` says, and write the verdicts to `rules-work/review.jsonl`. If you can start subagents, give this to one that wrote none of the records.
3. Run `node <skill-dir>/scripts/rules.mjs review` to apply the verdicts, then `quotes` and `write`.
4. If more than a quarter of one group's sample was corrected or rejected, go through all of that group's records again the same way before you finish.

### Step 7: Check

Run `node <skill-dir>/scripts/rules.mjs check` and fix every error until it prints `OK`. It checks the rule files against the format, the API definition and the records, every quote, and that codegen will add `business-rules/` to the Context Plugin: it does so only when `rules.md`, `every-request.md` and at least one `operations/<area>.md` exist. If no rule governs any operation, tell the user the plugin will not get the folder.

### Step 8: Report

Tell the user, briefly:

- how many rules, loud and silent (the first line of `src/rules/rules.md`), how many operations have rules, and how many rules are for every request and for background jobs;
- the second pass: how many records were checked, and how many were confirmed, corrected and rejected;
- docs pages that state no business rule, and anything you could not read;
- statements you could not place (about an endpoint the definition does not have), and conflicts between the definition and the docs;
- your questions, all together;
- in one line: the rules come only from the API definition and the docs and were not tested against the API; they assume both are accurate and up to date with the live API (its sandbox);
- next: generate the Context Plugin (`apimatic plugin generate`, see the `apimatic-portal` skill) to include them; keep `rules-work/` for the next run.

## Running it again

When the API definition or the docs change, or the user asks to update the rules:

1. Run `quotes`. Each error names a record whose quote is no longer in its file. Read the file again and either fix the record (its id stays) or remove it: replace the record's line with `{"id": "<its id>", "removed": "<why>"}`.
2. Find the operations and pages that are new or changed: compare `ops` and the files under `src/content/` with `rules-work/groups.md`, and use the files' dates or the project's git history. Extract their rules as in Step 3, adding records to the groups' files. Update `groups.md`.
3. Then Steps 4 to 8. New records take the next free number; ids never change.

## References

- `references/extracting.md`: what a business rule is, how a group reads the API definition and the docs, and the second pass
- `references/record-format.md`: the record, the rule line it becomes, the categories, ids and an example
- `scripts/rules.mjs`: `ops`, `spec`, `quotes`, `write`, `merge`, `sample`, `review` and `check`
