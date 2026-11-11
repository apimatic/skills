# Rule format

Every file in `src/rules/` except `rules.md` holds only `#`/`##` headings, rule lines and blank lines. `rules.mjs check` enforces all of this.

## The files

| File | Title | Sections |
|---|---|---|
| `every-request.md` | `# Rules for every request` | none: rule lines straight under the title |
| `background.md` | `# Rules for jobs <API name> runs on its own` | `## <job>`, one per job, in lower case with dashes: `renewal`, `dunning`, `webhook-delivery`, `nightly-export` |
| `operations/<area>.md` | `# <tag>`, as `rules.mjs ops` prints it | `## <heading>`, one per operation that has rules, copied exactly from `rules.mjs ops` (`` ## `POST /subscriptions` (`createSubscription`) ``), in the order it lists them |

Within a section, put loud rules first, then silent ones. Leave out operations that have no rules.

## The rule line

One line per rule:

```
- **<loudness>**, <on>/<does>: <condition> → <outcome>. **Do:** <what the app must do>[ Also: `<operationId>`, `<operationId>`.][ **Conflict:** <note>] *(<source>[; <source>...]; `<id>`)*
```

| Part | What it holds |
|---|---|
| `<loudness>` | `loud` when the API refuses the request (an error) if the rule is broken; `silent` when it gives a wrong or surprising result with no error |
| `<on>` | What the API checks: `auth`, `state`, `order`, `account-config`, `idempotency`, `resilience`, `limits`, `other`, or `-` for nothing beyond the request itself |
| `<does>` | What happens that the definition does not show: `side-effects`, `webhooks`, `lists`, `values`, `errors`, `other`, or `-` |
| `<condition>` | When the rule applies, one sentence, no final period |
| `<outcome>` | What the API does, from the material only: the status, the error code or message in double quotes, and/or the silent effect, such as `422 "Coupon code is invalid"` or `The renewal is charged at the new price`. Write `outcome not stated` when the material does not say. Ends with a period |
| `**Do:**` | What an app calling the API must do, one imperative sentence, ending with a period |
| `Also:` | Only for a rule on several operations: the other operations' `operationId`s (or `background:<job>`), each in backticks |
| `**Conflict:**` | Only when two sources disagree: which ones, and which the rule follows |
| `<source>` | `<kind> \`<path>\``, where the path is relative to `src/` and may end in `:<line>` or `:<from>-<to>`. Several sources are separated by `; ` |
| `<id>` | The rule's id, in backticks: see below |

`<on>` and `<does>` are never both `-`. The categories:

| `<on>` | Use it when the rule depends on |
|---|---|
| `auth` | credentials, scopes, roles or permissions |
| `state` | the state of a resource (active, cancelled, trial, archived) |
| `order` | something that must exist or happen first |
| `account-config` | an account, site or feature setting |
| `idempotency` | repeated or duplicate requests |
| `resilience` | retries, timeouts, what to do on 429 or 5xx |
| `limits` | rate, size or count limits |
| `other` | anything else the API checks |

| `<does>` | Use it when the rule is about |
|---|---|
| `side-effects` | what else a call changes, creates, charges or sends |
| `webhooks` | events the API sends |
| `lists` | page sizes, default order, filters |
| `values` | values the API computes, defaults, rounds or converts (dates, time zones, amounts, proration) |
| `errors` | what an error means, or when it is returned |
| `other` | anything else |

### Source kinds

| Kind | For |
|---|---|
| `spec` | the API definition, `spec/...` |
| `docs` | portal pages, `content/...` |
| `announcement` | dated changelog or announcement pages |
| `text` | notes, emails, chat exports, Markdown the user wrote: `rules/sources/...` |
| `code` | source code: `rules/sources/...:<line>` |
| `table` | spreadsheets, CSV, JSON or YAML tables: `rules/sources/...` |
| `document` | PDF, Word, slides: `rules/sources/...` |
| `url` | a page the user linked, as saved: `rules/sources/urls/...` |
| `observed` | logs or recorded responses that show what the API did: `rules/sources/...` |

Cite the line wherever the material has lines: code always, text and documents when it helps a reader find the sentence.

### Ids

| Where the rule is filed | Id |
|---|---|
| Under an operation | `<operationId>.<n>`, the first operation it is filed under (`rules.mjs ops` gives the prefix for an operation with no `operationId`) |
| `every-request.md` | `every-request.<n>` |
| `background.md` | `background.<n>` |

`<n>` counts from 1 per prefix. A rule filed under several operations keeps one id, written the same under each. Ids are permanent: a new rule takes the next free number, and a removed rule's number is not reused. An existing folder may use another id scheme (for example `acme:createOrder.3`); keep it.

## Example

`examples/project/` is a complete project: a three-operation API definition, the material in `src/rules/sources/` (a note, a code file and a saved page), and the rule files written from it. `src/rules/operations/subscriptions.md` there:

```markdown
# Subscriptions

## `POST /subscriptions` (`createSubscription`)

- **loud**, state/errors: The customer already has an active subscription to the same plan → 409 "subscription_exists". **Do:** Look up the customer's subscriptions first and change the existing one instead of creating a second. *(code `rules/sources/SubscriptionService.cs:8-9`; `createSubscription.1`)*
- **loud**, order/-: The plan has no price in the request's currency → 422 "no price for currency". **Do:** Create the plan's price in that currency before subscribing anyone to it. Also: `createPlanPrice`. *(text `rules/sources/billing-notes.txt:5-6`; `createSubscription.2`)*
- **silent**, -/values: A subscription is created after the 28th of a month → The first renewal is on the 1st of the next month. **Do:** Show the renewal date the response returns, never one computed in the app. *(url `rules/sources/urls/docs.example.com-billing-cycles.md`; `createSubscription.3`)*

## `POST /subscriptions/{id}/cancel` (`cancelSubscription`)

- **silent**, state/side-effects: The subscription is cancelled with at_period_end true → It stays active, and is charged, until the period ends. **Do:** Tell the customer the access end date from the response. **Conflict:** billing-notes.txt says cancelling is immediate; the rule follows the code. *(code `rules/sources/SubscriptionService.cs:18-21`; text `rules/sources/billing-notes.txt:8`; `cancelSubscription.1`)*
```

The second rule also governs `createPlanPrice`, so `operations/plans.md` holds the same line, with the same id, naming `createSubscription` in `Also:`. `src/rules/background.md`:

```markdown
# Rules for jobs Example Billing runs on its own

## renewal

- **silent**, state/side-effects: A renewal payment fails → The subscription moves to past_due and the payment is retried on days 3, 5 and 7; the subscription.cancelled webhook is sent if all retries fail. **Do:** Keep giving access while the subscription is past_due, and stop only on the subscription.cancelled webhook. *(text `rules/sources/billing-notes.txt:10-11`; `background.1`)*
```
