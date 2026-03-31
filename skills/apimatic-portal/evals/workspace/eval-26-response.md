To rename the "HTTP" language tab to "REST" in your APIMatic portal, set `renameHttpToRest` to `true` directly inside `generatePortal` in your `src/APIMATIC-BUILD.json` file.

## Configuration

Open `src/APIMATIC-BUILD.json` and add `"renameHttpToRest": true` inside `generatePortal`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "renameHttpToRest": true,
    "pageTitle": "My Developer Portal",
    "navTitle": "My API",
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    }
  }
}
```

## What This Does

Setting `"renameHttpToRest": true` changes the display label of the HTTP code snippet tab from "HTTP" to "REST" throughout your portal. This is a display-only rename — it does not affect how requests are generated or the underlying `languageConfig` key, which must remain `"http"`.

## After Making the Change

Save `APIMATIC-BUILD.json` and regenerate the portal to see the updated tab label:

```
apimatic portal serve
```

Or for a production build:

```
apimatic portal generate --auth-key=YOUR_API_KEY
```

The portal will rebuild and the HTTP tab will now display as "REST" in all code snippet panels.
