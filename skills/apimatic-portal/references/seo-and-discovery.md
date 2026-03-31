# SEO and Discovery Reference

This file covers SEO mode and LLMs.txt discovery configuration in `APIMATIC-BUILD.json`.

---

## Enabling SEO Mode

Add `indexable` and `baseUrl` fields inside the `generatePortal` object:

```json
{
  "generatePortal": {
    "baseUrl": "https://your-production-domain.com",
    "indexable": {}
  }
}
```

**Field explanations:**

- `indexable` — empty object `{}` enables SEO mode. Switches the portal from a Single-Page Application to server-side-rendered HTML pages. Omit the field entirely to keep SPA mode.
- `baseUrl` — the public URL where the portal is deployed. Required for SEO mode. Used in canonical tags, `sitemap.xml`, and sitemaps.

> **Warning:** Do not set `baseUrl` to `http://localhost:3000` in production builds. Use the actual domain where the portal is deployed (for example, `https://developer.yourcompany.com`). Using a localhost URL in production breaks canonical tags and sitemap entries, which defeats the purpose of SEO mode.

---

## What SEO Mode Generates

When `indexable: {}` is set, the portal build produces these additional files:

- Per-page HTML files with correct `<title>` and canonical tags
- `sitemap.xml` for page discovery by search engines
- `robots.txt` to guide search crawlers
- `404.html` to prevent SPA misidentification by crawlers
- History API routing for crawler-friendly URLs
- Meta redirect HTML files for redirects configured in `APIMATIC-BUILD.json`
- `_redirects` file for hosting platform redirect rules (for example, Netlify)

---

## When to Use SEO Mode

- Use when deploying to a public domain where search engine indexing is desired.
- Not required for internal or private portals, or for local development.
- SPA mode (no `indexable`) is simpler to deploy. SEO mode requires a server or CDN that serves individual HTML files per URL — it cannot be served from a single `index.html`.

---

## Complete Configuration Example

The following example shows a `generatePortal` object combining SEO mode with LLMs.txt generation. Both are optional and independent, but enabling both is a common production configuration:

```json
{
  "generatePortal": {
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    },
    "baseUrl": "https://developer.yourcompany.com",
    "indexable": {},
    "llmsContextGeneration": {
      "enable": true
    }
  }
}
```

**Field explanations:**

- `apiSpecs` — list of spec identifiers matching filenames in `src/spec/` (without extension).
- `languageConfig` — which code snippet languages appear in the portal. `"http": {}` produces HTTP request snippets only.
- `baseUrl` — production URL for canonical tags and sitemaps. Must not be a localhost URL.
- `indexable` — enables SEO mode (server-side HTML, sitemap, robots.txt). Use `{}` to enable.
- `llmsContextGeneration.enable` — when `true`, generates a `llms.txt` and `llms-full.txt` file at the portal root for LLM context discovery.
