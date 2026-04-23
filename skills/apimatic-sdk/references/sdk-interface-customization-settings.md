# SDK Interface Customization

These settings control the overall look and feel of the generated SDK code — naming conventions, namespaces, controller structure, interfaces, authentication naming, logging, and synchrony mode.

## Contents

- [Step 1: Identify the Required Setting](#step-1-identify-the-required-setting)
- [Step 2: Check Language Support](#step-2-check-language-support)
- [Step 3: Apply the Setting in APIMATIC-META.json](#step-3-apply-the-setting-in-apimatic-metajson)
- [Step 4: Regenerate the SDK](#step-4-regenerate-the-sdk)
- [Step 5: Verify the Output](#step-5-verify-the-output)

---

## Step 1: Identify the Required Setting

| Setting                              | What it does                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `ProjectName`                        | Sets the name of the generated SDK package and client class                                |
| `CSharpNamespace`                    | Sets the root namespace for C# SDKs                                                        |
| `JavaPackageName`                    | Sets the root package name for Java SDKs                                                   |
| `PHPNamespace`                       | Sets the root namespace for PHP SDKs                                                       |
| `UseControllerPrefix`                | Appends a postfix (default: `Controller`) to each controller class name                    |
| `ControllerPostfix`                  | Sets a custom postfix string for controller classes (requires `UseControllerPrefix: true`) |
| `ControllerNamespace`                | Sets the namespace/folder name where controller classes are placed                         |
| `GenerateInterfaces`                 | Generates interfaces for controller classes to support mock testing                        |
| `ClientInterfaceName`                | Sets the class name for the client interface (Python only)                                 |
| `UseSecuritySchemeNameForSingleAuth` | Uses the auth scheme name from the spec as the auth method name in the client              |
| `DoNotSplitWords`                    | List of words that should not be split when converting identifiers (e.g., brand names)     |
| `SynchronyMode`                      | Switches between `Asynchronous` (default) and `Synchronous` code generation                |
| `EnableLogging`                      | Includes logging configuration support in the generated SDK client                         |
| `SymbolizeHashKeysInRuby`            | Uses symbols instead of strings for hash keys in Ruby SDKs                                 |

---

## Step 2: Check Language Support

| Setting                              | C#  | Java | PHP | Python | Ruby | TS       | Go       |
| ------------------------------------ | --- | ---- | --- | ------ | ---- | -------- | -------- |
| `ProjectName`                        | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `CSharpNamespace`                    | Yes | No   | No  | No     | No   | No       | No       |
| `JavaPackageName`                    | No  | Yes  | No  | No     | No   | No       | No       |
| `PHPNamespace`                       | No  | No   | Yes | No     | No   | No       | No       |
| `UseControllerPrefix`                | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `ControllerPostfix`                  | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `ControllerNamespace`                | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `GenerateInterfaces`                 | Yes | Yes  | No  | No     | No   | No       | Built-in |
| `ClientInterfaceName`                | No  | No   | No  | Yes    | No   | No       | No       |
| `UseSecuritySchemeNameForSingleAuth` | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `DoNotSplitWords`                    | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `SynchronyMode`                      | Yes | Yes  | No  | No     | No   | Built-in | Built-in |
| `EnableLogging`                      | Yes | Yes  | Yes | Yes    | Yes  | Yes      | Yes      |
| `SymbolizeHashKeysInRuby`            | No  | No   | No  | No     | Yes  | No       | No       |

**Built-in** means the behavior is inherent to the language and cannot be changed.

---

## Step 3: Apply the Setting in APIMATIC-META.json

Open `<input-dir>/src/spec/APIMATIC-META.json` and add the relevant key under `CodeGenSettings`.

**Project Name** — default: API name

```json
{
  "CodeGenSettings": {
    "ProjectName": "MyProject"
  }
}
```

**CSharp Namespace** — default: API name

```json
{
  "CodeGenSettings": {
    "CSharpNamespace": "OrgNamespace"
  }
}
```

**Java Package Name** — default: derived from Base URI (e.g., `apimatic.io` → `io.apimatic`)

```json
{
  "CodeGenSettings": {
    "JavaPackageName": "com.example.sdk"
  }
}
```

**PHP Namespace** — default: API name

```json
{
  "CodeGenSettings": {
    "PHPNamespace": "Apimatic"
  }
}
```

**Use Controller Prefix** — default: `true`

```json
{
  "CodeGenSettings": {
    "UseControllerPrefix": true
  }
}
```

**Controller Postfix** — default: `"Controller"` (requires `UseControllerPrefix: true`)

```json
{
  "CodeGenSettings": {
    "ControllerPostfix": "Api"
  }
}
```

**Controller Namespace** — default: `"Controllers"`

```json
{
  "CodeGenSettings": {
    "ControllerNamespace": "Apis"
  }
}
```

**Generate Interfaces** — default: `false`

> **Note:** This is an experimental setting and may not work in all cases.

```json
{
  "CodeGenSettings": {
    "GenerateInterfaces": true
  }
}
```

**Client Interface Name** — default: derived from `ProjectName` (e.g., `TesterClient`)

```json
{
  "CodeGenSettings": {
    "ClientInterfaceName": "Interface"
  }
}
```

**Use Security Scheme Name For Single Auth** — default: `false`

```json
{
  "CodeGenSettings": {
    "UseSecuritySchemeNameForSingleAuth": true
  }
}
```

**Do Not Split Words** — list of words (alphanumeric only); order determines priority

```json
{
  "CodeGenSettings": {
    "DoNotSplitWords": ["apimatic", "vmware", "petId"]
  }
}
```

**Synchrony Mode** — default: `"Asynchronous"`

```json
{
  "CodeGenSettings": {
    "SynchronyMode": "Synchronous"
  }
}
```

**Enable Logging** — default: `false`

```json
{
  "CodeGenSettings": {
    "EnableLogging": true
  }
}
```

**Symbolize Hash Keys in Ruby** — default: `false`

```json
{
  "CodeGenSettings": {
    "SymbolizeHashKeysInRuby": true
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

**ProjectName — `"MyProject"`:**

```csharp
// C#
MyProject.Standard.MyProjectClient client = new MyProject.Standard.MyProjectClient.Builder()
    .Environment(MyProject.Standard.Environment.Testing)
    .Build();
```

```java
// Java
MyProjectClient client = new MyProjectClient.Builder()
    .environment(Environment.TESTING)
    .build();
```

**UseControllerPrefix — `true` (default):** `responseTypesController.getContentTypeHeaders()`

**UseControllerPrefix — `false`:** `responseTypes.getContentTypeHeaders()`

**ControllerPostfix — `"Api"`:** `echoApi.jsonEcho(input)` instead of `echoController.jsonEcho(input)`

**GenerateInterfaces — `true`:**

```csharp
IBodyParamsController bodyParamsController = client.BodyParamsController;
```

**UseSecuritySchemeNameForSingleAuth — `true`:** auth method uses the scheme name from the spec (e.g., `ccgAuth`) instead of the generic type name (`clientCredentialsAuth`):

```csharp
// true
new SdkClient.Builder().CcgAuth(new CcgAuthModel.Builder("id", "secret").Build()).Build();
// false (default)
new SdkClient.Builder().ClientCredentialsAuth(new ClientCredentialsAuthModel.Builder("id", "secret").Build()).Build();
```

**DoNotSplitWords — `["petId"]`:** the word `petId` is treated as one token and lowercased instead of split:

```csharp
public Models.Pet GetPetById(long petid)  // configured
public Models.Pet GetPetById(long petId)  // default
```

**SynchronyMode — `"Synchronous"`:**

```csharp
EmployeeComp result = responseTypesController.ReturnEmployeeModel();            // Synchronous
EmployeeComp result = await responseTypesController.ReturnEmployeeModelAsync(); // Asynchronous (default)
```

**EnableLogging — `true`:** the SDK client exposes logging configuration options:

```csharp
SdkClient client = new SdkClient.Builder()
    .LoggingConfig(config => config
        .LogLevel(LogLevel.Information)
        .RequestConfig(reqConfig => reqConfig.Body(true))
    )
    .Build();
```
