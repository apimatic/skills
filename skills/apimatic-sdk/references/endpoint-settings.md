# Endpoint Settings

These settings manage endpoint-specific behavior in the generated SDKs. Use this reference when the user wants to change how endpoint methods are named, what they return, how parameters are handled, or how the SDK responds to specific HTTP status codes.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

Find the setting that matches what the user wants to change:

| Setting | What it does |
| ------- | ------------ |
| `ReturnCompleteHttpResponse` | Returns the full HTTP response (headers + status code) instead of just the response body |
| `UseHttpMethodPrefix` | Prefixes endpoint method names with the HTTP verb (`Get`, `Update`, or `Delete`) |
| `EncodeTemplateParameters` | Encodes endpoint-level template parameters |
| `ValidateRequiredParameters` | Throws an exception when a required parameter is passed as null |
| `CollapseParamsToArray` | Collapses multiple endpoint parameters into a single options array |
| `UseEndpointMethodName` | Uses the `MethodName` property on the endpoint entity instead of `Name` for method naming |
| `Nullify404` | Returns null instead of throwing an exception on HTTP 404 |
| `NullifyEmptyResponses` | Accepts empty response payloads as null when multiple response types are defined |
| `LiftParameterDescriptionFromCustomType` | Uses a referenced custom type's description as the parameter description when the parameter has none |
| `ForceKeywordArgsInRuby` | Uses keyword arguments instead of positional arguments for required parameters (Ruby only) |
| `MapErrorTypesInCompleteResponseForPHP` | Maps typed error responses when returning complete HTTP responses (PHP only, requires `ReturnCompleteHttpResponse`) |

---

## Step 2: Check Language Support

| Setting | C# | Java | PHP | Python | Ruby | TS | Go |
| ------- | --- | --- | --- | --- | --- | --- | --- |
| `ReturnCompleteHttpResponse` | Yes | Yes | Yes | Yes | Yes | Built-in | Built-in |
| `UseHttpMethodPrefix` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `EncodeTemplateParameters` | No | Yes | No | Yes | Yes | Yes | No |
| `ValidateRequiredParameters` | Yes | Yes | Yes | Yes | Yes | Yes | Built-in |
| `CollapseParamsToArray` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `UseEndpointMethodName` | Yes | Yes | Yes | No | No | Yes | Yes |
| `Nullify404` | Yes | Yes | Yes | Yes | Yes | No | No |
| `NullifyEmptyResponses` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `LiftParameterDescriptionFromCustomType` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `ForceKeywordArgsInRuby` | No | No | No | No | Yes | No | No |
| `MapErrorTypesInCompleteResponseForPHP` | No | No | Yes | No | No | No | No |

**Built-in** means the behavior is inherently supported by default in that language and cannot be disabled.

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Return Complete HTTP Response** — default: `false`
```json
{
  "CodeGenSettings": {
    "ReturnCompleteHttpResponse": true
  }
}
```

**Use HTTP Method Prefix** — default: `false`

> **Note:** Has no effect on method names that are already prefixed.

```json
{
  "CodeGenSettings": {
    "UseHttpMethodPrefix": true
  }
}
```

**Encode Template Parameters** — default: `true` (experimental)
```json
{
  "CodeGenSettings": {
    "EncodeTemplateParameters": true
  }
}
```

**Validate Required Parameters** — default: `false`

> **Note:** Default values for required parameters are ignored.

```json
{
  "CodeGenSettings": {
    "ValidateRequiredParameters": true
  }
}
```

**Collapse Params to Array** — default: `false`

> **Caution:** Use only in specific scenarios — this setting can hide type information from SDKs and documentation.

```json
{
  "CodeGenSettings": {
    "CollapseParamsToArray": true
  }
}
```

**Use Endpoint Method Name** — default: `false` (experimental)
```json
{
  "CodeGenSettings": {
    "UseEndpointMethodName": true
  }
}
```

**Nullify 404** — default: `false`
```json
{
  "CodeGenSettings": {
    "Nullify404": true
  }
}
```

**Nullify Empty Responses** — default: `false`
```json
{
  "CodeGenSettings": {
    "NullifyEmptyResponses": true
  }
}
```

**Lift Parameter Description From Custom Type** — default: `false`
```json
{
  "CodeGenSettings": {
    "LiftParameterDescriptionFromCustomType": true
  }
}
```

**Force Keyword Arguments in Ruby** — default: `false`
```json
{
  "CodeGenSettings": {
    "ForceKeywordArgsInRuby": true
  }
}
```

**Map Error Types in Complete Response for PHP** — default: `false`

> **Note:** Only applies when `ReturnCompleteHttpResponse` is also enabled.

```json
{
  "CodeGenSettings": {
    "ReturnCompleteHttpResponse": true,
    "MapErrorTypesInCompleteResponseForPHP": true
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

After generation, check the affected endpoint methods in the generated SDK to confirm the change.

**ReturnCompleteHttpResponse — `true`:**
```csharp
// C#
public ApiResponse<Models.ServerResponse> GetData()
```
```java
// Java
public ApiResponse<ServerResponse> getData()
```
```php
// PHP
public function getData(): ApiResponse
```
```python
# Python
def get_data():
    """Returns: ApiResponse"""
```
```ruby
# Ruby
# @return [ApiResponse]
def get_data()
```

**ReturnCompleteHttpResponse — `false` (default):**
```csharp
// C#
public Models.ServerResponse GetData()
```

---

**UseHttpMethodPrefix — `true`:**
```csharp
// C#
dynamic result = await echoController.CreateJsonEchoAsync(input);
```
```java
// Java
echoController.createJsonEchoAsync(input)
```
```python
# Python
result = echo_controller.create_json_echo(input)
```

**UseHttpMethodPrefix — `false` (default):**
```csharp
dynamic result = await echoController.JsonEchoAsync(input);
```

---

**CollapseParamsToArray — `true`:**
```csharp
// C#
public Models.ServerResponse PostData(Models.PostDataInput input)
```
```python
# Python
def post_data(self, options=dict())
```

**CollapseParamsToArray — `false` (default):**
```csharp
public Models.ServerResponse PostData(bool unSet, bool setToNull, string field, Models.MyData data)
```
```python
def post_data(self, un_set, set_to_null, field, data)
```

---

**Nullify404 — `true`:** Returns `null` on HTTP 404 instead of throwing an exception.

**NullifyEmptyResponses — `true`:** Empty response payloads are returned as `null`; typed responses are returned normally.

---

**ForceKeywordArgsInRuby — `true`:**
```ruby
result = echo_controller.json_echo(input: input)
```

**ForceKeywordArgsInRuby — `false` (default):**
```ruby
result = echo_controller.json_echo(input)
```

---

**MapErrorTypesInCompleteResponseForPHP — `true`:**
```php
if ($apiResponse->isError()) {
    $error = $apiResponse->getResult();
    if ($error instanceof CustomAlphaException) {
        echo "CustomAlphaException: $error";
    } elseif ($error instanceof CustomBetaException) {
        echo "CustomBetaException: $error";
    }
}
```

**MapErrorTypesInCompleteResponseForPHP — `false` (default):**
```php
if ($apiResponse->isError()) {
    $error = $apiResponse->getResult();
    echo "Untyped raw response body: $error";
}
```
