# HTTP Configuration Settings

These settings manage HTTP behavior in the generated SDKs. Use this reference when the user wants to enable HTTP caching, control content-type headers, or add an option to skip SSL certificate verification.

---

## Step 1: Identify the Required Setting

| Setting                            | What it does                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `EnableHttpCache`                  | Enables HTTP caching for idempotent endpoint methods                                                         |
| `AppendContentHeaders`             | Automatically appends `accept` and `content-type` headers based on the serialization mode                    |
| `AllowSkippingSSLCertVerification` | Adds a configuration option in the SDK to optionally skip SSL certificate verification for HTTPS connections |

---

## Step 2: Check Language Support

| Setting                            | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ---------------------------------- | --- | ---- | --- | ------ | ---- | --- | --- |
| `EnableHttpCache`                  | No  | No   | No  | Yes    | Yes  | No  | No  |
| `AppendContentHeaders`             | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `AllowSkippingSSLCertVerification` | Yes | Yes  | Yes | Yes    | Yes  | No  | No  |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Enable HTTP Cache** — default: `false`

> **Note:** This setting is experimental and may not function properly at all times.

```json
{
  "CodeGenSettings": {
    "EnableHttpCache": true
  }
}
```

**Append Content Headers** — default: `true`

```json
{
  "CodeGenSettings": {
    "AppendContentHeaders": true
  }
}
```

**Allow Skipping SSL Certificate Verification** — default: `false`

> **Caution:** Skipping SSL certificate verification is not recommended as it opens a security vulnerability.

```json
{
  "CodeGenSettings": {
    "AllowSkippingSSLCertVerification": true
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

**AppendContentHeaders — `true` (default):**

```curl
curl -X GET -G \
  --url 'http://localhost:3000/response/date' \
  -H 'Accept: application/json' \
  -d 'array=true'
```

**AppendContentHeaders — `false`:**

```curl
curl -X GET -G \
  --url 'http://localhost:3000/response/date' \
  -d 'array=true'
```

**AllowSkippingSSLCertVerification** — when enabled, the generated SDK client exposes a configuration option (e.g., `skipSslCertVerification`, `verifyPeer`) that can be set to `true` to bypass certificate checks during development or testing.
