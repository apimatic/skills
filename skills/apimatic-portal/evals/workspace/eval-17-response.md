To enable the theme switch toggle so users can switch between light and dark mode, set `"disableSwitch": false` inside the `colorMode` object in `portalSettings.theme` in your `src/APIMATIC-BUILD.json`.

Open `src/APIMATIC-BUILD.json` and add or update the `colorMode` block under `portalSettings.theme`:

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
        "colorMode": {
          "defaultMode": "system",
          "disableSwitch": false
        }
      }
    }
  }
}
```

**What these fields do:**

- `"disableSwitch": false` — makes the light/dark toggle visible to portal visitors. Setting this to `false` enables the switch so users can toggle between light and dark mode.
- `"defaultMode": "system"` — sets the initial color mode to match the visitor's OS preference. You can also use `"light"` or `"dark"` to force a specific starting mode.

**Field location:** `generatePortal` > `portalSettings` > `theme` > `colorMode` > `disableSwitch`

With `"disableSwitch": false`, the toggle is visible and users can freely switch between light and dark mode.

After saving the file, follow the two-step preview protocol:

**Step 1 — Check the server is running:**

```
node {skill_dir}/scripts/serve.mjs status
```

**Step 2 — Wait for regeneration:**

```
node {skill_dir}/scripts/serve.mjs watch
```

Once regeneration completes, open http://localhost:3000 in your browser. The theme toggle will appear in the portal, allowing visitors to switch between light and dark mode.
