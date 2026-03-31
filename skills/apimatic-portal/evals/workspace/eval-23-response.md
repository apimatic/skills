To enable a proxy for console calls, add `"useProxyForConsoleCalls": true` inside `portalSettings` in your `src/APIMATIC-BUILD.json`.

Open `src/APIMATIC-BUILD.json` and add the field under `generatePortal.portalSettings`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["my-api"],
    "languageConfig": {
      "http": {}
    },
    "portalSettings": {
      "useProxyForConsoleCalls": true
    }
  }
}
```

If your `portalSettings` block already has other fields (theme, copilot, languageSettings, etc.), just add `"useProxyForConsoleCalls": true` alongside them — for example:

```json
"portalSettings": {
  "enableConsoleCalls": true,
  "useProxyForConsoleCalls": true,
  "theme": {
    ...
  }
}
```

After saving the file, I'll check whether your preview server is running:

```
node {skill_dir}/scripts/serve.mjs status
```

If it is running, your portal will regenerate automatically. I'll watch for completion:

```
node {skill_dir}/scripts/serve.mjs watch
```

Once regeneration finishes, open http://localhost:3000 in your browser to confirm the change is active. Console calls in the API playground will now be routed through the APIMatic proxy.
