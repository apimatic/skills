To automatically scroll to the authentication section when the API Playground returns a 401 Unauthorized response, set `focusAuthSectionOnUnauthorizedError` to `true` inside `portalSettings` in your `src/APIMATIC-BUILD.json`.

## Configuration

Open `src/APIMATIC-BUILD.json` and add or update the `portalSettings` block inside `generatePortal`:

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
    },
    "portalSettings": {
      "focusAuthSectionOnUnauthorizedError": true
    }
  }
}
```

## What This Does

With `focusAuthSectionOnUnauthorizedError` set to `true`, whenever a user makes a Try It Out request from the API Playground and the API returns a `401 Unauthorized` response, the portal automatically scrolls the page to the authentication section. This makes it easy for users to spot that they need to provide or correct their credentials without having to manually find the auth inputs.

The default value is `false`, so you must explicitly set it to `true` to enable this behavior.

## Field Location

The field must be placed inside `generatePortal.portalSettings` — not directly under `generatePortal`. The correct nesting path is:

```
generatePortal
  └── portalSettings
        └── focusAuthSectionOnUnauthorizedError: true
```

After saving the file, the portal will regenerate automatically if you are running `apimatic portal serve`. Once regeneration completes, test the behavior by making an unauthenticated request in the Try It Out panel — the page should scroll to the authentication section on a 401 response.
