# Reading the material

## What counts as a business rule

Logic the API applies that the API definition cannot express. A rule written only in a description is still a business rule. Record:

- **Conditions on a request** beyond the schema: a field required, forbidden or ignored only in some case; fields that must or must not come together; a value allowed only in some state or setting.
- **State:** what a resource's state allows or refuses, and what a call changes it to.
- **Order:** something that must exist or happen before a call works.
- **Account or site configuration** a call depends on: a setting, a payment gateway, a feature that must be on.
- **Side effects:** what else a call does (charges, emails, other resources created or changed, webhooks sent).
- **Values the API computes:** defaults, rounding, currency or time-zone conversion, proration, dates, and when it applies them.
- **Lists:** default and maximum page sizes, default order, how filters combine.
- **Errors:** what an error code or message means and when it comes back.
- **Limits:** rate, concurrency, size and count limits.
- **Idempotency and duplicates,** and **resilience:** retries, timeouts, what to do on 429 or 5xx.
- **Auth:** the credentials, scopes or roles a call needs.
- **Background jobs:** renewals, retries, expiries, scheduled exports, webhooks the API sends on its own.

Do not record:

- what the definition already states: types, `required`, enums, formats, minimum and maximum, patterns, `readOnly`, unless the material adds a condition the definition cannot state;
- what a field means, with no behaviour attached;
- internal implementation (logging, caching, database tables, class design, deployment) unless it changes what a caller sees;
- marketing, UI-only text, or plans for the future ("we will add...").

When you are unsure whether a statement is a rule, or what it means, ask; don't write a guess.

## Each kind of material

**Text** (`.txt`, `.md`, emails, chat exports, notes pasted into a file). Read it all. Most sentences that say "must", "only", "cannot", "when", "after", "fails", "returns" or "rejects" hold a rule. Cite the line.

**Links** (a file listing URLs, `.url` or `.webloc` shortcuts, links inside text). Fetch each page's full text: `curl -sL <url>` (then strip the HTML) keeps every sentence, while a web-fetch tool that returns a summary can drop rules. Save the text as Markdown in `src/rules/sources/urls/<host>-<path-with-dashes>.md`, starting with:

```markdown
Source: <the URL>
Fetched: <YYYY-MM-DD>

<the page's text>
```

If a summary is all you can get, add `Summary only: the full page could not be fetched.` under the `Fetched` line and say so in your report. A page that renders only in a browser (the fetch returns an empty shell) is unreadable: report it.

Cite that file, with kind `url`. Follow links on the page only when the user asked you to. A page that needs a login, is gone, or holds nothing readable is reported to the user, not guessed; leave the link file in `sources/` as given.

**Code** (any language). A rule is a check or behaviour a caller can run into: validation that rejects a request (`loud`, with the status and error message the code returns), state checks, limits, defaults and computed values, side effects, scheduled jobs (`background.md`). Match a handler to its operation by its route and HTTP method, against `rules.mjs ops`. Cite `file:line` of the check. Read the error messages and status codes from the code itself, exactly.

**Tables** (`.csv`, `.xlsx`, `.json`, `.yaml`). Usually one rule per row: an error-code table gives `errors` rules (on the operations a row names, or `every-request.md` when it names none), a limits table gives `limits` rules. Read `.xlsx` with whatever your environment has (a spreadsheet library, or unzip it and read `xl/sharedStrings.xml` and `xl/worksheets/`); if you can't, report it.

**Documents** (`.pdf`, `.docx`, `.pptx`). Read PDFs with your file-reading tool or `pdftotext`; read `.docx` and `.pptx` by unzipping them (`word/document.xml`, `ppt/slides/`). Cite the page or slide in the text of the rule's source note when there are no lines (`document \`rules/sources/Billing FAQ.pdf\``). A scanned document you cannot read is reported.

**Images** (screenshots, diagrams). Read them if you can view images, and cite them with kind `document`. Otherwise report them.

**Archives** (`.zip`, `.tar.gz`). Extract into a temporary folder outside the project, read what is inside as above, and move the archive itself into `sources/`. Cite a file inside it as `rules/sources/<archive>` and name the inner file in the rule's condition or a `Conflict` note only when it matters.

**Logs and recorded responses.** What the API actually did is a rule with kind `observed`. If it contradicts other material, add a `**Conflict:**` note and ask the user which is right.

**The API definition and portal pages.** When material points at them ("see the Subscriptions guide"), read the part it points to and cite it with kind `spec` (`spec/...`) or `docs` (`content/...`). Don't mine the whole definition or portal unless the user asks.

## When material disagrees

Write the rule as the user's own material states it and add a `**Conflict:**` note naming the other source and which one the rule follows. Prefer, in order: what the user told you in the conversation, code, then the newest document. Add the conflict to your questions when it changes what an app must do.
