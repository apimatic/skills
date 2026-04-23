Since you're already set up and authenticated, you're ready to go.

Run this command to generate the TypeScript SDK as a zip file in your chosen output folder:

```
apimatic sdk generate --input=D:\work\payments-api --language=typescript --destination=D:\output\ts-sdk --zip
```

Once it completes, your zipped TypeScript SDK will be at `D:\output\ts-sdk`.

If the CLI reports that an SDK already exists at that destination, let me know and I can re-run with `--force` to overwrite it.
