To enable the debug report in your portal, add the `debug` block inside `generatePortal` in your `src/APIMATIC-BUILD.json` file.

Open `src/APIMATIC-BUILD.json` and add the `debug` property:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "debug": {
      "publishReport": true
    },
    "apiSpecs": ["your-api"],
    "languageConfig": {
      "http": {}
    }
  }
}
```

Setting `"publishReport": true` instructs APIMatic to generate a detailed HTML report covering:

- API import messages
- Validation warnings and errors from your API specification(s)
- Any API merge-related issues (if you are merging multiple specs)

By default, the report is written to `./apimatic-debug/apimatic-report.html` in the portal output. You can open that file in any browser after the portal generates.

If you want the report written to a different path, add a `reportPath` override:

```json
"debug": {
  "publishReport": true,
  "reportPath": "./my-custom-path/report.html"
}
```

There is also an optional `dumpImportedApi` flag that dumps the merged API in APIMatic format — useful if you are debugging an API merge problem:

```json
"debug": {
  "publishReport": true,
  "dumpImportedApi": true
}
```

The dump is written to `./apimatic-debug/imported-api-dump.json` by default.

After saving `APIMATIC-BUILD.json`, the portal needs to regenerate to produce the report. Checking whether the server is running first:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs status
```

- If the output contains `Running (PID ...)` — the server is live. The portal will regenerate automatically from the saved change. Watch for completion:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs watch
```

- If the output says `No server running` — either start the dev server with:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/.claude/skills/apimatic-portal/scripts/serve.mjs start --input ./
```

or run a one-off build:

```
apimatic portal generate --auth-key=YOUR_API_KEY
```

Once generation completes, open `./apimatic-debug/apimatic-report.html` (or the custom path you set) in a browser to review all warnings and errors that were generated during the portal build.
