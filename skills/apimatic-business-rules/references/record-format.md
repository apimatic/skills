# Records and rule files

You write records; `rules.mjs write` turns them into the rule files in `src/rules/`. Never edit those files by hand.

## The record

One JSON object per line in `rules-work/records/<group>.jsonl`, one record per rule: one condition and one outcome. A record from `examples/project/`:

```json
{"operations": ["createSubscription"], "on": "state", "does": "errors", "loudness": "loud", "condition": "The customer already has an active subscription to the same plan", "provider_outcome": {"status": 409, "error": "subscription_exists", "effect": null}, "app_must": "Look up the customer's subscriptions first, and change the existing one instead of creating a second.", "sources": [{"kind": "spec", "path": "spec/openapi.yaml", "line": 14, "quote": "A customer can hold only one active subscription to the same plan; a second one is refused with 409 \"subscription_exists\"."}], "conflict": null}
```

| Field | What it holds |
|---|---|
| `id` | Leave it out. `rules.mjs write` gives each new record the next free id and saves it into the record. Never change or reuse one |
| `operations` | Where the rule is filed. The `operationId`s of the operations whose requests it governs, as `rules.mjs ops` names them; `["every-request"]` for a rule on every request; `"background:<job>"` for a job the API runs on its own (`renewal`, `dunning`, `webhook-delivery`, `nightly-export`: lower case with dashes), alone or with the operations that start or change the job. The first entry sets the id |
| `on` | What the API checks; see below |
| `does` | What happens that the definition does not show; see below |
| `loudness` | `loud` when the API refuses the request (an error) if the rule is broken; `silent` when it gives a wrong or surprising result with no error |
| `condition` | When the rule applies: one sentence, one line |
| `provider_outcome` | `{"status": <HTTP status or null>, "error": <the documented error code or message, exactly, or null>, "effect": <the silent effect, one line, or null>}`. Only what the source states: `null` where it says nothing. All three `null` reads "outcome not stated" |
| `app_must` | What an app calling the API must do: one imperative sentence |
| `sources` | One or more `{"kind", "path", "line", "quote"}`, or for a linked page `{"kind": "link", "url", "line", "quote"}`; see below |
| `conflict` | `null`, or one line when two sources disagree: which ones, and which the record follows |
| `removed` | Only on a removed rule, which keeps just `id` and this: why it was removed. `merge` and `review` set it; to remove a rule yourself, replace its line with `{"id": "<its id>", "removed": "<why>"}` |

No text field may hold `→`, `**Do:**`, `**Conflict:**`, `*(` or `)*`: the rule line uses them.

### Categories

`on` and `does` are never both `-`.

| `on` | Use it when the rule depends on |
|---|---|
| `auth` | credentials, scopes, roles or permissions |
| `state` | the state of a resource (active, cancelled, trial, archived) |
| `order` | something that must exist or happen first |
| `account-config` | an account, site or feature setting |
| `idempotency` | repeated or duplicate requests |
| `resilience` | retries, timeouts, what to do on 429 or 5xx |
| `limits` | rate, size or count limits |
| `other` | anything else the API checks |
| `-` | nothing beyond the request itself |

| `does` | Use it when the rule is about |
|---|---|
| `side-effects` | what else a call changes, creates, charges or sends |
| `webhooks` | events the API sends |
| `lists` | page sizes, default order, filters |
| `values` | values the API computes, defaults, rounds or converts (dates, time zones, amounts, proration) |
| `errors` | what an error means, or when it is returned |
| `other` | anything else |
| `-` | nothing the definition does not show |

### Sources

| Field | What it holds |
|---|---|
| `kind` | `spec` for a file under `spec/`; `docs` for a page under `content/`; `announcement` for a dated changelog, release-note or announcement page under `content/`; `link` for a page a file in `spec/` or `content/` links to, saved with `rules.mjs link` |
| `path` | The file, relative to `src/`: `spec/openapi.yaml`, `content/guides/billing.md`. A `link` source has `url` instead: the link exactly as the file in `spec/` or `content/` gives it |
| `line` | The line the quote starts on, or `null` (always `null` for a JSON definition) |
| `quote` | The words that state the rule, copied exactly from the file, at most 300 characters. For a JSON definition, copy them as `rules.mjs spec` prints them; for a linked page, from its saved copy in `rules-work/links/`. `...` skips words inside a quote. Markdown and HTML marks, spacing and capitals do not matter when `quotes` compares |

Give every source that states the rule, not only the first you found.

## The rule files

| File | Title | Sections |
|---|---|---|
| `rules.md` | `# <API>: business rules` | the counts and a table of every operation that has rules |
| `every-request.md` | `# Rules for every request` | none: rule lines straight under the title. Always written, because codegen needs it |
| `background.md` | `# Rules for jobs <API> runs on its own` | `## <job>`, one per job. Written only when there are background rules |
| `operations/<area>.md` | `# <tag>` | `` ## `METHOD /path` (`operationId`) ``, one per operation that has rules, in the order of `rules.mjs ops` |

Within a section, loud rules come first, then silent ones. A record filed in several places is written under each, with the same id, and names the other places in `Also:`.

Each record becomes one line:

```
- **<loudness>**, <on>/<does>: <condition> → <outcome>. **Do:** <app_must>[ Also: `<place>`, ...][ **Conflict:** <conflict>] *(<kind> `<path or url>`; ...; `<id>`)*
```

The record above becomes, in `operations/subscriptions.md`:

```markdown
## `POST /subscriptions` (`createSubscription`)

- **loud**, state/errors: The customer already has an active subscription to the same plan → 409 "subscription_exists". **Do:** Look up the customer's subscriptions first, and change the existing one instead of creating a second. *(spec `spec/openapi.yaml`; `createSubscription.1`)*
```

Quotes stay in the records: the published lines carry each source's file or link, not its words.

## Ids

| The record's first `operations` entry | Id |
|---|---|
| An operation | `<operationId>.<n>` (`rules.mjs ops` names an operation that has no `operationId`) |
| `every-request` | `every-request.<n>` |
| `background:<job>` | `background.<n>` |

`<n>` counts from 1 per prefix. A removed rule keeps its number, and the number is never given again. An existing set of records may use a namespace (`acme:createOrder.3`); when every id has the same one, new ids get it too.
