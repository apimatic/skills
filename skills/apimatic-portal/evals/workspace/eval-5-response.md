# Creating an API Recipe Manually

When creating a recipe manually (without the wizard), four things are required. Here is exactly what to create and what to change.

---

## 1. Create the markdown page

Create `src/content/recipes/RecipeName.md`. The file must contain at least one line of content — this is the page the portal renders when a user navigates to the recipe.

Example (`src/content/recipes/UserAuthenticationFlow.md`):

```markdown
# User Authentication Flow

This recipe walks you through authenticating with the API and fetching your profile.
```

Replace `RecipeName` and `UserAuthenticationFlow` with your actual recipe name (PascalCase, no spaces).

---

## 2. Add a page entry to toc.yml

Open `src/content/toc.yml` and add an entry pointing to the markdown file you just created. If an "API Recipes" group already exists, add to it. If not, create one:

```yaml
- group: API Recipes
  items:
    - page: User Authentication Flow
      file: recipes/UserAuthenticationFlow.md
```

The `file:` value must match the path you created in step 1, relative to `src/content/`.

---

## 3. Register the recipe in APIMATIC-BUILD.json

This is the critical part that catches people. The `recipes` key is a **top-level sibling of `generatePortal`** — do not put it inside `generatePortal`.

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    ...existing generatePortal config...
  },
  "recipes": {
    "workflows": [
      {
        "name": "User Authentication Flow",
        "permalink": "page:recipes/UserAuthenticationFlow",
        "functionName": "UserAuthenticationFlow",
        "scriptPath": "./static/scripts/recipes/UserAuthenticationFlow.js"
      }
    ]
  }
}
```

Field explanations:

- `name` — the display name shown in the portal sidebar
- `permalink` — must use the format `page:recipes/RecipeName`; must match the `page:` entry in `toc.yml` exactly
- `functionName` — the name of the exported function in the `.js` file; case-sensitive, must match exactly
- `scriptPath` — path from the `src/` directory to the script file

To add a second recipe later, append another object to the `workflows` array.

---

## 4. Create the JavaScript recipe script

Create `src/static/scripts/recipes/UserAuthenticationFlow.js`. The file exports a default function (not `async`, not a named export) that receives `workflowCtx` and `portal` and returns an object of named steps:

```javascript
export default function UserAuthenticationFlow(workflowCtx, portal) {
  return {
    "Step 1": {
      name: "Introduction",
      stepCallback: async () => {
        return workflowCtx.showContent(`
## User Authentication Flow

In this recipe you will:
1. Log in to receive an access token
2. Use the token to fetch your user profile
        `);
      },
    },

    "Step 2": {
      name: "Get Access Token",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description: `## Authenticate\n\nEnter your credentials to receive a token.`,
          endpointPermalink: "$e/Authentication/Login",
          args: {
            body: { username: "demo-user", password: "" }
          },
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Authentication failed. Check your credentials.");
            return false;
          },
        });
      },
    },

    "Step 3": {
      name: "Fetch Profile",
      stepCallback: async (stepState) => {
        const token = stepState?.["Step 2"]?.data?.accessToken;

        await portal.setConfig((defaultConfig) => ({
          ...defaultConfig,
          auth: {
            ...defaultConfig.auth,
            bearerAuth: {
              ...defaultConfig.auth.bearerAuth,
              AccessToken: token,
            },
          },
        }));

        return workflowCtx.showEndpoint({
          description: `## Fetch Your Profile\n\nYour token from Step 2 has been applied automatically.`,
          endpointPermalink: "$e/Users/GetProfile",
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Failed to fetch profile.");
            return false;
          },
        });
      },
      showConfettiAnimation: true,
    },
  };
}
```

Two step types are available:

- `workflowCtx.showContent(markdownString)` — renders formatted content; use for introductions and instructions
- `workflowCtx.showEndpoint(options)` — renders the API playground for a specific endpoint

The `endpointPermalink` format is `$e/GroupName/EndpointName` — both parts are case-sensitive and must match the portal's generated API reference URLs.

Always use optional chaining when reading `stepState`: `stepState?.["Step 2"]?.data?.field` — never `stepState["Step 2"].data.field`.

---

## Summary of files and changes

| Action | Location |
|--------|----------|
| Create markdown page | `src/content/recipes/RecipeName.md` |
| Add toc.yml entry | `src/content/toc.yml` — add `page:` under a group |
| Register in build file | `src/APIMATIC-BUILD.json` — add `recipes.workflows` array as top-level sibling of `generatePortal` |
| Create recipe script | `src/static/scripts/recipes/RecipeName.js` — `export default function RecipeName(workflowCtx, portal)` |

---

## Common mistakes to avoid

- Nesting `recipes.workflows` inside `generatePortal` — it must be a top-level sibling
- Exporting the function as `export async function` or as a named export — it must be `export default function`
- The `permalink` in `APIMATIC-BUILD.json` not matching the `file:` entry in `toc.yml` — they must refer to the same recipe path
- Reading stepState without optional chaining — always use `?.` at every level
