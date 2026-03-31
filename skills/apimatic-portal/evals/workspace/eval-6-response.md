# APIMatic Recipe JavaScript File: Export and Safe Data Reading

## Function Export

Your recipe JavaScript file must export a single default function — not an async function, and not a named export. The function receives two arguments: `workflowCtx` and `portal`, and it must return a plain object of named step entries.

The correct signature is:

```javascript
export default function RecipeName(workflowCtx, portal) {
  return {
    "Step 1": { ... },
    "Step 2": { ... },
  };
}
```

Two common mistakes to avoid:

- **Do not use `export async function`** — the outer function is synchronous. Individual `stepCallback` functions inside each step are `async`, but the recipe function itself is not.
- **Do not use a named export** (`export function RecipeName`) — it must be `export default function RecipeName`.

The `functionName` value in your `APIMATIC-BUILD.json` registration must match the function name exactly (case-sensitive).

## Reading Data from a Previous Step

Each step's `stepCallback` receives a `stepState` argument. This object contains the full history of completed steps, indexed by their string key (e.g., `"Step 1"`, `"Step 2"`).

The full structure of each step entry in `stepState` is:

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
        body: {},   // Request body parameters the user sent
        query: {},  // Query parameters the user sent
        path: {},   // Path parameters the user sent
      },
    },
  },
};
```

### Always use optional chaining

A previous step may not have completed yet when your callback runs. You must always use optional chaining (`?.`) when reading from `stepState`. Never assume the step or its data exists.

```javascript
// BAD — throws a TypeError if the step or data is undefined
const token = stepState["Step 2"].data.accessToken;

// GOOD — returns undefined safely if any part is missing
const token = stepState?.["Step 2"]?.data?.accessToken;
```

### Reading response data

To read a field from the API response body of a previous step:

```javascript
"Step 3": {
  name: "Use Previous Response",
  stepCallback: async (stepState) => {
    const token = stepState?.["Step 2"]?.data?.accessToken;
    const userId = stepState?.["Step 2"]?.data?.user?.id;

    // Use token and userId in this step...
  },
},
```

### Reading request data

If the previous step's response does not echo back what the user submitted, you can access what the user typed in the request body instead:

```javascript
const emailSent = stepState?.["Step 2"]?.requestData?.args?.body?.email;
const nameSent  = stepState?.["Step 2"]?.requestData?.args?.body?.name;
```

This is useful in patterns like registration flows, where the server returns only an ID but you also need the submitted email for the next step.

### Validate before using

If the value is critical (for example, a token you need to inject into auth), add a guard after reading it:

```javascript
const token = stepState?.["Step 2"]?.data?.accessToken;

if (!token) {
  console.error("Token not found in Step 2 response");
  // The portal will continue without auth — you can still show the step
}
```

## Putting It Together: A Complete Example

```javascript
export default function MyRecipe(workflowCtx, portal) {
  return {
    "Step 1": {
      name: "Login",
      stepCallback: async () => {
        return workflowCtx.showEndpoint({
          description: "## Login\n\nEnter your credentials to receive an access token.",
          endpointPermalink: "$e/Auth/Login",
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Login failed. Check your credentials.");
            return false;
          },
        });
      },
    },

    "Step 2": {
      name: "Fetch Profile",
      stepCallback: async (stepState) => {
        // Safely read the token from the Step 1 response
        const token = stepState?.["Step 1"]?.data?.accessToken;

        // Inject it for this and all subsequent steps
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
          description: "## Your Profile\n\nYour token from Step 1 has been applied.",
          endpointPermalink: "$e/Users/GetProfile",
          verify: (response, setError) => {
            if (response.StatusCode === 200) return true;
            setError("Failed to fetch profile.");
            return false;
          },
        });
      },
    },
  };
}
```

## Summary

| Rule | Detail |
|------|--------|
| Export style | `export default function RecipeName(workflowCtx, portal)` |
| Outer function async? | No — the outer function is synchronous |
| stepCallback async? | Yes — each individual `stepCallback` is `async` |
| Reading response data | `stepState?.["Step N"]?.data?.fieldName` |
| Reading request data | `stepState?.["Step N"]?.requestData?.args?.body?.fieldName` |
| Optional chaining | Always required — never skip `?.` when reading stepState |
