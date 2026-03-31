# Build Directory Reference

This file covers the APIMatic Docs as Code build directory layout, individual directory purposes, sample `toc.yml`, `APIMATIC-BUILD.json` configuration (minimal and extended), portal settings fields, and guidance on where to run portal commands.

---

## Build Directory Layout

The `apimatic quickstart` command creates a project root containing a `src/` directory:

```
your-project/
└── src/
    ├── APIMATIC-BUILD.json
    ├── content/
    │   ├── toc.yml
    │   └── guides/
    ├── spec/
    │   ├── APIMATIC-META.json
    │   └── your-spec-file.json
    └── static/
        └── images/
```

All `apimatic portal` commands (`serve`, `generate`, `toc`) run from the project root — the directory that contains `src/` — not from inside `src/`.

###  On file names
The APIMatic build file name needs to end with APIMATIC-BUILD.json, so dev-APIMATIC-BUILD.json and prod-APIMATIC-BUILD.json are also valid names.

The APIMatic meta file names needs to start with
APIMATIC-META.json, so APIMATIC-META-dev.json is also a valid name.

---

## spec/ Directory

Place your API specification file here. APIMatic auto-detects the format. Supported formats include:

- OpenAPI 2.0 (Swagger) — JSON or YAML
- OpenAPI 3.0 — JSON or YAML
- RAML 0.8 / 1.0
- Postman Collection v2

Multiple spec files placed in `spec/` are merged automatically into a single portal.

The `APIMATIC-META.json` file (created by quickstart) stores API metadata such as name, version, and base URI. Do not delete it.

---

## content/ Directory

Custom markdown documentation pages live here. APIMatic uses GitHub-flavored Markdown.

The `toc.yml` file controls portal navigation — which pages appear, in what order, and under which groups.

**Sample toc.yml:**

```yaml
toc:
  - group: Getting Started
    items:
      - generate: How to Get Started
        from: getting-started
  - group: Guides
    dir: guides
  - generate: API Endpoints
    from: endpoints
  - generate: Models
    from: models
```

To regenerate `toc.yml` from current content and spec files, run from the project root:

```
apimatic portal toc new
```

This overwrites `toc.yml` with a freshly generated version reflecting all discovered content. Review it after regenerating to confirm the structure matches the intended navigation.

---

## static/ Directory

Place static assets here: images, logos, favicons, PDFs, and other files served as-is.

Common files:

- `static/favicon.ico` — browser tab icon
- `static/images/logo.png` — portal logo

The `static/` directory is optional. The portal generates without it if no static assets are needed.

---

## Minimal APIMATIC-BUILD.json

