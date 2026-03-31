Here are all the steps to add a custom markdown page called `overview.md` to your portal's guides section.

## Step 1: Create the markdown file

Create the file at `src/content/guides/overview.md`. Write your content using GitHub-flavored Markdown. For example:

```md
# Overview

Welcome to the API guides section. This page provides a high-level overview of how to use the API.

## What you can do

- Authenticate and make your first request
- Browse available endpoints
- Download SDK libraries for your language
```

You can also use APIMatic's custom UI components inside this file, such as `<Callout>`, `<Card>`, `<Tabs>`, and others.

## Step 2: Add the page to toc.yml

Open `src/content/toc.yml` and add a `page:` + `file:` entry for `overview.md` under the Guides group. For example:

```yaml
toc:
  - group: Guides
    items:
      - page: overview
        file: guides/overview.md
```

**Important:** Custom markdown pages always use `page:` + `file:` keys. Never use `generate:` + `from:` for custom markdown pages — that pattern is reserved for APIMatic-generated content such as endpoints, models, and SDK infrastructure.

If a Guides group with a `dir: guides` entry already exists in your `toc.yml`, you can either:

- Replace `dir: guides` with an explicit `items:` list that includes the new `page:` entry, or
- Add the `page:` entry alongside existing items in the group.

## Step 3: (Alternative) Regenerate toc.yml automatically

Instead of editing `toc.yml` by hand, you can regenerate it from the current files:

```
apimatic portal toc new
```

Run this from the project root (the directory that contains `src/`). The command is interactive and will prompt before overwriting the existing `toc.yml`. After it completes, review the generated file to confirm the overview page entry appears correctly and the navigation order is as intended.

## Step 4: Preview the result

If `apimatic portal serve` is already running, the new page will appear in the sidebar automatically after `toc.yml` is saved. If the server is not running, start it from the project root:

```
apimatic portal serve
```

Once the portal loads, open it in your browser (default: `http://localhost:3000`) and navigate to the Guides section. You should see Overview listed in the sidebar. Clicking it will render the content from `src/content/guides/overview.md`.

## Summary of files touched

| File | Change |
|------|--------|
| `src/content/guides/overview.md` | Created — contains your page content |
| `src/content/toc.yml` | Updated — added `page: overview` + `file: guides/overview.md` entry |
