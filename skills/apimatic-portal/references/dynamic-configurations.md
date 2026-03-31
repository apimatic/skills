# Dynamic Configurations Reference

This file covers `dynamicConfigurations` and `contextPlugins` in `APIMATIC-BUILD.json`, which inject runtime values such as API keys into the portal API playground.

## Contents

- [What Are Dynamic Configurations](#what-are-dynamic-configurations)
- [dynamicConfigurations Schema](#dynamicconfigurations-schema) — field explanations
- [contextPlugins Schema](#contextplugins-schema) — field explanations
- [Writing a Context Plugin File](#writing-a-context-plugin-file)
- [Complete Configuration Example](#complete-configuration-example)

---

## What Are Dynamic Configurations

Dynamic configurations let the portal substitute runtime values — such as API keys or auth tokens — into the API playground at build time. Instead of showing placeholder credentials, the playground displays real values so developers can test the API immediately.

Values are sourced from a context plugin (a JavaScript file that runs at build time) or fall back to a `defaultValue` when no plugin is present.

---

## dynamicConfigurations Schema

The `dynamicConfigurations` array lives inside `generatePortal` in `APIMATIC-BUILD.json`:

```json
{
  "generatePortal": {
    "dynamicConfigurations": [
      {
        "name": "apiKey",
        "defaultValue": "YOUR_API_KEY",
        "portalSetting": "portalSettings.apiKey"
      }
    ]
  }
}
```

**Field explanations:**

- `name` — identifier for this dynamic value; used as the key when the context plugin returns its map of values; must be unique within the array
- `defaultValue` — value used in the portal when no context plugin provides a value; useful for showing example placeholders to developers
- `portalSetting` — dot-notation path to the `APIMATIC-BUILD.json` field this value overrides at build time; must match the portal setting key exactly

---

## contextPlugins Schema

The `contextPlugins` array lives inside `generatePortal` alongside `dynamicConfigurations`:

```json
{
  "generatePortal": {
    "contextPlugins": [
      {
        "pluginFile": "src/static/scripts/context-plugin.js"
      }
    ]
  }
}
```

**Field explanation:**

- `pluginFile` — relative path from the project root to the context plugin JavaScript file; the file must export a default async function; place plugins in `src/static/scripts/` alongside recipe files

---

## Writing a Context Plugin File

Context plugins are JavaScript files placed in `src/static/scripts/`. Each plugin exports a default async function:

```javascript
export default async function contextPlugin(context) {
  return {
    apiKey: "live-api-key-from-env-or-service"
  };
}
```

**Behavior notes:**

- The exported function receives a `context` object (portal build context — API spec, config, and environment)
- Return value must be a plain object where each key matches a `name` in `dynamicConfigurations`
- The portal calls the plugin during build; returned values override `defaultValue` for matching names
- Plugins run at build time (not in the browser) — use `process.env` to read environment variables safely

---

## Complete Configuration Example

A minimal `APIMATIC-BUILD.json` combining `dynamicConfigurations` and `contextPlugins`:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["spec1"],
    "languageConfig": {
      "http": {}
    },
    "dynamicConfigurations": [
      {
        "name": "apiKey",
        "defaultValue": "YOUR_API_KEY_HERE",
        "portalSetting": "portalSettings.apiKey"
      }
    ],
    "contextPlugins": [
      {
        "pluginFile": "src/static/scripts/context-plugin.js"
      }
    ]
  }
}
```

The matching `src/static/scripts/context-plugin.js`:

```javascript
export default async function contextPlugin(context) {
  return {
    apiKey: process.env.PORTAL_API_KEY || "YOUR_API_KEY_HERE"
  };
}
```

**Field explanations:**

- `apiSpecs` — list of spec identifiers matching filenames in `src/spec/` (without extension)
- `languageConfig` — which code snippet languages appear in the portal; `"http": {}` produces HTTP request snippets only
- `dynamicConfigurations` — array of values to inject into the portal at build time; each entry requires `name`, `defaultValue`, and `portalSetting`
- `contextPlugins` — array of plugin file references; each entry requires `pluginFile` pointing to an async function that returns a key-value map

After adding these settings, run `apimatic portal serve` to preview the result. The portal API playground will display the injected API key value in place of the default placeholder.
