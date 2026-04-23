Keyword arguments aren't a supported CodeGen setting for TypeScript SDKs in APIMatic.

I checked all available CodeGen settings across every category — endpoint settings, model settings, interface customization, serialization, HTTP configuration, and more. The only keyword argument settings that exist are:

- **`ForceKeywordArgsInRuby`** — switches endpoint method parameters to keyword arguments in Ruby only
- **`EnableModelKeywordArgsInRuby`** — switches model constructor parameters to keyword arguments in Ruby only

Neither of these applies to TypeScript, and there is no equivalent setting for TypeScript.

**Why TypeScript doesn't have this setting:** TypeScript doesn't have a native "keyword arguments" feature in the same way Ruby does. TypeScript already uses named object parameters (e.g., `{ param1, param2 }`) for optional and complex argument patterns, which is the idiomatic TypeScript equivalent. APIMatic's TypeScript SDK generator follows these conventions by default.

**What you can do instead:**

If you're looking for a specific behavior — like collapsing multiple parameters into a named options object — the **`CollapseParamsToArray`** setting does exist for TypeScript and groups endpoint parameters into a single input object:

```json
{
  "CodeGenSettings": {
    "CollapseParamsToArray": true
  }
}
```

This would change endpoint signatures from:

```typescript
postData(unSet: boolean, setToNull: boolean, field: string, data: MyData)
```

to:

```typescript
postData(input: PostDataInput)
```

where `PostDataInput` is a named model containing all the parameters.

> **Caution:** `CollapseParamsToArray` can hide type information from SDKs and documentation, so use it only if this pattern fits your needs.

If that's what you were after, let me know and I can apply it to your project at `./ts-project/`. If you had something else in mind, describe what you're trying to achieve and I'll find the closest available option.
