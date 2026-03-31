# Navigation and Content Reference

This file covers `toc.yml` navigation structure, adding custom markdown pages, and custom UI component syntax for APIMatic Docs as Code portals.

## Contents

- [toc.yml Navigation Structure](#tocyml-navigation-structure) — format, entry types, regeneration command, and CLI flags
- [Grouping API Reference Into Custom Subsections](#grouping-api-reference-into-custom-subsections) — expand flags, step-by-step grouping, and flag reference table
- [Flags for portal serve](#flags-for-portal-serve) — all `apimatic portal serve` flags
- [Adding Custom Markdown Pages](#adding-custom-markdown-pages) — workflow for new pages
- [Custom UI Components](#custom-ui-components) — available components and syntax examples

---

## toc.yml Navigation Structure

### Location and Purpose

- `toc.yml` lives at `src/content/toc.yml`
- Controls which pages appear in the portal sidebar, in what order, and under which groups
- Hand-edit `toc.yml` to make targeted changes to individual entries
- Run `apimatic portal toc new` to regenerate from scratch — this overwrites the existing file entirely

### toc.yml Format

The following example covers all entry types:

```yaml
toc:
  - group: Getting Started
    items:
      - page: Introduction
        file: introduction.md
      - generate: How to Get Started
        from: getting-started
  - group: Guides
    dir: guides
  - generate: API Endpoints
    from: endpoints
  - generate: Models
    from: models
```

**Entry type explanations:**

- `group` with `items` — named group whose children are listed explicitly.
- `group` with `dir` — named group whose children are all `.md` files found in `src/content/<dir>/`, included automatically.
- `page` + `file` — a custom Markdown page. `page` is the display title; `file` is the path to the `.md` file relative to `toc.yml` (i.e., relative to `src/content/`).
- `generate` with `from` at the top level — auto-generated section (API reference, endpoint list, models). The `from` value matches an APIMatic section identifier.
- `generate` + `from` inside an `items` list — an explicitly named entry pointing to a specific APIMatic-generated page.

> **Important:** Custom markdown pages ALWAYS use `page:` + `file:` keys — never `generate:` + `from:`. The `generate:` + `from:` pattern is only for APIMatic-generated content (endpoints, models, SDK infrastructure, etc.).

### Regenerating toc.yml

```
apimatic portal toc new
```

This is an interactive command — it prompts before overwriting the existing `toc.yml`. Run it from the project root (the directory that contains `src/`). After regenerating, review the output to confirm the navigation structure matches the intended order.

### Flags for portal toc new

- `--destination=<value>` : Path where the generated TOC file will be saved. Defaults to `<input>/src/content`.
- `--input=<value>` : Path to the parent directory containing the `src` directory. Defaults to `./`.
- `--force` : Overwrite the TOC file if one already exists at the destination. Use in CI to skip the interactive overwrite prompt.
- `--expand-endpoints` : Include individual entries for each endpoint in the generated TOC. Requires a valid API specification in the working directory.
- `--expand-models` : Include individual entries for each model. Requires a valid API specification.
- `--expand-webhooks` : Include individual entries for each webhook. Requires a valid API specification.
- `--expand-callbacks` : Include individual entries for each callback. Requires a valid API specification.

---

## Grouping API Reference Into Custom Subsections

By default, `apimatic portal toc new` generates a single collapsed entry per component type (e.g., one `from: endpoints` entry for all endpoints). To split components into custom named groups in the sidebar, first expand them into individual entries, then wrap those entries in `group` blocks.

### Step 1: Expand all components into toc.yml

Run `apimatic portal toc new` with the expand flags for each component type your spec contains:

```
apimatic portal toc new --expand-endpoints --expand-models --expand-webhooks --expand-callbacks --force
```

The `--force` flag skips the interactive overwrite prompt. After running, `toc.yml` contains one entry per individual component using these formats.

**Endpoints** — one overview entry per endpoint group, then one entry per endpoint:

```yaml
- generate:
  from: endpoint-group-overview
  endpoint-group: My API Group
- generate:
  from: endpoint
  endpoint-name: CreateUser
  endpoint-group: My API Group
- generate:
  from: endpoint
  endpoint-name: GetUser
  endpoint-group: My API Group
```

**Models** — one entry per model, with optional nested grouping (e.g., Structures vs. Exceptions):

```yaml
- generate:
  from: model
  model-name: UserModel
- generate:
  from: model
  model-name: ErrorResponse
```

### Step 2: Organize entries into groups

Open `src/content/toc.yml` and wrap the expanded entries under `group` + `items` blocks. Distribute entries across your desired subsections:

```yaml
toc:
  - group: Getting Started
    items:
      - generate: How to Get Started
        from: getting-started

  - group: User API
    items:
      - generate:
        from: endpoint-group-overview
        endpoint-group: User Operations
      - generate:
        from: endpoint
        endpoint-name: CreateUser
        endpoint-group: User Operations
      - generate:
        from: endpoint
        endpoint-name: GetUser
        endpoint-group: User Operations

  - group: Billing API
    items:
      - generate:
        from: endpoint-group-overview
        endpoint-group: Billing Operations
      - generate:
        from: endpoint
        endpoint-name: CreateInvoice
        endpoint-group: Billing Operations

  - group: Models
    items:
      - group: Structures
        items:
          - generate:
            from: model
            model-name: UserModel
          - generate:
            from: model
            model-name: InvoiceModel
      - group: Exceptions
        items:
          - generate:
            from: model
            model-name: ApiErrorResponse

  - generate: SDK Infrastructure
    from: sdk-infra
```

### Step 3: Preview the result

```
apimatic portal serve
```

The sidebar reflects the new grouped structure immediately.

### Which expand flags to use

Only use flags that match what your spec contains:

| Flag | Expands | Use when |
| --- | --- | --- |
| `--expand-endpoints` | Individual endpoints by group | Spec has REST endpoints |
| `--expand-models` | Individual data models/schemas | You want per-model sidebar nav |
| `--expand-webhooks` | Individual webhook definitions | Spec defines webhooks |
| `--expand-callbacks` | Individual callback definitions | Spec defines callbacks |

Combine any subset. For example, if your spec has no webhooks or callbacks:

```
apimatic portal toc new --expand-endpoints --expand-models --force
```

---

### Flags for portal serve

- `--input=<value>` : Path to the parent directory containing the `src` directory. Defaults to `./`.
- `--destination=<value>` : Path where the portal will be generated. Defaults to `<input>/portal`.
- `--port, -p <value>` : Port to serve the portal. Defaults to `3000`.
- `--open, -o` : Open the portal in the default browser automatically.
- `--ignore, -i <value>` : Comma-separated list of files/directories to ignore during watch.
- `--auth-key=<value>` : Override current authentication state with an authentication key.
- `--no-reload` : Disable hot reload.

---

## Adding Custom Markdown Pages

Follow these steps to add a new custom page to the portal:

1. Create a `.md` file in `src/content/guides/` or any subdirectory of `src/content/`.
2. Write content using GitHub-flavored Markdown. APIMatic also supports custom UI components — see the next section.
3. Add a `page:` + `file:` entry to `toc.yml` to include the page in navigation:

```yaml
toc:
  - group: Guides
    items:
      - page: My New Page
        file: guides/my-new-page.md
```

> **Critical:** Custom markdown pages use `page:` + `file:` keys — NOT `generate:` + `from:`. Never use `generate:` + `from:` for custom markdown pages; that pattern is reserved for APIMatic-generated content (endpoints, models, SDK infrastructure, etc.).

4. Alternatively, run `apimatic portal toc new` to regenerate `toc.yml` automatically from current files. This overwrites `toc.yml` — review it after running.
5. If `apimatic portal serve` is already running, the page appears automatically after the `toc.yml` update. If it is not running, start it with `apimatic portal serve`.

> **Note:** Custom pages placed in `src/content/guides/` appear under the Guides group if `toc.yml` has a `dir: guides` entry.

---

## Custom UI Components

Custom UI components are JSX-style elements that can be used inside any `.md` file in `src/content/`.

> **Critical syntax rule:** Component opening tags must be on a single line — do not break tag attributes across multiple lines.

**Available components:**

- `<Callout type="...">` — Highlighted alert boxes. Types: `info` (default), `success`, `warning`, `danger`
- `<Card>` / `<CardGroup cols={N}>` — Information cards arranged in a grid layout
- `<Tabs>` / `<Tab title="...">` — Switchable content tabs
- `<CodeBlockGroup>` — Multiple code samples displayed in a tabbed interface
- `<Accordion title="...">` / `<AccordionGroup>` — Collapsible content sections
- `<Frame caption="...">` — Image with an optional caption displayed below
- `<Video url="...">` — Embedded YouTube or Vimeo video
- `<Mermaid>` — Diagram via Mermaid syntax (place a fenced `mermaid` block inside)

### Component Examples

**Callout:**

```
<Callout type="warning">
  Check that your API spec file is in src/spec/ before running portal serve.
</Callout>
```

**Card Group:**

```
<CardGroup cols={2}>
  <Card title="Authentication" icon="Key" url="page:guides/authentication">
    Learn how to authenticate API requests.
  </Card>
  <Card title="Quickstart" icon="Zap" url="page:guides/quickstart">
    Get your first API call running in minutes.
  </Card>
</CardGroup>
```

> **Important:** For internal portal page links in `<Card>` (and other components), always use the `page:` prefix — for example, `url="page:guides/getting-started"`. Do NOT use root-relative paths (`url="/guides/..."`) or absolute URLs (`url="https://..."`) for links within the portal. The `page:` prefix ensures links resolve correctly regardless of where the portal is deployed.

**Tabs:**

```
<Tabs>
  <Tab title="Node.js">
    const response = await fetch('/api/endpoint');
  </Tab>
  <Tab title="Python">
    response = requests.get('/api/endpoint')
  </Tab>
</Tabs>
```

---

## Linking Between Pages

### Linking from Markdown Pages

In custom Markdown pages (`src/content/`), use relative links to other Markdown files:

```md
[See the authentication guide](guides/authentication.md)
[See a heading in another page](guides/authentication.md#oauth-flow)
[See a heading on this page](#my-section)
```

Relative links resolve relative to the current file and also work when browsing source files on GitHub.

### Linking from API Definitions (page: prefix)

In API spec description fields, use the `page:` prefix to link to custom Markdown pages. The path is relative to the `content/` directory and has no file extension:

```md
[Authentication guide](page:guides/authentication)
[Specific heading](page:guides/authentication#oauth-flow)
```

### Linking to Auto-Generated Content

Use these permalink formats to link to generated pages:

| Target | Link format |
|--------|-------------|
| Endpoint group | `$e/{Group Name}` |
| Endpoint | `$e/{Group Name}/{Endpoint Name}` |
| Model | `$m/{Model Name}` |
| Getting started | `$h/__intro` |

Example: `[Get Users endpoint]($e/User/Get%20users)`

> **Tip:** Double-click any heading in a running portal to log its permalink to the browser's developer console (F12).
