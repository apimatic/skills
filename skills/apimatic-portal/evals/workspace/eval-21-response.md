To add SDK download links with languages to your APIMatic portal, you configure `languageSettings` inside `portalSettings`, which is nested inside `generatePortal` in your `src/APIMATIC-BUILD.json` file.

Before setting up `languageSettings`, I need to ask: **which language should be shown by default when users open your portal?** Set that language as `initialPlatform` in `portalSettings`.

## Key Rule: Use Template Name Identifiers

The keys inside `languageSettings` are **not** the same as the short names used in `languageConfig`. You must use the full template name identifiers — using raw names like `"python"`, `"typescript"`, or `"csharp"` will be silently ignored.

| `languageConfig` key | `languageSettings` template name |
|---|---|
| `python` | `python_generic_lib` |
| `typescript` | `ts_generic_lib` |
| `java` | `java_eclipse_jre_lib` |
| `csharp` | `cs_net_standard_lib` |
| `ruby` | `ruby_generic_lib` |
| `php` | `php_generic_lib_v2` |
| `go` | `go_generic_lib` |
| `http` | *(not applicable — HTTP is not an SDK)* |

## Configuration Example

Here is an example configuring SDK download links for Python, TypeScript, and Java, with Python set as the default displayed language via `initialPlatform`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "pageTitle": "My Developer Portal",
    "navTitle": "My API",
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {},
      "python": {},
      "typescript": {},
      "java": {}
    },
    "portalSettings": {
      "initialPlatform": "python_generic_lib",
      "languageSettings": {
        "python_generic_lib": {
          "sdkDownloadLink": "https://github.com/your-org/python-sdk/releases"
        },
        "ts_generic_lib": {
          "sdkDownloadLink": "https://github.com/your-org/typescript-sdk/releases"
        },
        "java_eclipse_jre_lib": {
          "sdkDownloadLink": "https://github.com/your-org/java-sdk/releases"
        }
      }
    }
  }
}
```

## Field Explanations

- `initialPlatform` — sets which language tab is shown by default when users open the portal. Must use the template name identifier (e.g., `python_generic_lib`), not the short `languageConfig` key.
- `languageSettings` — must be nested under `portalSettings`, which is nested under `generatePortal`.
- `sdkDownloadLink` — the URL displayed as a download button in the portal's SDK Reference section for that language. Use a GitHub releases page, npm registry link, or any direct download URL.

## Optional Per-Language Fields

You can also include these optional fields alongside `sdkDownloadLink` for each language entry:

```json
"python_generic_lib": {
  "sdkDownloadLink": "https://github.com/your-org/python-sdk/releases",
  "stabilityLevelTag": "beta",
  "disableSdkDownload": false
}
```

- `stabilityLevelTag` — displays a stability badge next to the language tab. Accepted values: `"alpha"`, `"beta"`.
- `disableSdkDownload` — set to `true` to hide the download button for a specific language. Default is `false`.

Note that `http` does not get a `languageSettings` entry because HTTP snippets are not downloadable SDKs.

## After Making Changes

Once you have updated `APIMATIC-BUILD.json`, the portal will regenerate automatically if `apimatic portal serve` is running. Open your browser at `http://localhost:3000` to verify the SDK download buttons appear in the SDK Reference section for each configured language.

For a production build:

```
apimatic portal generate --auth-key=YOUR_API_KEY
```
