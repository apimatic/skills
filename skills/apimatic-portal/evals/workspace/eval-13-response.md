# Configuring SDK Download Links and Disabling the Download Button

Both `sdkDownloadLink` and `disableSdkDownload` are configured per language inside `portalSettings.languageSettings` in your `src/APIMATIC-BUILD.json`. The `languageSettings` keys must be the APIMatic SDK template name identifiers — not the short names used in `languageConfig`.

## Template Name Reference

| Language | `languageSettings` template name |
|---|---|
| Python | `python_generic_lib` |
| TypeScript | `ts_generic_lib` |
| PHP | `php_generic_lib_v2` |
| Java | `java_eclipse_jre_lib` |
| Ruby | `ruby_generic_lib` |
| C# | `cs_net_standard_lib` |
| Go | `go_generic_lib` |

## Complete Configuration

Open `src/APIMATIC-BUILD.json` and add or merge the `portalSettings.languageSettings` block inside `generatePortal`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "pageTitle": "My Developer Portal",
    "navTitle": "My API",
    "apiSpecs": ["your-api-spec"],
    "portalSettings": {
      "languageSettings": {
        "python_generic_lib": {
          "sdkDownloadLink": "https://pypi.org/project/your-sdk/",
          "disableSdkDownload": false
        },
        "ts_generic_lib": {
          "sdkDownloadLink": "https://www.npmjs.com/package/your-sdk",
          "disableSdkDownload": false
        },
        "php_generic_lib_v2": {
          "sdkDownloadLink": "https://packagist.org/packages/yourcompany/your-sdk",
          "disableSdkDownload": true
        },
        "java_eclipse_jre_lib": {
          "sdkDownloadLink": "https://central.sonatype.com/artifact/com.yourcompany/your-sdk",
          "disableSdkDownload": false
        },
        "ruby_generic_lib": {
          "sdkDownloadLink": "https://rubygems.org/gems/your-sdk",
          "disableSdkDownload": true
        },
        "cs_net_standard_lib": {
          "sdkDownloadLink": "https://www.nuget.org/packages/YourSdk/",
          "disableSdkDownload": false
        },
        "go_generic_lib": {
          "sdkDownloadLink": "https://pkg.go.dev/github.com/yourcompany/your-sdk",
          "disableSdkDownload": false
        }
      }
    }
  }
}
```

## Field Explanations

- **`sdkDownloadLink`** — The URL shown as the SDK download button in the portal's SDK Reference section. Point this to wherever your SDK is hosted: a GitHub releases page, a package registry (PyPI, npm, NuGet, Packagist, RubyGems, Maven Central, pkg.go.dev), or any other download location.
- **`disableSdkDownload`** — When `true`, the download button is hidden for that language in the portal. When `false` (the default), the button is shown using the `sdkDownloadLink` URL.

## Selective Download Button Control

In the example above:
- `php_generic_lib_v2` and `ruby_generic_lib` have `disableSdkDownload: true` — their download buttons will be hidden in the portal.
- All other languages have `disableSdkDownload: false` — their download buttons will be visible and link to the specified `sdkDownloadLink` URLs.

You can mix and match per language: enable download links for stable SDKs and disable buttons for SDKs still in early development.

## Important Notes

- `languageSettings` is nested inside `portalSettings`, which is nested inside `generatePortal`.
- The template name identifiers (`python_generic_lib`, `ts_generic_lib`, etc.) must be used exactly as shown — using any other form will be silently ignored.
- Only include `languageSettings` entries for languages you have listed in `languageConfig`.
- Replace each `sdkDownloadLink` value with the actual URL for your hosted SDK.

After saving the file, the portal will regenerate automatically if your local dev server is running (typically 15–60 seconds). Navigate to an SDK Reference page in the portal to confirm the download buttons appear or are hidden as configured.