The minimal valid configuration that produces a working portal:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "pageTitle": "My Developer Portal",
    "navTitle": "My API",
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    }
  }
}
```

**Field explanations:**

- `$schema` — links to the APIMatic JSON Schema for editor autocomplete and validation. Keep this in all configuration files.
- `buildFileVersion` — always `"1"` for the current CLI version. Do not change this value.
- `generatePortal.pageTitle` — **(required)** the portal title used in the browser `<title>` tag.
- `generatePortal.navTitle` — **(required)** the title shown in the portal's top navigation bar.
- `generatePortal.apiSpecs` — list of spec identifiers. Each identifier is the filename (without extension) of a file in `spec/`, or a folder name inside `spec/` for multi-file specs. Example: `"apiSpecs": ["petstore"]` targets `spec/petstore.json`.
- `generatePortal.languageConfig` — which code snippet languages to include in the portal. `"http": {}` generates HTTP request snippets only (no full SDK). Add other languages as needed:

```json
"languageConfig": {
  "http": {},
  "python": {},
  "typescript": {},
  "csharp": {},
  "java": {},
  "php": {},
  "ruby": {}
}
```

---

## Page Configuration Fields

These fields sit directly inside `generatePortal` and control branding and metadata:

```json
{
  "generatePortal": {
    "pageTitle": "Acme Developer Portal",
    "navTitle": "Acme API",
    "logoUrl": "/static/images/logo.png",
    "logoUrlDark": "/static/images/logo-dark.png",
    "faviconUrl": "/static/images/favicon.ico"
  }
}
```

**Field explanations:**

- `pageTitle` — **(required)** browser tab title.
- `navTitle` — **(required)** text shown in the top navigation bar (used when no logo is set or as alt text).
- `logoUrl` — path to the brand logo image shown in the nav bar (light mode).
- `logoUrlDark` — path to the brand logo for dark mode. Falls back to `logoUrl` if omitted.
- `faviconUrl` — path to the favicon. Defaults to `./static/images/favicon.ico`.

Logo and favicon paths should be relative to the portal root (e.g., `/static/images/logo.png`).

---

## portalSettings Fields

The `portalSettings` object lives inside `generatePortal` and controls portal behavior:

```json
{
  "generatePortal": {
    "portalSettings": {
      "enableConsoleCalls": true,
      "useProxyForConsoleCalls": false,
      "renameHttpToRest": false,
      "focusAuthSectionOnUnauthorizedError": false,
      "enableExport": true
    }
  }
}
```

**Field explanations:**

- `enableConsoleCalls` — enables the interactive API Playground (Try It Out). Default: `true`. Set to `false` to disable.
- `useProxyForConsoleCalls` — routes API Playground calls through an APIMatic proxy to bypass CORS restrictions. Default: `false`. Enable when the API does not support CORS.
- `renameHttpToRest` — renames the "HTTP" language tab in code snippets to "REST". Default: `false`.
- `focusAuthSectionOnUnauthorizedError` — automatically scrolls to the authentication section when an API call returns a 401 Unauthorized response. Default: `false`.
- `enableExport` — shows the "Export" button in the portal allowing users to download the API spec. Default: `true`.


---

## languageSettings Fields

The `languageSettings` object inside `portalSettings` configures per-language options:

```json
{
  "generatePortal": {
    "portalSettings": {
      "languageSettings": {
        "python_generic_lib": {
          "sdkDownloadLink": "https://github.com/your-org/python-sdk/releases",
          "stabilityLevelTag": "beta",
          "disableSdkDownload": false
        }
      }
    }
  }
}
```

**languageConfig key → languageSettings template name mapping:**

| `languageConfig` key | `languageSettings` template name |
|---|---|
| `python` | `python_generic_lib` |
| `typescript` | `ts_generic_lib` |
| `java` | `java_eclipse_jre_lib` |
| `csharp` | `cs_net_standard_lib` |
| `ruby` | `ruby_generic_lib` |
| `php` | `php_generic_lib_v2` |
| `go` | `go_generic_lib` |
| `http` | *(no languageSettings key — HTTP is not an SDK)* |

> **Critical:** The `languageSettings` key is NOT the same as the `languageConfig` key. Always use the template name from the right column above. Using the raw `languageConfig` key (e.g., `"typescript"`, `"python"`) will be silently ignored.

**Field explanations:**

- Keys are template name identifiers from the table above. Use the exact template name — never the short `languageConfig` names like `"python"` or `"typescript"`.
- `sdkDownloadLink` — URL for downloading the SDK. Shown as a download button in the portal.
- `stabilityLevelTag` — marks the language SDK with a stability badge. Accepted values: `"alpha"`, `"beta"`.
- `disableSdkDownload` — hides the SDK download button for this language. Default: `false`.

---

## portalSettings.theme.layout

The `layout` object inside `portalSettings.theme` controls the width and alignment of the portal's main container, content area, and sidebar behavior:

```json
{
  "generatePortal": {
    "portalSettings": {
      "theme": {
        "layout": {
          "mainContainer": {
            "maxWidth": "1250px",
            "align": "center"
          },
          "content": {
            "maxWidth": "700px",
            "align": "center"
          },
          "sidebar": {
            "mode": "standard",
            "variation": "expanded"
          }
        }
      }
    }
  }
}
```

### mainContainer

Controls the overall portal width:

- `maxWidth` — maximum width of the main container in `px` or `rem`. Minimum effective value is `1250px` / `80rem`. Default: `"100%"`.
- `align` — horizontal alignment of the container. Accepted values: `"left"`, `"center"`. Default: `"center"`.

### content

Controls the width of the content columns (second and third columns):

- `maxWidth` — maximum width in `px` or `rem`. Values below `700px` / `44rem` are ignored. Default: `"100%"`.
- `align` — alignment of the content. Accepted values: `"left"`, `"center"`. Default: `"center"`.

### sidebar

Controls the left navigation sidebar's structure and behavior:

**`mode`** — how top-level navigation items are grouped:

| Value | Description |
|---|---|
| `standard` | All navigation items shown in a vertical list, including nested levels. |
| `dropdown` | Top-level items shown in a dropdown menu; child items appear based on selection. |

**`variation`** — how first-level sections behave on page load:

| Value | Description |
|---|---|
| `basic` | All first-level sections visible and not collapsible. |
| `expanded` | All first-level sections visible and collapsible by the user. |
| `collapsed` | All first-level sections collapsed by default; user can expand them. |

---

## codeSampleApi Field

`codeSampleApi` is a **top-level sibling** of `generatePortal` (not nested inside it):

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": { },
  "codeSampleApi": {
    "isEnabled": true
  }
}
```

**Field explanations:**

- `codeSampleApi.isEnabled` — **(required when using codeSampleApi)** enables generation of Code Sample API artifacts.
- `codeSampleApi.defaultVersion` — the default API version for the code sample API. Only relevant for multi-versioned portals. Defaults to the first version in `generateVersionedPortal.versions`.

> **Important:** `codeSampleApi` must be placed at the top level of the JSON object, at the same level as `generatePortal` — NOT nested inside `generatePortal`.

---

## Where Commands Run

All portal commands must run from the project root — the directory containing `src/`:

```
cd my-portal
apimatic portal serve
```

Running from inside `src/` will fail because the CLI looks for the `src/` folder relative to the current working directory:

```
cd my-portal/src
apimatic portal serve
```

If you need to run the command from a different location, use the `--input` flag to specify the project root explicitly:

```
apimatic portal serve --input=/absolute/path/to/my-portal
```
