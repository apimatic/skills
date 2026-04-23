To see your Java SDK without your customizations applied, run the generate command with the `--skip-changes` flag from your project directory:

```
apimatic sdk generate --input=./java-api --language=java --skip-changes
```

This produces a clean copy of the SDK as if your customizations were never applied. Your saved customizations are not affected — they are not removed and will still be applied in future regenerations unless you explicitly remove them.
