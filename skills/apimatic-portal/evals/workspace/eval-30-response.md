APIMatic portals expose a runtime JavaScript API called the Theme Control Hook that lets your host application switch the portal theme programmatically. This is the right approach when you want to sync the portal's appearance with a dark/light toggle in your own application.

## The API: `setThemeMode`

```javascript
window.APIMaticDevPortal.setThemeMode(type);
```

**Accepted values for `type`:** `"light"` or `"dark"`. Any other value has no effect.

Always guard the call with an availability check before invoking it:

```javascript
if (window.APIMaticDevPortal && window.APIMaticDevPortal.setThemeMode) {
  window.APIMaticDevPortal.setThemeMode('dark'); // or 'light'
}
```

## Syncing with your application's theme toggle

Here is a complete integration example that listens to your app's toggle button and keeps the portal in sync:

```javascript
function syncPortalTheme(theme) {
  if (window.APIMaticDevPortal && window.APIMaticDevPortal.setThemeMode) {
    window.APIMaticDevPortal.setThemeMode(theme); // 'light' or 'dark'
  } else {
    console.error("APIMatic Theme Control Hook is not available.");
  }
}

document.getElementById("themeSwitcher").addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Update your app's theme
  document.body.setAttribute("data-theme", newTheme);

  // Sync the portal
  syncPortalTheme(newTheme);
});
```

## Setting the portal's initial theme to match your app

To avoid a theme flash on load, configure `defaultMode` in your `APIMATIC-BUILD.json` to match your application's default theme. The `colorMode` object is nested inside `portalSettings.theme`:

```json
{
  "generatePortal": {
    "portalSettings": {
      "theme": {
        "colorMode": {
          "defaultMode": "dark",
          "disableSwitch": false
        }
      }
    }
  }
}
```

**Accepted values for `defaultMode`:** `"light"`, `"dark"`, or `"system"` (follows the visitor's OS preference).

If you want to hide the portal's built-in theme toggle so your application is the sole controller of the theme, set `"disableSwitch": true`.

## Important notes

- `setThemeMode` only accepts `"light"` or `"dark"` — no custom modes are supported.
- The availability check (`if (window.APIMaticDevPortal && window.APIMaticDevPortal.setThemeMode)`) is required because the portal object may not be present if the page has not loaded yet or if the portal script is absent.
- `setThemeMode` is the correct API for runtime theme switching from a host application.
