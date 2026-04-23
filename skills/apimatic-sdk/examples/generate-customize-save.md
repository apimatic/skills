# Generate, Customize, and Save SDK Changes

This example shows how to generate an SDK with change tracking, customize a generated file, save those customizations, and regenerate with them automatically reapplied.

**Flow:** generate (tracking auto-enabled) → customize → save-changes → regenerate

---

## Step 1: Generate the SDK

Run from the directory that contains `src/`:

```
apimatic sdk generate --language=typescript
```

Change tracking is enabled automatically. The `sdk-source-tree` is saved at `src/sdk-source-tree/.typescript` and will be used to reapply your customizations on every future generation.

---

## Step 2: Customize the generated SDK

Edit any generated file. In this example, `sdk/typescript/README.md` is updated:

```diff
- This is a sample Pet Store Server based on the OpenAPI 3.0 specification. You can find out more about Swagger at https://swagger.io. In the third iteration of the pet store, we've switched to the design first approach!

+ This is a sample Pet Store Server built on the OpenAPI 3.0 specification. It demonstrates a fully functional REST API for managing pets, orders, and users. For more information about the OpenAPI standard and tooling, visit https://swagger.io.
```

---

## Step 3: Save the changes

```
apimatic sdk save-changes --language=typescript
```

The CLI detects which files were modified and saves a diff to `src/sdk-source-tree/.typescript`. These changes will reapply automatically on every future generation.

---

## Step 4: Regenerate

```
apimatic sdk generate --language=typescript
```

The CLI overwrites the existing SDK and reapplies your saved customizations automatically. No manual re-editing needed.
