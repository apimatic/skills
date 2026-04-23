Great news — since you're already authenticated and your `src/` folder is set up, we can move straight to configuration.

The copyright notice you want is a built-in CodeGen setting called `ShortCopyrightNotice`. It tells APIMatic to embed your custom copyright text in the header of every generated SDK file — no manual file editing needed.

---

## Step 1: Update APIMATIC-META.json

Open `./payments-api/src/spec/APIMATIC-META.json` and add `ShortCopyrightNotice` inside `CodeGenSettings`. For example:

```json
{
  "CodeGenSettings": {
    "ShortCopyrightNotice": "Copyright (c) 2026 Your Company Name. All rights reserved."
  }
}
```

Replace the copyright text with whatever you'd like to appear in your files. If `CodeGenSettings` already has other keys, just add `"ShortCopyrightNotice"` alongside them.

Save the file.

---

## Step 2: Generate the SDK

Navigate to your project root (the folder that contains `src/`) and run:

```
apimatic sdk generate --input=./payments-api --language=python
```

That's it — no extra flags needed for the copyright notice. APIMatic picks it up automatically from `APIMATIC-META.json`.

If you'd like the SDK placed somewhere specific, add `--destination=path/to/output`. Otherwise it will be generated at `./payments-api/sdk/python` by default.

---

## Step 3: Verify the Output

Once generation completes, open any `.py` file in the generated SDK. You should see your copyright text in the file header.

If the CLI tells you an SDK already exists at the destination, let me know and I'll help you decide whether to overwrite it.
