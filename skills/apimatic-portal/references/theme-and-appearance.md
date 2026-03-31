# Theme and Appearance Reference

This file covers the complete `portalSettings.theme` schema in `APIMATIC-BUILD.json`, including colors, base theme, dark mode settings, and typography. It also covers the Theme Control Hook for runtime theme switching.

## Contents

- [Theme Configuration Location](#theme-configuration-location)
- [Colors](#colors) — `primaryColor`, `secondaryColor`, `linkColor`
- [Base Theme](#base-theme) — `standard` vs `cosmos`
- [Color Mode](#color-mode) — `defaultMode`, `disableSwitch`
- [Typography](#typography) — `headings`, `body`, `code` font families
- [Complete Theme Example](#complete-theme-example)
- [Theme Control Hook](#theme-control-hook) — runtime `setThemeMode` API

---

## Theme Configuration Location

The `theme` object sits inside `portalSettings` under `generatePortal` in `APIMATIC-BUILD.json`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    },
    "portalSettings": {
      "theme": {
        "colors": {},
        "baseTheme": "standard",
        "colorMode": {
          "defaultMode": "system",
          "disableSwitch": false
        },
        "typography": {}
      }
    }
  }
}
```

---

## Colors

The `colors` object sets brand colors for the portal. Each color accepts a `light` value (used in light mode) and an optional `dark` value (used in dark mode):

```json
"colors": {
  "primaryColor": {
    "light": "#400072",
    "dark": "#D8A3FF"
  },
  "secondaryColor": {
    "light": "#CAF55C",
    "dark": "#CAF55C"
  },
  "linkColor": {
    "light": "#8C21DF",
    "dark": "#CAF55C"
  }
}
```

**Field explanations:**

- `primaryColor` — main brand color. Used for buttons, active navigation items, and key interactive elements.
- `secondaryColor` — accent color. Used for highlights, badges, and secondary UI elements.
- `linkColor` — color applied to hyperlinks in portal content.

Each color field accepts a hex code string (for example, `"#400072"`).

---

## Base Theme

The `baseTheme` field selects the visual design system the portal uses as its foundation:

```json
"baseTheme": "standard"
```

**Accepted values:**

- `"standard"` — the default APIMatic portal design. Use this unless you want the cosmos look.
- `"cosmos"` — an alternate design system with a distinct visual style.

If `baseTheme` is omitted, the portal defaults to `"standard"`.

---

## Color Mode

The `colorMode` object controls the portal's light/dark mode behavior. It is nested directly inside `theme`:

```json
"colorMode": {
  "defaultMode": "system",
  "disableSwitch": false
}
```

### defaultMode

Controls which color mode the portal loads in for first-time visitors:

**Accepted values:**

- `"light"` — always load in light mode regardless of the visitor's OS setting.
- `"dark"` — always load in dark mode regardless of the visitor's OS setting.
- `"system"` — follow the visitor's operating system preference (recommended).

### disableSwitch

Controls whether the light/dark toggle is visible to portal visitors:

- `false` (default) — the toggle is visible. Visitors can switch between light and dark mode.
- `true` — the toggle is hidden. The portal uses the mode set in `defaultMode` and visitors cannot change it.

Set `disableSwitch` to `true` when you want to lock the portal to a specific appearance.

---

## Typography

The `typography` object sets font families for different text roles in the portal:

```json
"typography": {
  "headings": {
    "fontFamily": "Inter"
  },
  "body": {
    "fontFamily": "Inter"
  },
  "code": {
    "fontFamily": "JetBrains Mono"
  }
}
```

**Field explanations:**

- `typography.headings.fontFamily` — font used for all heading elements (H1–H6).
- `typography.body.fontFamily` — font used for body text, paragraphs, and general content.
- `typography.code.fontFamily` — font used for inline code and code blocks.

Font family values must be Google Fonts names (for example, `"Inter"`, `"Roboto"`, `"Source Sans Pro"`) or valid system font names. APIMatic loads Google Fonts automatically when a recognized name is provided.

---

## Complete Theme Example

A fully configured `APIMATIC-BUILD.json` with all theme fields set:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    },
    "portalSettings": {
      "theme": {
        "colors": {
          "primaryColor": {
            "light": "#400072",
            "dark": "#D8A3FF"
          },
          "secondaryColor": {
            "light": "#CAF55C",
            "dark": "#CAF55C"
          },
          "linkColor": {
            "light": "#8C21DF",
            "dark": "#CAF55C"
          }
        },
        "baseTheme": "standard",
        "colorMode": {
          "defaultMode": "system",
          "disableSwitch": false
        },
        "typography": {
          "headings": {
            "fontFamily": "Inter"
          },
          "body": {
            "fontFamily": "Inter"
          },
          "code": {
            "fontFamily": "JetBrains Mono"
          }
        }
      }
    }
  }
}
```

---

## Theme Control Hook

The portal exposes a runtime JavaScript API for switching themes programmatically. This is useful when the portal is embedded in an application that has its own theme toggle.

### setThemeMode

```javascript
window.APIMaticDevPortal.setThemeMode(type);
```

**Parameter:** `type` — must be `"light"` or `"dark"`. Any other value has no effect.

**Availability check** — always guard the call:

```javascript
if (window.APIMaticDevPortal && window.APIMaticDevPortal.setThemeMode) {
  window.APIMaticDevPortal.setThemeMode(type);
}
```

### Integrating with an external theme toggle

```javascript
function toggleTheme(theme) {
  if (window.APIMaticDevPortal && window.APIMaticDevPortal.setThemeMode) {
    window.APIMaticDevPortal.setThemeMode(theme); // 'light' or 'dark'
  } else {
    console.error("Theme switching is not available.");
  }
}

document.getElementById("themeSwitcher").addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.body.setAttribute("data-theme", newTheme);
  toggleTheme(newTheme);
});
```

### Syncing the portal's initial theme with the application

Use `defaultMode` to match the portal's initial theme to the application's current theme:

```javascript
const currentTheme = document.body.getAttribute("data-theme") || "light";
// Pass currentTheme into the portal config via the ready() function
```

```json
"colorMode": {
  "defaultMode": "light",
  "disableSwitch": false
}
```

**Notes:**

- `setThemeMode` only accepts `"light"` or `"dark"` — no custom modes are supported.
- This function is intended to be triggered externally from your application.
- `setThemeMode` is **not** compatible with the deprecated `themeOverride` settings.
