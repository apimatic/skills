# Timeout and Retries Settings

These settings control request timeouts, retry behavior, and exponential backoff in the generated SDKs. Use this reference when the user wants to configure how long requests wait before timing out, when to retry, and how retries are spaced.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

| Setting                   | What it does                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Timeout`                 | Sets the request timeout in seconds; `0` means no timeout                                                      |
| `RetryOnTimeout`          | Enables retrying requests that time out; must be enabled to use the other retry settings                       |
| `RequestMethodsToRetry`   | Specifies which HTTP methods to retry; allowed values: `GET`, `PUT`                                            |
| `StatusCodesToRetry`      | Specifies which HTTP status codes trigger a retry; allowed: `408, 413, 429, 500, 502, 503, 504, 521, 522, 524` |
| `BackoffMax`              | Sets the maximum total wait time (in seconds) across all retry attempts                                        |
| `Retries`                 | Sets the number of retry attempts before the request fails                                                     |
| `RetryInterval`           | Sets the base time interval (in seconds) between retries                                                       |
| `BackOffFactor`           | Multiplier applied to `RetryInterval` on each successive retry for exponential backoff                         |
| `UserConfigurableRetries` | Exposes retry configuration options to SDK users in the client constructor                                     |

---

## Step 2: Check Language Support

| Setting                   | C#  | Java | PHP | Python   | Ruby     | TS  | Go  |
| ------------------------- | --- | ---- | --- | -------- | -------- | --- | --- |
| `Timeout`                 | Yes | Yes  | Yes | Yes      | Yes      | Yes | Yes |
| `RetryOnTimeout`          | Yes | Yes  | Yes | Built-in | Built-in | Yes | Yes |
| `RequestMethodsToRetry`   | Yes | Yes  | Yes | Yes      | Yes      | Yes | Yes |
| `StatusCodesToRetry`      | Yes | Yes  | Yes | Yes      | Yes      | Yes | Yes |
| `BackoffMax`              | Yes | Yes  | Yes | No       | No       | Yes | Yes |
| `Retries`                 | Yes | Yes  | Yes | Yes      | Yes      | Yes | Yes |
| `RetryInterval`           | Yes | Yes  | Yes | Yes      | Yes      | Yes | Yes |
| `BackOffFactor`           | Yes | Yes  | Yes | Yes      | Yes      | Yes | Yes |
| `UserConfigurableRetries` | Yes | No   | No  | No       | No       | Yes | Yes |

**Built-in** means Python and Ruby always retry on timeout and the behavior cannot be disabled.

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant keys under `CodeGenSettings`.

> **Note:** `RetryOnTimeout` must be set to `true` to activate `RequestMethodsToRetry`, `StatusCodesToRetry`, `BackoffMax`, `Retries`, `RetryInterval`, and `BackOffFactor`.

**Timeout** — default: `0` (no timeout)

```json
{
  "CodeGenSettings": {
    "Timeout": 30
  }
}
```

**RetryOnTimeout** — default: `true`

```json
{
  "CodeGenSettings": {
    "RetryOnTimeout": true
  }
}
```

**RequestMethodsToRetry** — default: `["GET", "PUT"]`

```json
{
  "CodeGenSettings": {
    "RequestMethodsToRetry": ["GET", "PUT"]
  }
}
```

**StatusCodesToRetry** — default: `[408, 413, 429, 500, 502, 503, 504, 521, 522, 524]`

```json
{
  "CodeGenSettings": {
    "StatusCodesToRetry": [408, 429, 503]
  }
}
```

**BackoffMax** — maximum total retry wait time in seconds

```json
{
  "CodeGenSettings": {
    "BackoffMax": 120
  }
}
```

**Retries** — default: `0`

```json
{
  "CodeGenSettings": {
    "Retries": 3
  }
}
```

**RetryInterval** — base interval in seconds, default: `1.0`

```json
{
  "CodeGenSettings": {
    "RetryInterval": 1.5
  }
}
```

**BackOffFactor** — exponential backoff multiplier, default: `2`

```json
{
  "CodeGenSettings": {
    "BackOffFactor": 1.5
  }
}
```

**UserConfigurableRetries** — default: `true`

```json
{
  "CodeGenSettings": {
    "UserConfigurableRetries": true
  }
}
```

All retry settings combined example:

```json
{
  "CodeGenSettings": {
    "Timeout": 30,
    "RetryOnTimeout": true,
    "RequestMethodsToRetry": ["GET", "PUT"],
    "StatusCodesToRetry": [408, 429, 503],
    "BackoffMax": 120,
    "Retries": 3,
    "RetryInterval": 1.5,
    "BackOffFactor": 2,
    "UserConfigurableRetries": true
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

When `UserConfigurableRetries` is `true`, SDK users can configure timeout and retry behavior in their client constructor:

```typescript
const client = new Client({
  timeout: 60,
  httpClientOptions: {
    retryConfig: {
      maxNumberOfRetries: 3,
      retryOnTimeout: true,
      retryInterval: 1,
      httpStatusCodesToRetry: [
        408, 413, 429, 500, 502, 503, 504, 521, 522, 524,
      ],
      httpMethodsToRetry: ["GET", "PUT"],
    },
  },
});
```

When `UserConfigurableRetries` is `false`, these options are not exposed in the client constructor and the retry configuration is fixed to the values set in `APIMATIC-META.json`.
