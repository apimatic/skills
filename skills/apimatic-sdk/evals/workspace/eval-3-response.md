Since you're already logged in, you can go straight to regeneration. Run this from your project root:

```
apimatic sdk generate --input=./my-api --language=csharp --force
```

The `--force` flag tells the CLI to overwrite your existing SDK. Once generation completes, your C# SDK will be updated with the spec changes.

If the command fails, here are the most likely causes:

- **"apimatic command not found"** — run `npm install -g @apimatic/cli` and try again.
- **Spec or `src/` folder missing** — make sure `./my-api/src/spec/` exists and contains your updated API spec file.
- **Auth expired** — run `apimatic auth status` to check. If it shows no account, re-authenticate and then rerun the generate command.
