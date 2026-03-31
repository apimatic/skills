To set auth dynamically at runtime — where the token comes from the user's session rather than being hardcoded at build time — use the `APIMaticDevPortal.ready` JavaScript API combined with `generatePortal.tailIncludes` in your `APIMATIC-BUILD.json`.

## How It Works

At portal load time, the portal emits a `ready` event. You hook into this event using `APIMaticDevPortal.ready`, receive a `setConfig` function, and use it to merge your runtime auth values into the portal's default configuration. Because this runs in the browser at page load, it can read from your user's session, cookies, local storage, or any other runtime source.

## Step 1: Create the runtime config script

Create `src/static/scripts/config.js` with the following pattern:

```javascript
APIMaticDevPortal.ready(({ setConfig }) =>
  setConfig((defaultConfig) => {
    return {
      ...defaultConfig,
      auth: {
        oauth_2_0: {
          OAuthClientId: "your-client-id",
          OAuthClientSecret: "your-client-secret",
          OAuthRedirectUri: "https://your-app.com/callback",
          OAuthToken: "",
          OAuthScopes: ["read"],
        },
      },
    };
  })
);
```

Replace the hardcoded values with expressions that read from your session at runtime. For example, if your host application stores the token on `window`:

```javascript
APIMaticDevPortal.ready(({ setConfig }) =>
  setConfig((defaultConfig) => {
    return {
      ...defaultConfig,
      auth: {
        oauth_2_0: {
          OAuthClientId: window.sessionData.clientId,
          OAuthClientSecret: window.sessionData.clientSecret,
          OAuthRedirectUri: window.sessionData.redirectUri,
          OAuthToken: window.sessionData.token,
          OAuthScopes: window.sessionData.scopes,
        },
      },
    };
  })
);
```

The `...defaultConfig` spread preserves all other portal settings — only the `auth` block is overridden.

## Step 2: Inject the script via tailIncludes

Reference the script in `generatePortal.tailIncludes` inside `src/APIMATIC-BUILD.json`. The script must go in `tailIncludes` (injected just before `</body>`):

```json
{
  "generatePortal": {
    "tailIncludes": "<script defer src='static/scripts/config.js'></script>"
  }
}
```

The `defer` attribute ensures the script runs after the portal has loaded.

## Key Points

- **Always use `tailIncludes`**: Inject this script via `tailIncludes` — the portal JavaScript must be fully loaded before your config script runs, and `tailIncludes` guarantees this by injecting just before `</body>`.
- **Runtime only**: This approach runs in the browser. The values are never baked into the generated portal files — every page load re-reads from the session.
- **`setConfig` with a callback**: Pass a function to `setConfig` (not a plain object) so you receive `defaultConfig` and can spread it. This preserves all other portal settings while only overriding `auth`.
- **Build-time alternative**: If you need to inject credentials at build time (e.g., from environment variables during CI), that is a different mechanism using `dynamicConfigurations` and `contextPlugins` in `APIMATIC-BUILD.json`. Use the runtime JS approach described above when the credential is only known at page load from the user's session.
