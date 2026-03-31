To add custom components to your portal overview page, open the relevant Markdown file in `src/content/` (for example, `src/content/overview.md`) and add the following `CardGroup` with two `Card` links:

```
<CardGroup cols={2}>
  <Card title="Getting Started" icon="Zap" url="page:guides/getting-started">
    Follow the step-by-step guide to set up and make your first API call.
  </Card>
  <Card title="Authentication" icon="Key" url="page:guides/authentication">
    Learn how to authenticate your requests to the API.
  </Card>
</CardGroup>
```

A few things to keep in mind:

- The `url` values use the `page:` prefix (e.g., `url="page:guides/getting-started"`). This is required for all internal portal links inside `<Card>` components — always use the `page:` prefix for portal-internal links.
- The `page:` path is relative to the `src/content/` directory and does not include the `.md` file extension.
- Adjust the paths to match the actual filenames in your `src/content/guides/` directory. For example, if your Getting Started file is `src/content/guides/quickstart.md`, use `url="page:guides/quickstart"`.
- Component opening tags must be on a single line — do not break tag attributes across multiple lines.
- The `icon` values (`Zap`, `Key`) are optional. You can remove them or replace them with any supported icon name.

After saving the file, if your portal server is running it will regenerate automatically and you will see the card grid on your overview page.
