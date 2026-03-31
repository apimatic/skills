Versioned portals let you serve multiple API versions side by side with a version switcher in the portal UI.

Before I scaffold the structure, I need a couple of details from you:

1. How many API versions do you have? (e.g., 1.0 and 2.0)
2. What are the version labels you want displayed in the portal's version selector? (e.g., "2.0 (current)" and "1.0")
3. Where are your spec files? Provide the path to each spec file (OpenAPI JSON/YAML, Postman collection, or other supported format) — one per version.

Once you confirm those, here is exactly what I will set up for you.

---

## Versioned Portal Structure

A versioned portal uses a different root layout from a single-spec portal. The outer `APIMATIC-BUILD.json` uses `generateVersionedPortal` (not `generatePortal`), and each version lives in its own subdirectory inside `versioned_docs/`.

### Directory layout

```
my-portal/
├── APIMATIC-BUILD.json          <- outer build file (versioning config only)
└── versioned_docs/
    ├── version-2.0/             <- one directory per version
    │   ├── APIMATIC-BUILD.json  <- per-version build file (uses generatePortal)
    │   ├── spec/
    │   │   └── your-v2-spec.json
    │   ├── content/
    │   │   └── toc.yml
    │   └── static/
    └── version-1.0/
        ├── APIMATIC-BUILD.json  <- per-version build file (uses generatePortal)
        ├── spec/
        │   └── your-v1-spec.json
        ├── content/
        │   └── toc.yml
        └── static/
```

### Outer APIMATIC-BUILD.json (versioning config only)

This file sits at the project root alongside `versioned_docs/`. It uses `generateVersionedPortal` exclusively — never `generatePortal`. Do not include `generatePortal`, `apiSpecs`, or any other portal fields in this file.

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

Field explanations:

- `generateVersionedPortal.versions` — array of version descriptors, listed in display order. The first entry is shown as the default/current version.
- `versions[].label` — the user-facing text shown in the portal's version selector dropdown.
- `versions[].version` — the version identifier. Must match the directory name under `versioned_docs/` with a `version-` prefix applied. For example, `"version": "2.0"` maps to `versioned_docs/version-2.0/`.

### Per-version APIMATIC-BUILD.json

Each version directory has its own `APIMATIC-BUILD.json` that uses `generatePortal` normally. Each is fully independent — it can reference a different spec file, theme, language config, or portal settings.

`versioned_docs/version-2.0/APIMATIC-BUILD.json`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "pageTitle": "Acme Developer Portal",
    "navTitle": "Acme API",
    "apiSpecs": ["your-v2-spec"],
    "languageConfig": {
      "http": {}
    }
  }
}
```

`versioned_docs/version-1.0/APIMATIC-BUILD.json`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "pageTitle": "Acme Developer Portal",
    "navTitle": "Acme API",
    "apiSpecs": ["your-v1-spec"],
    "languageConfig": {
      "http": {}
    }
  }
}
```

The `apiSpecs` value is the filename (without extension) of the spec file in that version's `spec/` directory.

---

## Steps I will perform once you confirm the details

1. Create the project directory and the `versioned_docs/` folder.
2. Create `version-1.0/` and `version-2.0/` subdirectories (using your actual version numbers), each with `spec/`, `content/`, and `static/` folders.
3. Copy your spec files into the appropriate `spec/` directories.
4. Write the outer `APIMATIC-BUILD.json` at the project root using `generateVersionedPortal` with your version list.
5. Write a per-version `APIMATIC-BUILD.json` inside each version directory using `generatePortal`.
6. Run `apimatic portal toc new` inside each version directory to generate the initial `toc.yml`.
7. Start the local dev server from the project root (the directory containing the outer `APIMATIC-BUILD.json`):

```
apimatic portal serve
```

Once the portal URL appears, you will see the version selector in the portal UI allowing users to switch between versions.

---

## Key Rules to Remember

- The outer `APIMATIC-BUILD.json` uses `generateVersionedPortal` only. Never include `generatePortal` or `apiSpecs` in it.
- Each version directory's `APIMATIC-BUILD.json` uses `generatePortal` — never `generateVersionedPortal`.
- The `version` field in the outer file must match the directory name under `versioned_docs/` with the `version-` prefix applied (e.g., `"version": "2.0"` maps to `versioned_docs/version-2.0/`).
- List the most current version first in the `versions` array so it is shown as the default.

---

Please provide your version labels and the paths to your spec files, and I will scaffold everything from there.
