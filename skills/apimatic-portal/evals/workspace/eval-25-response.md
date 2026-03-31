To decrease the `maxWidth` of your content, you need to add a `layout` object inside `portalSettings.theme` in `src/APIMATIC-BUILD.json`. The content area in an APIMatic portal corresponds to the second and third columns (the reading/documentation area), and its width is controlled by `theme.layout.content.maxWidth`.

Open `src/APIMATIC-BUILD.json` and add the `layout` block inside `theme`. For example, to set a narrower content width of `800px`:

```json
{
  "generatePortal": {
    "portalSettings": {
      "theme": {
        "layout": {
          "content": {
            "maxWidth": "800px",
            "align": "center"
          }
        }
      }
    }
  }
}
```

**Field details:**

- `maxWidth` — accepts a pixel (`px`) or rem (`rem`) value. Values below `700px` / `44rem` are ignored and the default (`700px`) is applied instead. There is no upper limit. Use a value above `700px` but lower than what you currently see if you want to narrow it.
- `align` — sets how the content column is aligned within its container. Accepted values: `"left"` or `"center"` (default is `"center"`).

**In context of your full build file**, the `layout` block sits inside `theme`, which sits inside `portalSettings`, which sits inside `generatePortal`. Here is what a complete `theme` section looks like with `layout` added:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    "apiSpecs": ["my-api"],
    "languageConfig": {
      "http": {}
    },
    "portalSettings": {
      "theme": {
        "baseTheme": "standard",
        "defaultMode": "system",
        "colors": {
          "primaryColor": {
            "light": "#400072",
            "dark": "#D8A3FF"
          }
        },
        "layout": {
          "content": {
            "maxWidth": "800px",
            "align": "center"
          }
        }
      }
    }
  }
}
```

After saving the file, let me verify the preview server is running:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/skills/apimatic-portal/scripts/serve.mjs status
```

If the server is running, I will then watch for regeneration to complete:

```
node /Users/sohaibtariq/Documents/Apimatic/apimatic-docs/skills/apimatic-portal/scripts/serve.mjs watch
```

Your changes have been saved. The portal is regenerating — this typically takes 15–60 seconds. Watching for completion...

Once regeneration completes, open your portal in the browser and you will see the content columns are narrower than before.

**Note:** If you also want to constrain the overall page container (the outermost full-width wrapper), that is a separate sub-property — `layout.mainContainer.maxWidth`. The default there is `"100%"` with no lower limit below `1250px`. Most users only need to touch `layout.content.maxWidth` to narrow the readable content area.

---

> Portal server is running. It will stop automatically after 30 minutes of inactivity. To stop it now, tell me: **"shut down the portal"**
