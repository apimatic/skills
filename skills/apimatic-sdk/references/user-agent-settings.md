# User Agent Settings

These settings configure the user agent string sent in API call headers. Use this reference when the user wants to disable the global user agent or customize the user agent string with dynamic placeholders.

---

## Step 1: Identify the Required Setting

| Setting                 | What it does                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `EnableGlobalUserAgent` | Enables or disables sending the `UserAgent` field in the user-agent header globally across all API calls                               |
| `UserAgent`             | Sets a custom user agent string; supports placeholders like `{language}`, `{version}`, `{engine}`, `{engine-version}`, and `{os-info}` |

---

## Step 2: Check Language Support

| Setting                 | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ----------------------- | --- | ---- | --- | ------ | ---- | --- | --- |
| `EnableGlobalUserAgent` | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `UserAgent`             | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Enable Global User Agent** — default: `true`

> **Note:** Disabling this setting will not prevent the user agent from being sent if it has been explicitly set as an additional header or included in the endpoint parameters as a header parameter.

```json
{
  "CodeGenSettings": {
    "EnableGlobalUserAgent": false
  }
}
```

**User Agent** — default: `"APIMATIC 3.0"`

Supported placeholders:

| Placeholder        | Resolves to                                |
| ------------------ | ------------------------------------------ |
| `{language}`       | SDK language name (e.g., `Java`, `PHP`)    |
| `{version}`        | API version from the OpenAPI specification |
| `{engine}`         | Runtime engine name                        |
| `{engine-version}` | Runtime engine version                     |
| `{os-info}`        | OS where the SDK is being operated         |

```json
{
  "CodeGenSettings": {
    "UserAgent": "{language} SDK, Version: {version}, on OS {os-info}"
  }
}
```

Both settings can be combined:

```json
{
  "CodeGenSettings": {
    "EnableGlobalUserAgent": true,
    "UserAgent": "{language} SDK, Version: {version}, on OS {os-info}"
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

After generation, inspect the SDK's HTTP client initialization or request builder to confirm the user agent header.

**Default user agent (`APIMATIC 3.0`):**

```
User-Agent: APIMATIC 3.0
```

**Custom user agent with placeholders resolved at runtime:**

```
User-Agent: Java SDK, Version: 1.0, on OS Linux
```

**EnableGlobalUserAgent — `false`:** the SDK omits the `User-Agent` header from requests unless it is explicitly passed as an additional header or endpoint parameter.
