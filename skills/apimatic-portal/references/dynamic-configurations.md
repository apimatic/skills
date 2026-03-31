# Dynamic Configurations Reference

This file covers dynamic portal configurations using the `APIMaticDevPortal.ready` function and `tailIncludes` in `APIMATIC-BUILD.json`, which inject runtime values such as auth credentials into the portal at load time.

## Contents

- [What Are Dynamic Configurations](#what-are-dynamic-configurations)
- [Discovering Available Properties](#discovering-available-properties) — inspecting the portal's `config` object via browser dev tools
- [The Ready Function](#the-ready-function) — `APIMaticDevPortal.ready`, `setConfig` callback, property overrides
- [Injecting the Script via tailIncludes](#injecting-the-script-via-tailincludes) — loading the config file in `APIMATIC-BUILD.json`
- [Complete Configuration Example](#complete-configuration-example)

---

## What Are Dynamic Configurations

The API developer portal contains client configurations that are loaded through the spec file and can be updated manually from the portal. Dynamic configurations allow programmatic access to these settings, enabling updates at the time of portal load.

Values are set using a JavaScript file that calls `APIMaticDevPortal.ready` with a `setConfig` callback. The file is injected into the portal via the `tailIncludes` property in `APIMATIC-BUILD.json`.

---

## Discovering Available Properties

To find out which properties are available for dynamic configuration:

1. Open the APIMatic DX Portal in a browser and open the developer console
2. Navigate to the **Network** tab
3. Refresh the page
4. Find the network call named `docsgen?template=...` and click on it
5. Select the **Preview** tab to view the response JSON object
6. In the response, locate the nested path **Data Model** > **config** — this `config` object contains all properties that can be updated dynamically

Property names used in the `setConfig` callback must match the keys found in this `config` object exactly.

---

## The Ready Function

Create a JavaScript file in `src/static/scripts/`. The file calls `APIMaticDevPortal.ready` with a `setConfig` callback that receives the current configuration and returns the updated configuration:

```javascript
// src/static/scripts/config.js
APIMaticDevPortal.ready(({ setConfig }) =>
  setConfig((defaultConfig) => {
    return {
      ...defaultConfig,
      showFullCode: false,
      auth: {
        oauth_2_0: {
          OAuthClientId: "OAuthClientId",
          OAuthClientSecret: "OAuthClientSecret",
          OAuthRedirectUri: "OAuthRedirectUri",
          OAuthToken: "",
          OAuthScopes: ["album"],
        },
      },
    };
  })
);
```

**Field explanations:**

- `setConfig` — accepts a callback that receives `defaultConfig` (the portal's current configuration object) and returns the updated configuration
- `defaultConfig` — always spread this to preserve existing settings; override only the properties you want to change
- `auth` — authentication configuration object; keys correspond to auth scheme names defined in the API spec (for example, `oauth_2_0`, `bearerAuth`)
- Properties inside each auth scheme match the authentication parameters for that scheme (for example, `OAuthClientId`, `OAuthClientSecret`, `OAuthRedirectUri`, `OAuthToken`, `OAuthScopes`)

**Important:** If the additional property flag is false and a new property is added that is not present in the data model schema, the console will throw an error indicating that the new property cannot be added.

---

## Injecting the Script via tailIncludes

Add the JavaScript file to the portal using the `tailIncludes` property inside `generatePortal` in `APIMATIC-BUILD.json`:

```json
{
  "generatePortal": {
    "tailIncludes": "<script defer src='static/scripts/config.js'></script>"
  }
}
```

**Field explanations:**

- `tailIncludes` — HTML string injected at the bottom of the generated portal page; use a `<script defer>` tag to load the config file

Once the script is injected into the build file, generate a new build to reflect the changes. The script will be included in the generated `index.html` file.

---

## Complete Configuration Example

A minimal `APIMATIC-BUILD.json` with dynamic configuration injection:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    },
    "tailIncludes": "<script defer src='static/scripts/config.js'></script>"
  }
}
```

The matching `src/static/scripts/config.js`:

```javascript
APIMaticDevPortal.ready(({ setConfig }) =>
  setConfig((defaultConfig) => {
    return {
      ...defaultConfig,
      auth: {
        oauth_2_0: {
          OAuthClientId: "my-client-id",
          OAuthClientSecret: "my-client-secret",
          OAuthRedirectUri: "https://example.com/callback",
          OAuthToken: "",
          OAuthScopes: ["album"],
        },
      },
    };
  })
);
```

After updating the build file, run `apimatic portal generate` or rebuild the portal to apply the changes.
