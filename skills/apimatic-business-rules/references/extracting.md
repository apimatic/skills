# Extracting the rules

Read this before you write a record, whether you are doing one group or all of them. `record-format.md` has the record.

## Your sources, and only these

Everything you may read for rules is in `src/spec/` (the API definition) and `src/content/` (the docs). Do not search the web or the rest of the disk, do not call the API, and do not use what you remember about this API or one like it. A rule counts only if one of these files states it. If you are unsure whether a file states something, it does not.

## What a business rule is

Logic the API applies that the API definition's schema cannot express. Text in a description or an `x-` extension does not count as expressing it: a rule written only in prose is a business rule. Record:

- **Conditions on a request** beyond the schema: a field required, forbidden or ignored only in some case; fields that must or must not come together; a value allowed only in some state or setting.
- **State:** what a resource's state allows or refuses, and what a call changes it to.
- **Order:** something that must exist or happen before a call works.
- **Account or site configuration** a call depends on: a setting, a payment gateway, a feature that must be on.
- **Side effects:** what else a call does (charges, emails, other resources created or changed, webhooks sent).
- **Values the API computes:** defaults, rounding, currency or time-zone conversion, proration, dates, and when it applies them.
- **Lists:** default and maximum page sizes, default order, how filters combine.
- **Errors:** what a documented error status, code or message means and when it comes back.
- **Limits:** rate, concurrency, size and count limits.
- **Idempotency and duplicates,** and **resilience:** retries, timeouts, what to do on 429 or 5xx.
- **Auth:** the credentials, scopes or roles a call needs.
- **Background jobs:** renewals, retries, expiries, scheduled changes, webhooks the API sends on its own.

Do not record:

- what the schema itself states (types, `required`, enums, formats, minimum and maximum, patterns, `readOnly`), unless the text adds a condition the schema cannot state;
- what a field means, with no server behaviour attached;
- marketing, UI-only text, or plans for the future ("we will add...").

One record per rule: one condition and one outcome. Split a sentence that states two rules. Merge the same rule stated in two places into one record with both sources.

## Which rules are your group's

A rule belongs to the group that owns the operation whose request it governs. If it also governs operations of other groups, list them all in `operations`; still only the owning group writes it. Rules for every request and for background jobs belong to the `general` group; another group records one only when it is stated in a page no other group reads.

## How a group works

1. **The API definition.** Run `node <skill-dir>/scripts/rules.mjs spec <area>... > rules-work/spec-<group>.txt` with your group's areas (the `general` group: `spec info`), and read the whole file, in parts if it is long. For each operation it prints the summary, description, parameters and responses, and then every schema they use with each property's description. Most rules are in that prose. For a YAML definition it prints where each operation starts instead: read each one there, and every schema file it refers to.
2. **The docs.** Read each of your group's pages whole. Then search `src/content/` for each of your operations' paths, names and resources, and read what you find.
3. **The records.** For each operation, write every rule it has: a write operation often has several. Add each area's records to `rules-work/records/<group>.jsonl` as you finish the area, so nothing is lost if the work stops. Be complete: every operation of the group, not a sample.
4. **The quotes.** Run `node <skill-dir>/scripts/rules.mjs quotes` and fix every error that names your file, until none does.
5. **Report** (as a subagent, to the agent that started you): records per area, loud and silent counts, what you could not read, statements you could not place, and conflicts. Do not repeat the records.

## Writing a record

- **The quote** is the words that state the rule, copied exactly: from the file itself, or for a JSON definition from what `rules.mjs spec` prints. Give each source that states the rule.
- **The outcome** is only what the source states: a status the text names, the error code or message exactly as written, the silent effect. When it states none, leave all three `null`.
- **`loud` or `silent`** follows the outcome: an error the API returns is `loud`; a result with no error is `silent`. When the source says the API refuses or rejects but gives no status, it is still `loud`.
- **`app_must`** is what a careful app does about the rule, one imperative sentence that follows from the source: "Send currency when the subscription must be billed in another currency", not "Handle currencies correctly".
- **A statement about an endpoint the API definition does not have** gets no record. Note it in `rules-work/groups.md`, under the group, for the report.

## When sources disagree

When the definition and the docs, or two pages, disagree, write one record with both sources and a `conflict` naming them and which one the record follows. Follow the more specific source (the page or description about that operation over a general page), and between dated pages the newer one. Note the conflict for the report.

## The second pass

`rules.mjs sample` puts a random 10% of each group's records into `rules-work/sample.jsonl`. For each record there, open each source, find the quote, and decide:

- **confirmed:** the sources state the rule as recorded, and every field follows from them;
- **corrected:** the sources state it, but a field is wrong (the operations, the condition, the outcome, `loud` or `silent`, a category, `app_must`, a source). Give the right value of each field you change, whole;
- **rejected:** the sources do not state it, or it is not a business rule (the schema already says it, or no server behaviour is attached).

Judge the record against its sources, not against how you would have worded it. Write one line per record to `rules-work/review.jsonl`:

```json
{"id": "createSubscription.3", "verdict": "corrected", "reason": "The definition says the default is the customer's currency, not the account's.", "corrected": {"provider_outcome": {"status": null, "error": null, "effect": "The customer's currency is used"}}}
```

`"corrected"` is `null` unless the verdict is `corrected`. Then `rules.mjs review` applies the verdicts.
