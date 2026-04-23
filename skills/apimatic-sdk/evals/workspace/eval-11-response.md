Great — since you're authenticated and starting from scratch, let's get your project set up and generate your first SDK.

## Step 1: Set up your project directory

First, I need to know where you'd like the project to live. Where would you like me to set up the project directory? (Give a path, or I'll use the current directory.)

Once you tell me the project path, I'll scaffold the project structure for you:

1. Create the `src/spec/` folder inside your project directory
2. Copy your API spec from `~/specs/payments.yaml` into `src/spec/`
3. Create a starter `APIMATIC-META.json` configuration file in `src/spec/`

The commands I'll run (using your chosen project path, e.g. `~/payments-sdk-project`):

```bash
mkdir -p ~/payments-sdk-project/src/spec
cp ~/specs/payments.yaml ~/payments-sdk-project/src/spec/
```

After setup, your project will look like this:

```
payments-sdk-project/
└── src/
    └── spec/
        ├── payments.yaml
        └── APIMATIC-META.json
```

## Step 2: Choose your language

Which language would you like the SDK generated in?

| Option | Language |
|---|---|
| `csharp` | C# |
| `java` | Java |
| `php` | PHP |
| `python` | Python |
| `ruby` | Ruby |
| `typescript` | TypeScript |
| `go` | Go |

## Step 3: Customization

Since you mentioned you want to customize the SDK, I'll enable change tracking during generation with `--track-changes`. This lets you make edits to the generated SDK and save those customizations so they're automatically reapplied on every future regeneration.

Would you like me to apply the customizations for you, or will you handle them yourself after generation?

Once you answer (project path and language), I'll scaffold the project and run the generate command — for example:

```bash
cd ~/payments-sdk-project
apimatic sdk generate --language=typescript --track-changes
```

Then prompt: "Make your customizations now, then let me know when you're ready to save them." Once you confirm, I'll run `apimatic sdk save-changes`.
