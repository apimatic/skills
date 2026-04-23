Great — since you're already authenticated, let me verify that and then kick off your Ruby SDK generation.

**Step 1: Verify authentication**

Run this to confirm your session is active:

```
apimatic auth status
```

If it shows your account email, you're good to go. If not, let me know and we'll re-authenticate.

---

**Step 2: Generate the Ruby SDK**

Navigate to your project directory and run the generate command:

```
cd ~/ruby-project
apimatic sdk generate --language=ruby
```

Since you want the default output location and no zip, no extra flags are needed. The SDK will be generated at `~/ruby-project/sdk/ruby/`.

---

Once generation completes, your Ruby SDK will be ready in that folder. Let me know if you run into any issues or if the CLI reports that an SDK already exists at the destination — I can help you decide whether to overwrite it.
