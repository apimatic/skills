# Versioned Portals Reference

This file covers how to configure a versioned APIMatic developer portal, including directory structure, the outer `APIMATIC-BUILD.json`, per-version build files, and migration from a non-versioned setup.

---

> **Critical:** The outer `APIMATIC-BUILD.json` for a versioned portal uses `generateVersionedPortal` — **not** `generatePortal`. It must **not** contain `generatePortal`, `generatePortal.apiSpecs`, or any other `generatePortal` fields. Those belong only in the per-version build files inside `versioned_docs/`.

---

## Directory Structure

A versioned portal uses a `versioned_docs/` directory at the project root, alongside the outer `APIMATIC-BUILD.json`:

```
your-project/
├── APIMATIC-BUILD.json          ← outer file: versioning config only
└── versioned_docs/
    ├── version-2.0/             ← documentation for version 2.0
    │   ├── APIMATIC-BUILD.json  ← uses generatePortal
    │   ├── spec/
    │   ├── content/
    │   └── static/
    └── version-1.0/             ← documentation for version 1.0
        ├── APIMATIC-BUILD.json  ← uses generatePortal
        ├── spec/
        ├── content/
        └── static/
```

Each version directory follows the same structure as a standard (non-versioned) portal and must contain its own `APIMATIC-BUILD.json` using `generatePortal`.

---

## Outer APIMATIC-BUILD.json

The outer build file at the project root defines which versions exist. It uses `generateVersionedPortal` exclusively:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generateVersionedPortal": {
    "versions": [
      {
        "label": "2.0 (current)",
        "version": "2.0"
      },
      {
        "label": "1.0",
        "version": "1.0"
      }
    ]
  }
}
```

**Field explanations:**

- `generateVersionedPortal.versions` — array of version descriptors, listed in display order (first entry appears as the default/current version).
- `versions[].label` — the user-facing name shown in the portal's version selector (e.g., `"2.0 (current)"`).
- `versions[].version` — the version identifier. Must match the directory name under `versioned_docs/`. For example, `"version": "2.0"` maps to `versioned_docs/version-2.0/`.

**WRONG — do not include `generatePortal` in the outer file:**

```json
{
  "generateVersionedPortal": { ... },
  "generatePortal": {
    "apiSpecs": ["spec1"]
  }
}
```

---

## Per-Version APIMATIC-BUILD.json

Each version directory contains a standard `APIMATIC-BUILD.json` using `generatePortal`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "pageTitle": "Acme Developer Portal",
    "navTitle": "Acme API",
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    }
  }
}
```

Each version's build file is fully independent — it can have different spec files, language configs, themes, and portal settings.

---

## Migrating from Non-Versioned to Versioned

1. Create a `versioned_docs/version-1.0/` directory (adjust the version number as needed).
2. Move the existing `src/` contents (`APIMATIC-BUILD.json`, `spec/`, `content/`, `static/`) into `versioned_docs/version-1.0/`.
3. Create a new outer `APIMATIC-BUILD.json` at the project root using `generateVersionedPortal`.
4. Add future versions as additional directories under `versioned_docs/` and register them in the outer build file.
5. Set up web server redirects from old page URLs to the corresponding versioned URLs.

---

## Recommended Practices

- Only version when documentation changes significantly between releases. Minor or patch versions rarely need separate docs.
- List the most current version first in the `versions` array — it becomes the default shown to users.
- Set up a `302` redirect from a stable URL (e.g., `/v/latest`) to the current version so external links stay valid when you release a new version.
- Versioning increases build time and complexity — avoid it unless the portal has high traffic and rapid documentation changes between versions.
