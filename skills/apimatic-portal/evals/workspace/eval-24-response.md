Sure! Which language would you like to apply the beta tag to?

The language key in `portalSettings.languageSettings` must be the APIMatic SDK template name — not the short name used in `languageConfig`. Common mappings are:

| `languageConfig` key | `languageSettings` key |
|---|---|
| `python` | `python_generic_lib` |
| `typescript` | `typescript_generic_lib` |
| `java` | `java_eclipse_jre_lib` |
| `csharp` | `cs_net_standard_lib` |
| `php` | `php_generic_lib_v2` |
| `ruby` | `ruby_generic_lib` |
| `go` | `go_generic_lib` |

Once you tell me which language, I will add `"stabilityLevelTag": "beta"` under that language's entry in `portalSettings.languageSettings` inside `src/APIMATIC-BUILD.json`.

For example, if you want to tag **Java** as beta, the resulting config would look like this:

```json
{
  "generatePortal": {
    "portalSettings": {
      "languageSettings": {
        "java_eclipse_jre_lib": {
          "stabilityLevelTag": "beta"
        }
      }
    }
  }
}
```

Which language should I apply the beta tag to?
