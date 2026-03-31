To make the TOC a floater (floating/overlay navigation), set `pageMode` to `"wide"` globally across all portal pages. This is controlled by the `globalPageMetaData` setting inside `portalSettings` in your `src/APIMATIC-BUILD.json`.

Open `src/APIMATIC-BUILD.json` and add `"globalPageMetaData"` inside `portalSettings`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["your-api"],
    "languageConfig": {
      "http": {}
    },
    "portalSettings": {
      "globalPageMetaData": {
        "pageMode": "wide"
      }
    }
  }
}
```

If `portalSettings` already exists in your file, add `globalPageMetaData` as a new key inside it alongside any existing settings. For example:

```json
"portalSettings": {
  "enableConsoleCalls": true,
  "theme": { ... },
  "globalPageMetaData": {
    "pageMode": "wide"
  }
}
```

In `"wide"` mode, the sidebar TOC becomes a floating overlay rather than a fixed panel that takes up horizontal space — giving your content area more room.

After saving the file, let me check the server status and watch for the portal to regenerate:

```
node {skill_dir}/scripts/serve.mjs status
```

If the server is running, the portal will regenerate automatically. I'll watch for completion:

```
node {skill_dir}/scripts/serve.mjs watch
```

Once regeneration is complete, open your portal in the browser to see the floating TOC in effect.
