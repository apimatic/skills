# Content and Navigation

How to add pages to an APIMatic CLI v2 portal and control the sidebar and tabs.

## Contents

- [The src directory](#the-src-directory)
- [Pages](#pages)
- [Page URLs and links](#page-urls-and-links)
- [Images and other files](#images-and-other-files)
- [nav.json](#navjson)
- [Tabs](#tabs)
- [Folders](#folders)
- [MDX components](#mdx-components)
- [Reserved addresses](#reserved-addresses)
- [Worked examples](#worked-examples)

---

## The src directory

```
src/
├── apimatic.json     # portal, SDK language, and plugin settings
├── content/          # your pages (.md or .mdx)
│   ├── nav.json      # top-level order and tabs
│   └── index.md      # home page
├── spec/             # your API definition(s)
└── static/           # images and other files pages and apimatic.json use
```

- **`spec/`** — OpenAPI (3.1, 3.0, 2.0), RAML, Postman, and other formats APIMatic accepts. The API reference, playground, SDKs, and code samples are generated from it. Each spec's file name becomes the URL segment of its operation pages, below `/api/`. With more than one spec, set `portal.site.name` in `apimatic.json`.
- **`content/`** — your guides. Only `.md` and `.mdx` files and `nav.json` files are read.
- **`static/`** — images, PDFs, and other files, served from the site root.

Run `apimatic api validate --file=src/spec/<file>` to check a spec before building.

---

## Pages

Every page is a `.md` or `.mdx` file in `src/content/` (or a subfolder) that **starts with front matter giving its `title`**. The title names the page in the sidebar and becomes the page heading.

```md
---
title: Getting started
description: Make your first API call in five minutes.
---

Install the SDK, set your API key, and call your first endpoint.
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Page title and sidebar label. Must be non-empty text — quote it if it looks like a number or `true`/`false` (e.g. `title: "2024"`). |
| `description` | No | Short summary shown under the title and used in page metadata. |

The build fails if any page has no front matter, invalid YAML in it, or no `title`. The CLI lists every page that needs fixing.

- Use `.md` for plain Markdown. Use `.mdx` when the page uses components like `<Callout>` or `<Cards>` (these also work in `.md` files, but `.mdx` is the conventional choice).
- Do not repeat the title as a `# Heading` at the top of the body — the title is already rendered.
- Standard Markdown works: headings, lists, tables, links, images, and fenced code blocks with a language (```` ```python ````). Add a title to a code block with ```` ```js title="client.js" ````.

**Adding or removing a page needs the preview restarted.** Editing an existing page applies live.

---

## Page URLs and links

A page's URL is its path under `src/content/` without the extension:

| File | URL |
|------|-----|
| `content/index.md` | `/` |
| `content/changelog.md` | `/changelog` |
| `content/guides/quickstart.md` | `/guides/quickstart` |
| `content/guides/index.md` | `/guides` |
| `content/(tutorials)/webhooks.md` | `/webhooks` (a `(group)` folder is left out of the URL) |

Link between pages with normal Markdown links using these URLs: `[Quickstart](/guides/quickstart)`. API reference pages live under `/api/`.

Every page is also available as Markdown at `<url>.md`, and the whole portal is summarized at `/llms.txt` and `/llms-full.txt`.

---

## Images and other files

- An image written with a leading `/` (e.g. `![Logo](/images/logo.png)`) is read from `src/static/` — here, `src/static/images/logo.png`.
- Any other relative path (e.g. `![Diagram](./diagram.png)`) is read from beside the page in `src/content/`.
- The build fails if a page shows an image it cannot find.

Creating `src/static/` while the preview is running needs a restart before its files are served.

---

## nav.json

Each folder in `src/content/` can have a `nav.json` that sets the order of the pages and folders in it. It has only two settings:

```json
{
  "title": "Guides",
  "pages": ["quickstart", "authentication", "errors", "..."]
}
```

| Setting | Description |
|---------|-------------|
| `pages` | Order of the pages and folders in **this** directory. |
| `title` | Names this folder in the sidebar (outranks the folder name and its index page's title). In `src/content/nav.json` it names the **Home** tab. |

Rules for `pages` entries — the CLI refuses a file that breaks them:

- An entry is the **bare name** of a page (file name without `.md`/`.mdx`) or a subfolder **in the same directory**. No extensions, no slashes: `"quickstart"`, not `"quickstart.md"` or `"guides/quickstart"`.
- `"..."` stands for everything this file does not name. Without it, unnamed pages are placed after the last named page.
- Each entry may appear only once.
- In a subfolder's `nav.json`, do not list `"index"` — the folder itself links to its index page, and the parent's `nav.json` positions the folder.
- A folder with no pages in it cannot be listed.
- Tokens (only in `src/content/nav.json`): `"apimatic:sdks"`, `"apimatic:plugin"`, `"apimatic:api"`. See [Tabs](#tabs).
- Any other setting (e.g. `"order"`, `"icon"`) is an error — only `title` and `pages` exist.
- Save the file as UTF-8 **without** a byte-order mark.

Editing a `nav.json` applies live in the preview.

---

## Tabs

The top level of the portal is shown as tabs, decided by `src/content/nav.json`:

- **Home** comes first. It holds `index.md`, every other page at the top level, and any folders the file does **not** list. It opens on `index.md`. The root file's `title` renames it.
- **Each folder listed** in `src/content/nav.json` becomes a tab of its own, after Home, in the file's order.
- **Generated tabs** are positioned with tokens:

| Token | Tab |
|-------|-----|
| `apimatic:sdks` | **SDKs** — a card per language in `apimatic.json` `languages`, plus a page per language |
| `apimatic:plugin` | **Context Plugin** — shown when `apimatic.json` has a `plugin` block or `portal.pluginUrl` |
| `apimatic:api` | **API Reference** — generated from `src/spec/` |

If the root `nav.json` names none of the tokens, the generated tabs are placed in their default order.

Example — Home, then a Guides tab, then the API Reference, SDKs, and Context Plugin tabs:

```json
{
  "title": "Overview",
  "pages": ["index", "changelog", "guides", "apimatic:api", "apimatic:sdks", "apimatic:plugin"]
}
```

Here `index` and `changelog` are pages in Home (the root `nav.json` may list `index` to order it among Home's pages), and `guides` is a folder, so it becomes its own tab.

A folder that serves the home page cannot be a tab. Do not name a top-level page or folder `api` — that is where the API reference is mounted; use `apimatic:api` to position it.

---

## Folders

- A folder appears in the sidebar as a group named after the directory, or its index page's title, or the `title` in its own `nav.json` (highest priority).
- A folder with an `index.md` links to it; without one it is only a heading.
- Each folder orders its own children with its own `nav.json`. The parent's `nav.json` only positions the folder as a whole.
- A folder named in parentheses, like `(tutorials)`, groups pages in the sidebar without adding its name to their URLs.

---

## MDX components

Pages can use these components (from Fumadocs UI) without importing them:

### Callout

```mdx
<Callout>
  Use a test API key while you build.
</Callout>

<Callout type="warn" title="Rate limits">
  Requests over 100 per second return `429 Too Many Requests`.
</Callout>
```

`type` is one of `info` (default), `warn`, `error`, `success`, `idea`. `title` is optional.

### Cards

```mdx
<Cards>
  <Card title="Quickstart" href="/guides/quickstart" description="Make your first call." />
  <Card title="Authentication" href="/guides/authentication" description="Get and use an API key." />
  <Card title="Status page" href="https://status.acme.com" />
</Cards>
```

`href` takes a portal page URL starting with `/` (see [Page URLs and links](#page-urls-and-links)) or an external URL. Use `<Cards>` to lay cards out in a grid.

### Code block tabs

Fenced code blocks are syntax highlighted automatically. There is no general-purpose `<Tabs>` component — to show the same example in several languages, use consecutive fenced code blocks with a `title` on each, or rely on the API reference pages, which already show code samples in every configured SDK language.

Other components from CLI v1 portals (`<CardGroup>`, `page:` links, custom HTML components in `src/components/`) are not supported.

---

## Reserved addresses

The portal serves its generated pages at `/sdks` (and `/sdks/<language>`) and `/context-plugin`. A page in `src/content/` that would be served there (for example `content/sdks/index.md` or `content/context-plugin.md`) is refused. `/api` belongs to the API reference.

---

## Worked examples

### Add a new guide page

1. Create `src/content/guides/webhooks.md`:

   ```md
   ---
   title: Webhooks
   description: Receive events from the API.
   ---

   Register an endpoint in the dashboard, then verify each event's signature.
   ```

2. If `src/content/guides/nav.json` lists pages explicitly and does not end with `"..."`, add `"webhooks"` where it should appear.
3. Restart the preview (`serve.mjs restart --input ./`) — adding a page needs a restart.

### Make a Guides tab

1. Put the guide pages in `src/content/guides/`, with an optional `index.md` as the tab's landing page.
2. Add `"guides"` to `pages` in `src/content/nav.json`.
3. Optionally add `src/content/guides/nav.json` with a `title` and page order.

### Put the API Reference before the SDKs

In `src/content/nav.json`: `"pages": ["index", "...", "apimatic:api", "apimatic:sdks"]`.
