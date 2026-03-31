To disable external API calls to APIMatic's servers, set `"enableConsoleCalls": false` inside `portalSettings` in your `src/APIMATIC-BUILD.json`.

`enableConsoleCalls` controls the interactive API Playground (Try It Out feature). Disabling it prevents the portal from making any calls to APIMatic's servers during user interactions.

Add or update `portalSettings` inside `generatePortal`:

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
      "enableConsoleCalls": false
    }
  }
}
```

**Important: useHostedPortalScript consideration**

If you are also using `useHostedPortalScript`, be aware of the following trade-offs when bundling the script locally instead of loading it from APIMatic's CDN:

- **Larger bundle size** — The portal script is bundled directly into the generated portal output rather than loaded from APIMatic's CDN. This results in a larger generated portal.
- **No automatic updates** — With the hosted portal script (the default), APIMatic can push bug fixes and improvements to your portal automatically without requiring you to regenerate. When `useHostedPortalScript` is set to `false`, your portal will not receive those automatic updates — you must regenerate the portal frequently to stay current with fixes.
- **Frequent regeneration required** — To pick up any APIMatic portal script updates, you must manually run `apimatic portal generate` each time you want to incorporate changes.

Setting `"enableConsoleCalls": false` inside `portalSettings` is sufficient to disable the API Playground. You do not need to change `useHostedPortalScript` unless you have a specific reason to bundle the script locally.

After saving the change to `APIMATIC-BUILD.json`, regenerate your portal to apply it:

```
apimatic portal generate
```

Or, if using the local dev server:

```
apimatic portal serve
```
