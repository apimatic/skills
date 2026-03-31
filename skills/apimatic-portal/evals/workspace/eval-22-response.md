# Adding Published SDK Information to Languages

To display published SDK information (such as a download link or package repository details) for your languages in the portal, you configure `portalSettings.languageSettings` inside `generatePortal` in your `src/APIMATIC-BUILD.json`.

## What "published SDK information" means

When an SDK is published (e.g., to PyPI, npm, NuGet, Maven), you can:

1. Set a **download link** (`sdkDownloadLink`) — a URL pointing to the SDK's package page or repository. This link appears in the portal's language tab so developers can easily find and install the SDK.
2. Enable or disable the **SDK download button** (`disableSdkDownload`).
3. Optionally configure the **package repository** and **package settings** in `languageConfig` (for languages like C# with NuGet).

## Step 1: Open your build file

Open `src/APIMATIC-BUILD.json` in your project.

## Step 2: Add `languageSettings` under `portalSettings`

Add or update the `portalSettings.languageSettings` block. Use the APIMatic SDK language identifier as the key for each language. Common identifiers:

| Language    | APIMatic Language Identifier  |
|-------------|-------------------------------|
| Python      | `python_generic_lib`          |
| TypeScript  | `typescript_generic_lib`      |
| C#          | `cs_net_standard_lib`         |
| Java        | `java_eclipse_jre_lib`        |
| PHP         | `php_generic_lib`             |
| Ruby        | `ruby_generic_lib`            |
| Go          | `go_generic_lib`              |

For each language, set:

- `sdkDownloadLink` — the URL to the published SDK (e.g., the npm page, PyPI page, NuGet listing)
- `disableSdkDownload` — set to `false` to show the download button (default), or `true` to hide it

Here is an example with Python and TypeScript SDKs published to PyPI and npm respectively:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["my-api"],
    "languageConfig": {
      "http": {},
      "python": {},
      "typescript": {}
    },
    "portalSettings": {
      "languageSettings": {
        "python_generic_lib": {
          "sdkDownloadLink": "https://pypi.org/project/my-api-sdk/",
          "disableSdkDownload": false
        },
        "typescript_generic_lib": {
          "sdkDownloadLink": "https://www.npmjs.com/package/my-api-sdk",
          "disableSdkDownload": false
        }
      }
    }
  }
}
```

## Step 3: (Optional) Add package repository details in `languageConfig`

For languages with package manager metadata (like C# with NuGet), you can also add repository and package settings directly under `languageConfig`:

```json
"languageConfig": {
  "csharp": {
    "packageRepository": "NuGet",
    "packageSettings": {
      "PackageName": "MyCompany.ApiClient",
      "Version": "1.0.0"
    }
  }
}
```

## Step 4: Preview your changes

After saving `APIMATIC-BUILD.json`, check that the portal server is running:

```
node {skill_dir}/scripts/serve.mjs status
```

If it is running, the portal will regenerate automatically. Watch for completion:

```
node {skill_dir}/scripts/serve.mjs watch
```

Once regeneration completes, open http://localhost:3000 in your browser. Navigate to any API endpoint — each language tab in the SDK Reference section will now show the published SDK link so developers can click through to install it.

## Key points to remember

- `languageSettings` keys must exactly match APIMatic's SDK language identifiers (e.g., `python_generic_lib`, not `python`).
- `languageSettings` lives under `portalSettings`, which lives under `generatePortal` — not at the top level.
- `sdkDownloadLink` should be the full URL to the package page (PyPI, npm, NuGet, Maven Central, etc.).
- Setting `disableSdkDownload: true` hides the download button entirely; set it to `false` (or omit it) to show it.
- See `examples/comprehensive-build.json` for a complete working example with multiple languages configured.
