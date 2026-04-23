# Miscellaneous Settings

These settings cover code generation options that don't fit into a specific category but allow fine-tuning of SDK behavior, authentication handling, licensing, and casing conventions.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

| Setting                       | What it does                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `DisableLinting`              | Disables generation of lint test files and commands                                                  |
| `DisableMultipleAuth`         | Disables multiple authentication support; only the first security scheme from the spec is applied    |
| `AddSingleAuthDeprecatedCode` | Controls whether deprecated single-auth client setup code is included alongside the new auth flow    |
| `JavaUsePropertiesConfig`     | Allows the Java SDK to load its configuration from a properties file                                 |
| `LicenseText`                 | Replaces the default MIT license text with a custom string in the SDK's license file                 |
| `StoreTimezoneInformation`    | Stores timezone info with date-time values; when disabled, all date-time values are converted to UTC |
| `ApplyCustomizations`         | Applies a list of APIMatic-provided customer-specific customization keys during SDK generation       |
| `EnforceStandardizedCasing`   | Enforces standardized casing conventions during SDK and docs generation                              |

---

## Step 2: Check Language Support

| Setting                       | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ----------------------------- | --- | ---- | --- | ------ | ---- | --- | --- |
| `DisableLinting`              | No  | No   | Yes | No     | Yes  | Yes | No  |
| `DisableMultipleAuth`         | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `AddSingleAuthDeprecatedCode` | Yes | Yes  | Yes | Yes    | Yes  | Yes | N/A |
| `JavaUsePropertiesConfig`     | No  | Yes  | No  | No     | No   | No  | No  |
| `LicenseText`                 | Yes | Yes  | Yes | Yes    | Yes  | Yes | No  |
| `StoreTimezoneInformation`    | Yes | Yes  | No  | No     | No   | No  | No  |
| `ApplyCustomizations`         | Yes | Yes  | Yes | Yes    | Yes  | Yes | No  |
| `EnforceStandardizedCasing`   | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Disable Linting** — default: `false`

```json
{
  "CodeGenSettings": {
    "DisableLinting": true
  }
}
```

**Disable Multiple Auth** — default: `false`

> **Caution:** Disabling multiple authentication only applies the first security scheme from the OpenAPI specification. This flag will be deprecated eventually; using the full multiple-auth flow is recommended.

```json
{
  "CodeGenSettings": {
    "DisableMultipleAuth": true
  }
}
```

**Add Single Auth Deprecated Code** — default: `true`

```json
{
  "CodeGenSettings": {
    "AddSingleAuthDeprecatedCode": false
  }
}
```

**Java Use Properties Config** — default: `false`

> **Note:** This is an experimental setting and may not work in all cases.

```json
{
  "CodeGenSettings": {
    "JavaUsePropertiesConfig": true
  }
}
```

**License Text** — default: MIT license

```json
{
  "CodeGenSettings": {
    "LicenseText": "License text here..."
  }
}
```

**Store Timezone Information** — default: `false`

```json
{
  "CodeGenSettings": {
    "StoreTimezoneInformation": true
  }
}
```

**Apply Customizations** — list of APIMatic-provided keys

```json
{
  "CodeGenSettings": {
    "ApplyCustomizations": ["custom-abc", "custom-xyz"]
  }
}
```

**Enforce Standardized Casing** — default: `false`

```json
{
  "CodeGenSettings": {
    "EnforceStandardizedCasing": true
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

**AddSingleAuthDeprecatedCode — `true` (default):** deprecated fields appear alongside the new auth flow

```ts
const client = new Client({
  basicAuthUsername: "Username", // Deprecated
  basicAuthPassword: "Password", // Deprecated
  basicAuthCredentials: {
    username: "Username",
    password: "Password",
  },
});
```

**AddSingleAuthDeprecatedCode — `false`:** only the new auth flow is present

```ts
const client = new Client({
  basicAuthCredentials: {
    username: "Username",
    password: "Password",
  },
});
```

**StoreTimezoneInformation — `true`:**

```csharp
DateTimeOffset datetime = DateTime.ParseExact("2023-03-13T12:52:32.123Z", ...);
```

```java
ZonedDateTime datetime = DateTimeHelper.fromRfc8601DateTime("2023-03-13T12:52:32.123Z");
```

**StoreTimezoneInformation — `false` (default):**

```csharp
DateTime datetime = DateTime.ParseExact("2023-03-13T12:52:32.123Z", ...);
```

```java
LocalDateTime datetime = DateTimeHelper.fromRfc8601DateTime("2023-03-13T12:52:32.123Z");
```
