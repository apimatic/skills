# Serialization Settings

These settings configure how values are serialized and deserialized in the generated SDKs. Use this reference when the user wants to change how arrays are formatted in query/form parameters or how `any`-typed fields are handled.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

| Setting                       | What it does                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ArraySerialization`          | Sets the serialization format for arrays in query and form parameters; allowed values: `Indexed`, `UnIndexed`, `Plain`, `CSV`, `TSV`, `PSV` |
| `EnableJsonPassThroughForAny` | When enabled, `any`-typed fields are passed as raw JSON objects (`JsonObject`) instead of generic `object` types                            |

---

## Step 2: Check Language Support

| Setting                       | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ----------------------------- | --- | ---- | --- | ------ | ---- | --- | --- |
| `ArraySerialization`          | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `EnableJsonPassThroughForAny` | Yes | Yes  | Yes | Yes    | Yes  | Yes | No  |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Array Serialization** — default: `"Indexed"`

| Value       | Format example                                  |
| ----------- | ----------------------------------------------- |
| `Indexed`   | `variableName[0]=value1&variableName[1]=value2` |
| `UnIndexed` | `variableName[]=value1&variableName[]=value2`   |
| `Plain`     | `variableName=value1&variableName=value2`       |
| `CSV`       | `variableName=value1,value2`                    |
| `TSV`       | `variableName=value1\tvalue2`                   |
| `PSV`       | `variableName=value1\|value2`                   |

```json
{
  "CodeGenSettings": {
    "ArraySerialization": "CSV"
  }
}
```

**Enable JSON Pass Through for Any** — default: `false`

```json
{
  "CodeGenSettings": {
    "EnableJsonPassThroughForAny": true
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

**EnableJsonPassThroughForAny — `true`:**

```csharp
// C#
JsonObject body = JsonObject.FromJsonString("{\"key1\":\"val1\",\"key2\":\"val2\"}");
ServerResponse result = await controller.SendSchemaasBodyAsync(body);
```

```java
// Java
JsonObject body = JsonObject.fromJsonString("{\"key1\":\"val1\",\"key2\":\"val2\"}");
```

```php
// PHP
$body = '{"key1":"val1","key2":"val2"}';
```

```python
# Python — body is typed as dict
body = {"key1": "val1", "key2": "val2"}
```

**EnableJsonPassThroughForAny — `false` (default):**

```csharp
// C#
object body = ApiHelper.JsonDeserialize<object>("{\"key1\":\"val1\",\"key2\":\"val2\"}");
```

```java
// Java
Object body = ApiHelper.deserialize("{\"key1\":\"val1\",\"key2\":\"val2\"}");
```

```php
// PHP
$body = ["key1" => "val1", "key2" => "val2"];
```

```python
# Python — body is typed as object (any value)
body = 'Any Value'
```
