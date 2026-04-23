# SDK Docs Configuration

These settings control documentation generation for SDKs. Use this reference when the user wants to disable docs, include optional field examples, hide version numbers, pin a usage example endpoint, or configure resource sorting in generated documentation.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

| Setting                             | What it does                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `DisableDocs`                       | Disables README and all other SDK documentation file generation                                      |
| `GenerateExamplesForOptionalFields` | Includes optional fields when generating sample values in docs                                       |
| `IsLatestVersion`                   | Replaces specific version numbers in install commands and package repo links with generic references |
| `UsageExampleEndpoint`              | Specifies an endpoint to display as a full usage example in the README                               |
| `SortResources`                     | Sorts endpoint groups, endpoints, and models alphabetically in generated docs                        |
| `ConfigureComponentSorting`         | Provides per-component sorting control, overriding `SortResources` for the component types it covers |

---

## Step 2: Check Language Support

| Setting                             | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ----------------------------------- | --- | ---- | --- | ------ | ---- | --- | --- |
| `DisableDocs`                       | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `GenerateExamplesForOptionalFields` | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `IsLatestVersion`                   | Yes | No   | Yes | Yes    | Yes  | Yes | Yes |
| `UsageExampleEndpoint`              | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `SortResources`                     | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `ConfigureComponentSorting`         | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Disable Docs** — default: `false`

```json
{
  "CodeGenSettings": {
    "DisableDocs": true
  }
}
```

**Generate Examples for Optional Fields** — default: `false`

```json
{
  "CodeGenSettings": {
    "GenerateExamplesForOptionalFields": true
  }
}
```

**Is Latest Version** — default: `false`

```json
{
  "CodeGenSettings": {
    "IsLatestVersion": true
  }
}
```

**Usage Example Endpoint** — specify `Description`, `EndpointGroupName`, and `EndpointName`

```json
{
  "CodeGenSettings": {
    "UsageExampleEndpoint": {
      "Description": "Endpoint description here",
      "EndpointGroupName": "Calculator",
      "EndpointName": "OperationGet"
    }
  }
}
```

**Sort Resources** — default: `false`

```json
{
  "CodeGenSettings": {
    "SortResources": true
  }
}
```

**Configure Component Sorting** — overrides `SortResources` for the component types it covers

| Field                   | Type    | Description                                   | Default  |
| ----------------------- | ------- | --------------------------------------------- | -------- |
| `SortEndpointGroups`    | Boolean | Sort endpoint groups alphabetically           | `false`  |
| `EndpointSorting`       | String  | `"None"`, `"Alphabetical"`, or `"HttpMethod"` | `"None"` |
| `SortWebhookGroups`     | Boolean | Sort webhook groups alphabetically            | `false`  |
| `WebhookEventsSorting`  | String  | `"None"`, `"Alphabetical"`, or `"HttpMethod"` | `"None"` |
| `SortCallbackGroups`    | Boolean | Sort callback groups alphabetically           | `false`  |
| `CallbackEventsSorting` | String  | `"None"`, `"Alphabetical"`, or `"HttpMethod"` | `"None"` |
| `SortModels`            | Boolean | Sort models alphabetically                    | `false`  |

```json
{
  "CodeGenSettings": {
    "ConfigureComponentSorting": {
      "SortEndpointGroups": true,
      "EndpointSorting": "HttpMethod",
      "SortWebhookGroups": true,
      "SortCallbackGroups": true,
      "WebhookEventsSorting": "HttpMethod",
      "CallbackEventsSorting": "HttpMethod",
      "SortModels": true
    }
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

**IsLatestVersion — `true`:** install command in README omits the version number

```
npm install container
```

**IsLatestVersion — `false` (default):** install command includes the specific version

```
npm install container@2.0.1
```

**UsageExampleEndpoint:** a **Make Calls with the API Client** section appears in `Readme.md` for all SDKs, containing a full code sample for the configured endpoint.

**SortResources / ConfigureComponentSorting:** endpoint groups, endpoints, and models in the generated docs appear in sorted order rather than the order defined in the OpenAPI specification.
