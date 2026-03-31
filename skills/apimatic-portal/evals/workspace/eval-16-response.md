To hide the Table of Contents on a single custom content page, add `pageMode: custom` frontmatter at the top of that specific markdown file.

Open the `.md` file in `src/content/` that you want to change, and add these lines at the very top:

```markdown
---
pageMode: custom
---

# Your Page Title

Rest of your page content here...
```

For example, if your page is at `src/content/guides/my-page.md`, it would look like:

```markdown
---
pageMode: custom
---

# My Page

This page has no Table of Contents sidebar.
```

That is all you need to do. No changes to `toc.yml` or anywhere in the portal are required — the frontmatter applies only to that one page.

After saving the file, the portal will regenerate. Once complete, open the page in your browser and the right-hand Table of Contents panel will no longer appear for that page.
