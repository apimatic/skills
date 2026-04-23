# Model Settings

These settings control model-specific behavior in the generated SDKs. Use this reference when the user wants to enable typed additional properties, add a model name postfix, use keyword arguments in Ruby models, or skip equality method generation in C#.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

| Setting                               | What it does                                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ExtendedAdditionalPropertiesSupport` | Enables typed additional properties on models, allowing specific data types instead of a generic type for extra fields |
| `UseModelPrefix`                      | Postfixes each model class name with `Model` (e.g., `Person` → `PersonModel`) to avoid naming conflicts                |
| `EnableModelKeywordArgsInRuby`        | Uses keyword arguments in Ruby model constructors instead of positional arguments                                      |
| `CSharpSkipEqualityMethods`           | Skips generation of `Equals` and `GetHashCode` implementations for models and container types in C#                    |

---

## Step 2: Check Language Support

| Setting                               | C#  | Java | PHP | Python | Ruby | TS  | Go  |
| ------------------------------------- | --- | ---- | --- | ------ | ---- | --- | --- |
| `ExtendedAdditionalPropertiesSupport` | Yes | Yes  | Yes | Yes    | Yes  | Yes | Yes |
| `UseModelPrefix`                      | Yes | Yes  | Yes | Yes    | Yes  | Yes | No  |
| `EnableModelKeywordArgsInRuby`        | No  | No   | No  | No     | Yes  | No  | No  |
| `CSharpSkipEqualityMethods`           | Yes | No   | No  | No     | No   | No  | No  |

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Extended Additional Properties Support** — default: `false`

```json
{
  "CodeGenSettings": {
    "ExtendedAdditionalPropertiesSupport": true
  }
}
```

**Use Model Prefix** — default: `false`

> **Note:** Use this only if there is a risk of naming conflicts between models and other identifiers (APIs, endpoints, controllers) in the OpenAPI specification.

```json
{
  "CodeGenSettings": {
    "UseModelPrefix": true
  }
}
```

**Enable Model Keyword Args in Ruby** — default: `false`

```json
{
  "CodeGenSettings": {
    "EnableModelKeywordArgsInRuby": true
  }
}
```

**CSharp Skip Equality Methods** — default: `false`

> **Note:** Enabling this prevents incorrect equality and hashing on mutable models. Any code relying on value-based equality (`Equals`, `==`, `Dictionary`, `HashSet`) may observe different behavior after enabling.

```json
{
  "CodeGenSettings": {
    "CSharpSkipEqualityMethods": true
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

**ExtendedAdditionalPropertiesSupport — `true`:**

```csharp
StudentResult body = new StudentResult {
    Email = "student616@oxford.ac.uk",
    ["Theory Of Automata"] = 82.1,
    ["Computational complexity"] = 72.5,
};
```

**ExtendedAdditionalPropertiesSupport — `false` (default):**

```csharp
StudentResult body = new StudentResult {
    Email = "student616@oxford.ac.uk",
};
```

**UseModelPrefix — `true`:** `PersonModel`, `DeleteBodyModel`, `ServerResponseModel`

**UseModelPrefix — `false` (default):** `Person`, `DeleteBody`, `ServerResponse`

**EnableModelKeywordArgsInRuby — `true`:**

```ruby
user = User.new(email: "bob@example.com", name: "Bob")
```

**EnableModelKeywordArgsInRuby — `false` (default):**

```ruby
user = User.new("Alice", "alice@example.com")
```

**CSharpSkipEqualityMethods — `true`:** `Equals` and `GetHashCode` are not generated; equality falls back to reference comparison.

**CSharpSkipEqualityMethods — `false` (default):** `Equals` and `GetHashCode` are generated for all models.
