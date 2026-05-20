# Enum Settings

These settings control how enums are generated within the SDKs. Use this reference when the user wants to enable or disable native enum types, or add a postfix to enum class names.

---

## Step 1: Identify the Required Setting

Find the setting that matches what the user wants to change:

| Setting         | What it does                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `GenerateEnums` | Generates enums as native enum types; when disabled, enum fields use primitive types (e.g., `string`, `int`) instead |
| `UseEnumPrefix` | Postfixes each enum class name with the word `Enum` (e.g., `Days` → `DaysEnum`)                                      |

---

## Step 2: Check Language Support

| Setting         | C#  | Java | PHP      | Python | Ruby | TS  | Go       |
| --------------- | --- | ---- | -------- | ------ | ---- | --- | -------- |
| `GenerateEnums` | Yes | Yes  | Built-in | Yes    | Yes  | Yes | Built-in |
| `UseEnumPrefix` | Yes | Yes  | Yes      | Yes    | Yes  | Yes | Yes      |

**Built-in** means the behavior is inherently supported by default in that language and cannot be disabled.

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Generate Enums** — default: `true`

```json
{
  "CodeGenSettings": {
    "GenerateEnums": false
  }
}
```

**Use Enum Prefix** — default: `true`

```json
{
  "CodeGenSettings": {
    "UseEnumPrefix": true
  }
}
```

Both settings can be combined:

```json
{
  "CodeGenSettings": {
    "GenerateEnums": true,
    "UseEnumPrefix": false
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

After generation, check the affected endpoint signatures in the generated SDK to confirm the change.

**GenerateEnums — `true` (default):**

```csharp
// C#
public Models.ServerResponse PostStringEnumArray(List<Models.Days> days)
```

```java
// Java
public ServerResponse postStringEnumArray(final List<Days> days)
```

```python
# Python
days = [Days.SUNDAY, Days.MONDAY, Days.TUESDAY]
```

**GenerateEnums — `false`:**

```csharp
public Models.ServerResponse PostStringEnumArray(List<string> days)
```

```java
public ServerResponse postStringEnumArray(final List<String> days)
```

```python
days = ['Sunday', 'Monday', 'Tuesday']
```

---

**UseEnumPrefix — `true` (default):** `SuiteCodeEnum.HEARTS` / `DaysEnum`

**UseEnumPrefix — `false`:** `SuiteCode.HEARTS` / `Days`
