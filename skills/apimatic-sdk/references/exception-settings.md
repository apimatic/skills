# Exception Settings

These settings control how exceptions are handled and reported in the generated SDKs. Use this reference when the user wants to customize error messages for specific HTTP status codes or resolve naming conflicts in C# exception models.

---

## Step 1: Identify the Required Setting

| Setting                                    | What it does                                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ErrorTemplates`                           | Configures custom error message templates for specific HTTP error codes or ranges; use `{$statusCode}` as a placeholder for the actual status code  |
| `CSharpResolveExceptionPropertyCollisions` | Resolves naming conflicts in C# exception models where generated properties overlap with `System.Exception` members (e.g., `Message`, `StackTrace`) |

---

## Step 2: Check Language Support

| Setting                                    | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ------------------------------------------ | --- | ---- | --- | ------ | ---- | --- | --- |
| `ErrorTemplates`                           | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `CSharpResolveExceptionPropertyCollisions` | Yes | No   | No  | No     | No   | No  | No  |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Error Templates** — default: `null`

Keys are HTTP error codes (`"401"`) or ranges (`"5XX"`, `"0"`). Values are message strings with optional `{$statusCode}` placeholder.

```json
{
  "CodeGenSettings": {
    "ErrorTemplates": {
      "401": "Failed to authorize, Code: {$statusCode}.",
      "5XX": "Internal server error, Code: {$statusCode}.",
      "0": "An error occurred. Code: {$statusCode}"
    }
  }
}
```

**CSharp Resolve Exception Property Collisions** — default: `false`

Conflicting properties include: `Message`, `ResponseCode`, `StackTrace`, `Source`, `Data`, `HelpLink`, `HttpContext`, `InnerException`, `HResult`, `TargetSite`.

> **Caution:** Enabling this setting may rename existing exception properties (e.g., `Message` → `MessageProperty`). Any code accessing the original property names will need to be updated.

```json
{
  "CodeGenSettings": {
    "CSharpResolveExceptionPropertyCollisions": true
  }
}
```

---

## Step 4: Regenerate the SDK

Navigate to the project root (the directory that contains `src/`) and run:

```
apimatic sdk generate --language=<language>
```

Use the same `--input`, `--destination`, and `--api-version` flags that were used when the SDK was originally generated. The updated `APIMATIC-META.json` is picked up automatically — no extra flags are needed.

---

## Step 5: Verify the Output

**ErrorTemplates** — check the exception classes in the generated SDK. The custom message template should appear in the error handling logic for the configured status codes.

**CSharpResolveExceptionPropertyCollisions — `true`:**

```csharp
public class Error : ApiException
{
    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("message")]
    public string MessageProperty { get; set; }
}
```

**CSharpResolveExceptionPropertyCollisions — `false` (default):**

```csharp
public class Error : ApiException
{
    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("message")]
    public new string Message { get; set; }
}
```
