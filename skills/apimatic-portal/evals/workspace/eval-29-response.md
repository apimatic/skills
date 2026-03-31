# Enabling Code Sample API

To enable the Code Sample API feature, add `"codeSampleApi"` as a **top-level key** in your `src/APIMATIC-BUILD.json` file — it must be a sibling of `generatePortal`, not nested inside it.

## Edit `src/APIMATIC-BUILD.json`

Open `src/APIMATIC-BUILD.json` and add the `codeSampleApi` block at the top level:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["my-api"],
    "languageConfig": {
      "http": {}
    }
  },
  "codeSampleApi": {
    "isEnabled": true
  }
}
```

**Important:** `codeSampleApi` is a top-level sibling of `generatePortal`. Do NOT place it inside `generatePortal` or inside `portalSettings`.

## After Saving

Check that the preview server is running:

```
node {skill_dir}/scripts/serve.mjs status
```

If it is running, watch for regeneration to complete:

```
node {skill_dir}/scripts/serve.mjs watch
```

Once regeneration finishes (exit code 0), open your browser at http://localhost:3000 to review the changes.

If no server is running, start one first:

```
node {skill_dir}/scripts/serve.mjs start --input ./
```

Then watch for completion as above.
