To scaffold an API recipe, run the following command from the project root (the directory that contains `src/`, not from inside `src/` itself):

```
apimatic portal recipe new
```

Step aside — the wizard handles all the prompts interactively. The wizard prompts you for recipe details and sets up the scaffold automatically. Do not answer the wizard prompts on behalf of the user; let the wizard guide them through the process directly.

## What gets created

After the wizard completes, four things are in place:

- `src/static/scripts/recipes/RecipeName.js` — the JavaScript scaffold with the exported recipe function
- `src/content/recipes/RecipeName.md` — the markdown page for the recipe
- `src/content/toc.yml` — updated with a `page:` entry pointing to `recipes/RecipeName.md`
- `src/APIMATIC-BUILD.json` — updated with a registration entry under the top-level `recipes.workflows` array

## Manual recipe creation (without the wizard)

If you prefer to create a recipe by hand, four things are required:

1. Create `src/content/recipes/RecipeName.md` (at least one line of content)
2. Add a `page:` entry in `src/content/toc.yml` pointing to `recipes/RecipeName.md`
3. Register in `src/APIMATIC-BUILD.json` under top-level `recipes.workflows` with `"permalink": "page:recipes/RecipeName"`
4. Create `src/static/scripts/recipes/RecipeName.js` using `export default function RecipeName(workflowCtx, portal)` returning a step object

The registration in `src/APIMATIC-BUILD.json` belongs at the **top level as a sibling of `generatePortal`** — not nested inside it:

```json
{
  "generatePortal": {
    "...": "..."
  },
  "recipes": {
    "workflows": [
      {
        "name": "Your Recipe Name",
        "permalink": "page:recipes/RecipeName",
        "functionName": "RecipeName",
        "scriptPath": "./static/scripts/recipes/RecipeName.js"
      }
    ]
  }
}
```

## Key things to know before editing the scaffold

- The exported function must be `export default function RecipeName(workflowCtx, portal)` — not `async`, not a named export
- `endpointPermalink` uses the format `$e/GroupName/EndpointName` — both parts are case-sensitive
- When reading data from a previous step, always use optional chaining: `stepState?.["Step 1"]?.data?.field`
- `recipes.workflows` is a top-level key in `APIMATIC-BUILD.json`, not nested inside `generatePortal`

For the full registration schema, all available step types, and a complete working example, see `references/recipes.md`.
