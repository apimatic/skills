# API Recipes Reference

This file covers API recipe registration in `APIMATIC-BUILD.json` and `.js` file authoring for APIMatic Docs as Code portals.

## Contents

- [What Are API Recipes](#what-are-api-recipes)
- [Creating a Recipe with the Wizard](#creating-a-recipe-with-the-wizard) — `apimatic portal recipe new`, wizard behavior, flags
- [Manual Recipe Setup](#manual-recipe-setup) — four files to create/edit
- [Recipe Registration in APIMATIC-BUILD.json](#recipe-registration-in-apimatic-buildjson) — `recipes.workflows` schema, permalink format, legacy `tailIncludes`
- [Recipe .js File Structure](#recipe-js-file-structure) — exported function signature, step object shape
- [Step Types](#step-types) — `showContent`, `showEndpoint`
- [Pre-filling Parameters with args](#pre-filling-parameters-with-args)
  — body, query, path, combined
- [Data Chaining with stepState](#data-chaining-with-stepstate)
  — full structure, 4 common patterns
- [portal.setConfig — Auth and Headers](#portalsetconfig--auth-and-headers)
  — bearerAuth, multiple schemes, custom headers
- [Error Handling and Safe Access](#error-handling-and-safe-access)
  — optional chaining, validation
- [Debugging](#debugging) — logging stepState and response structure
- [Advanced Features](#advanced-features) — `showConfettiAnimation`, `nextRecipe`
- [Complete Recipe Example](#complete-recipe-example)

---

## What Are API Recipes

API Recipes are interactive step-by-step tutorials embedded in the portal that walk developers through real API workflows. Each recipe is a JavaScript file that defines an object of named steps — content steps and endpoint steps. The portal renders the steps sequentially as an interactive guide — the developer follows the steps, makes real API calls against the live playground, and the recipe validates the responses before advancing.

---

## Creating a Recipe with the Wizard

The fastest way to scaffold a recipe is the interactive wizard:

```
apimatic portal recipe new
```

Run from the project root (the directory containing `src/`). The wizard is interactive — run the command and step aside; it prompts the user directly. The wizard:

- Asks for the recipe name
- Asks to add Endpoint Steps (select endpoint group, endpoint name)
- Writes the registration entry to `APIMATIC-BUILD.json` under `recipes.workflows` (top-level, not inside `generatePortal`)
- Creates the `.js` scaffold at `src/static/scripts/recipes/RecipeName.js`
- Creates the `.md` page at `src/content/recipes/RecipeName.md`
- Updates `toc.yml` with a `page:` entry pointing to `recipes/RecipeName.md`

After the wizard finishes, run `apimatic portal serve` to preview the recipe in the portal.

Use the wizard for first-time recipe creation. Hand-edit the generated `.js` file to add content steps, data chaining, and advanced features.

### Flags for portal recipe new

- `--name=<value>` : Pre-set the recipe name non-interactively (skips the wizard name prompt).
- `--input=<value>` : Path to the parent directory containing the `src` directory. Defaults to `./`.

---

## Manual Recipe Setup

When creating a recipe by hand (without the wizard), four changes are required:

1. **Create the markdown page** at `src/content/recipes/RecipeName.md` — must contain at least one line of content
2. **Add a `page:` entry in `toc.yml`** pointing to `recipes/RecipeName.md`
3. **Register in `APIMATIC-BUILD.json`** under the top-level `recipes.workflows` array (sibling of `generatePortal`, not inside it)
4. **Create the `.js` recipe script** at `src/static/scripts/recipes/RecipeName.js`

---

## Recipe Registration in APIMATIC-BUILD.json

The `recipes` key is a **top-level sibling of `generatePortal`**, not nested inside it:

```json
{
  "$schema": "https://titan.apimatic.io/api/build/schema",
  "buildFileVersion": "1",
  "generatePortal": {
    ...
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

**Field explanations:**

- `name` — display name shown in the portal navigation sidebar for this recipe
- `permalink` — must use the format `page:recipes/RecipeName` — this links the registration to the markdown page in `toc.yml` and must match exactly
- `functionName` — the name of the exported function in the `.js` script file; must match exactly (case-sensitive)
- `scriptPath` — path from the `src/` directory to the recipe script file; use `./static/scripts/recipes/RecipeName.js`

To register a second recipe, add another object to the `workflows` array.

### Legacy Registration with tailIncludes

The original approach used `tailIncludes` inside `generatePortal` to inject the script tag and `registerWorkflow` call. This is maintained for backward compatibility only — use `recipes.workflows` for all new recipes.

```json
{
  "generatePortal": {
    "tailIncludes": "\n<script defer src=\"./static/scripts/recipes/my-recipe.js\"></script>\n<script>\n  document.addEventListener(\"DOMContentLoaded\", (event) => {\n    APIMaticDevPortal.ready(({ registerWorkflow }) => {\n      registerWorkflow(\n        \"page:recipes/my-recipe\",\n        \"My Recipe\",\n        myRecipe\n      );\n    });\n  });\n</script>"
  }
}
```

---

## Recipe .js File Structure

Recipe scripts live at `src/static/scripts/recipes/`. Each file exports a default function (not async, not named export) that receives `workflowCtx` and `portal` and returns an object of named step entries:

```javascript
export default function RecipeName(workflowCtx, portal) {
  return {
    "Step 1": {
      name: "Step display name",
      stepCallback: async () => {
        return workflowCtx.showContent(`Your markdown here`);
      },
    },
    "Step 2": {
      name: "Another step",
      stepCallback: async (stepState) => {
        return workflowCtx.showEndpoint({
          description: "Markdown description",
          endpointPermalink: "$e/GroupName/EndpointName",
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Something went wrong.");
            return false;
          },
        });
      },
    },
  };
}
```

**Function signature:**
- `workflowCtx` — provides `showContent(markdown)` and `showEndpoint(options)`
- `portal` — provides `setConfig(callbackFn)` for auth propagation

**Important:** the function is a plain `export default function`, not `export async function`. It returns a plain object of step entries.

---

## Step Types

### showContent — Content Step

```javascript
"Step 1": {
  name: "Introduction",
  stepCallback: async () => {
    return workflowCtx.showContent(`
## Welcome

Explain what the user will accomplish in this recipe.
    `);
  },
}
```

Notes:
- Accepts a markdown string; renders as formatted content in the portal
- Use for instructions, explanations, or context between API calls
- `stepCallback` receives `stepState` but it is not needed for content-only steps

---

### showEndpoint — Endpoint Step

```javascript
"Step 2": {
  name: "Authenticate",
  stepCallback: async (stepState) => {
    return workflowCtx.showEndpoint({
      description: `## Authenticate\nEnter your credentials below.`,
      endpointPermalink: "$e/Authentication/Login",
      verify: (response, setError) => {
        if (response.StatusCode === 200) return true;
        setError("Authentication failed. Check your credentials.");
        return false;
      },
      args: {
        body: { username: "demo-user" }
      }
    });
  },
}
```

**Field explanations:**

- `description` — markdown string displayed above the API playground; required
- `endpointPermalink` — reference to the endpoint in the format
  `$e/GroupName/EndpointName`; both parts are case-sensitive and must match
  the portal's generated API reference URLs
- `verify` — function receiving `(response, setError)`; return `true` to allow
  the user to proceed, `false` to block with an error message;
  `response.StatusCode` is the HTTP status (capital S and C)
- `args` — optional; pre-fills request parameters; keys are `body`, `query`,
  `path`

---

## Pre-filling Parameters with args

Use the `args` property on `showEndpoint` to pre-fill request parameter values,
typically populated from a previous step's `stepState`.

### Body Parameters

```javascript
args: {
  body: {
    customerId: previousCustomerId,
    email: previousEmail,
    status: "active"
  }
}
```

### Query Parameters

```javascript
args: {
  query: {
    page: 1,
    limit: 10,
    filter: "active"
  }
}
```

### Path Parameters

```javascript
args: {
  path: {
    userId: previousUserId,
    orderId: previousOrderId
  }
}
```

### Combined body, query, and path

```javascript
args: {
  path: {
    customerId: customerId
  },
  query: {
    include: "orders"
  },
  body: {
    updateData: someData
  }
}
```

---

## Data Chaining with stepState

`stepState` is passed to every `stepCallback` and contains the full history of
completed steps. Use it to extract response data or request data from earlier
steps and pass it to later steps via `args` or `portal.setConfig`.

### Full stepState structure

```javascript
stepState = {
  "Step 1": {
    data: {
      // Response body parsed as JSON
    },
    response: {
      StatusCode: 200,
      body: "...",
      headers: {},
    },
    requestData: {
      args: {
        body: {},   // Request body parameters sent by the user
        query: {},  // Query parameters sent
        path: {},   // Path parameters sent
      },
    },
  },
  "Step 2": { /* same structure */ },
};
```

### Accessing previous step data

```javascript
"Step 3": {
  name: "Use Previous Data",
  stepCallback: async (stepState) => {
    const step2 = stepState?.["Step 2"];

    // Get response body fields
    const token = step2?.data?.accessToken;
    const userId = step2?.data?.user?.id;

    // Get what the user sent in the request
    const emailSent = step2?.requestData?.args?.body?.email;
  },
}
```

### Pattern 1: Pass authentication token

Get a token in one step and inject it for all subsequent steps.

```javascript
"Step 1": {
  name: "Get Token",
  stepCallback: async () => {
    return workflowCtx.showEndpoint({
      description: "Authenticate to receive an access token.",
      endpointPermalink: "$e/Auth/Login",
      verify: (response, setError) => {
        if (response.StatusCode === 200) return true;
        setError("Authentication failed.");
        return false;
      },
    });
  },
},

"Step 2": {
  name: "Use Token",
  stepCallback: async (stepState) => {
    const token = stepState?.["Step 1"]?.data?.accessToken;

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
      description: "Make an authenticated request.",
      endpointPermalink: "$e/Users/GetProfile",
      verify: (response, setError) => {
        if (response.StatusCode === 200) return true;
        setError("Failed to fetch profile.");
        return false;
      },
    });
  },
},
```

### Pattern 2: Chain resource IDs

Create a resource in one step and use its ID as a parameter in the next.

```javascript
"Step 2": {
  name: "Create Customer",
  stepCallback: async () => {
    return workflowCtx.showEndpoint({
      description: "Create a new customer record.",
      endpointPermalink: "$e/Customers/Create",
      verify: (response, setError) => response.StatusCode === 201,
    });
  },
},

"Step 3": {
  name: "Create Order",
  stepCallback: async (stepState) => {
    const customerId = stepState?.["Step 2"]?.data?.id;

    return workflowCtx.showEndpoint({
      description: "Create an order for this customer.",
      endpointPermalink: "$e/Orders/Create",
      args: {
        body: {
          customerId: customerId,
          items: []
        }
      },
      verify: (response, setError) => response.StatusCode === 201,
    });
  },
},
```

### Pattern 3: Use request data (not response data)

Access what the user sent in the request — useful when the response does not
echo back the submitted values.

```javascript
"Step 2": {
  name: "Register User",
  stepCallback: async () => {
    return workflowCtx.showEndpoint({
      description: "Register a new user.",
      endpointPermalink: "$e/Users/Register",
      verify: (response, setError) => response.StatusCode === 201,
    });
  },
},

"Step 3": {
  name: "Send Welcome Email",
  stepCallback: async (stepState) => {
    // Read what the user typed in Step 2's request body
    const userEmail = stepState?.["Step 2"]?.requestData?.args?.body?.email;
    const userName = stepState?.["Step 2"]?.requestData?.args?.body?.name;
    const userId = stepState?.["Step 2"]?.data?.id;

    return workflowCtx.showEndpoint({
      description: "Send a welcome email to the new user.",
      endpointPermalink: "$e/Emails/Send",
      args: {
        body: {
          to: userEmail,
          subject: `Welcome ${userName}!`,
          userId: userId
        }
      },
      verify: (response, setError) => response.StatusCode === 200,
    });
  },
},
```

### Pattern 4: Combine data from multiple previous steps

```javascript
"Step 4": {
  name: "Complete Transaction",
  stepCallback: async (stepState) => {
    const token = stepState?.["Step 1"]?.data?.accessToken;
    const customerId = stepState?.["Step 2"]?.data?.id;
    const productId = stepState?.["Step 3"]?.data?.id;
    const price = stepState?.["Step 3"]?.data?.price;

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
      description: "Complete the purchase transaction.",
      endpointPermalink: "$e/Transactions/Create",
      args: {
        body: { customerId, productId, amount: price }
      },
      verify: (response, setError) => response.StatusCode === 201,
    });
  },
},
```

Always use optional chaining (`?.`) when reading stepState — the step may not
have completed yet. Never write `stepState["Step 2"].data.field`; always write
`stepState?.["Step 2"]?.data?.field`.

---

## portal.setConfig — Auth and Headers

`portal.setConfig` accepts a callback that receives the current config and
returns the updated config. Call it inside `stepCallback` before calling
`workflowCtx.showEndpoint`. The new config persists for all subsequent steps.

### Bearer token

```javascript
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
```

### Multiple authentication schemes

```javascript
await portal.setConfig((defaultConfig) => ({
  ...defaultConfig,
  auth: {
    ...defaultConfig.auth,
    OAuthCCG: {
      ...defaultConfig.auth.OAuthCCG,
      OAuthClientId: clientId,
      OAuthClientSecret: clientSecret,
    },
    bearerAuth: {
      ...defaultConfig.auth.bearerAuth,
      AccessToken: accessToken,
    },
  },
}));
```

### Custom headers

```javascript
await portal.setConfig((defaultConfig) => ({
  ...defaultConfig,
  config: {
    ...defaultConfig.config,
    additionalHeaders: [{ key: "X-Custom-Header", value: someValue }],
  },
}));
```

---

## Error Handling and Safe Access

### Always use optional chaining

```javascript
// BAD — throws if step or data is undefined
const token = stepState["Step 2"].data.accessToken;

// GOOD — returns undefined safely if any part is missing
const token = stepState?.["Step 2"]?.data?.accessToken;
```

### Validate before using

```javascript
"Step 3": {
  name: "Use Token",
  stepCallback: async (stepState) => {
    const token = stepState?.["Step 2"]?.data?.accessToken;

    if (!token) {
      console.error("Token not found in previous step");
      // Proceed anyway — portal will show unauthenticated playground
    }

    await portal.setConfig((defaultConfig) => ({
      ...defaultConfig,
      auth: {
        ...defaultConfig.auth,
        bearerAuth: { ...defaultConfig.auth.bearerAuth, AccessToken: token },
      },
    }));

    return workflowCtx.showEndpoint({
      description: "Fetch your profile.",
      endpointPermalink: "$e/Users/GetProfile",
      verify: (response, setError) => {
        if (response.StatusCode === 200) return true;
        setError("Failed to fetch profile.");
        return false;
      },
    });
  },
},
```

---

## Debugging

### Log the full stepState

```javascript
"Step 3": {
  name: "Debug",
  stepCallback: async (stepState) => {
    console.log("Complete stepState:", stepState);
    console.log("Step 2 data:", stepState?.["Step 2"]);
    // Continue with your logic...
  },
},
```

### Log the response in verify

```javascript
verify: (response, setError) => {
  console.log("Response:", response);
  console.log("Response body:", response.body);

  if (response.StatusCode === 200) return true;
  setError("Request failed");
  return false;
},
```

---

## Advanced Features

### showConfettiAnimation

Add `showConfettiAnimation: true` as a property on the final step object (not a standalone function call):

```javascript
"Step 4": {
  name: "Complete",
  stepCallback: async () => {
    return workflowCtx.showContent("You've completed the recipe!");
  },
  showConfettiAnimation: true,
}
```

### nextRecipe

Add `nextRecipe` as a property on the final step object to guide users to a related recipe:

```javascript
"Step 4": {
  name: "Complete",
  stepCallback: async () => {
    return workflowCtx.showContent("Recipe complete! Ready for the next one?");
  },
  showConfettiAnimation: true,
  nextRecipe: {
    name: "Advanced SDK Usage",
    link: "page:recipes/AdvancedSdkUsage",
  },
}
```

The `link` must use the `page:recipes/RecipeName` format matching the `permalink` of the target recipe in `APIMATIC-BUILD.json`.

---

## Complete Recipe Example

### 1. `src/content/recipes/UserAuthenticationFlow.md`

```markdown
# User Authentication Flow

This recipe walks you through authenticating with the API and fetching your profile.
```

### 2. `src/content/toc.yml` entry

```yaml
- group: API Recipes
  items:
    - page: User Authentication Flow
      file: recipes/UserAuthenticationFlow.md
```

### 3. `APIMATIC-BUILD.json` registration (top-level, sibling of `generatePortal`)

```json
{
  "generatePortal": { ... },
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

### 4. `src/static/scripts/recipes/UserAuthenticationFlow.js`

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

You will need valid API credentials to proceed.
        `);
      },
    },

    "Step 2": {
      name: "Get Access Token",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description: `
## Authenticate

Enter your username and password below to receive an access token.
          `,
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
          description: `
## Fetch Your Profile

Your access token from Step 2 has been applied automatically.
          `,
          endpointPermalink: "$e/Users/GetProfile",
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Failed to fetch profile.");
            return false;
          },
        });
      },
      showConfettiAnimation: true,
      nextRecipe: {
        name: "Explore API Endpoints",
        link: "page:recipes/ExploreApiEndpoints",
      },
    },
  };
}
```
