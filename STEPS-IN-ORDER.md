# Steps in Order — Lab 4 Setup

## The Correct Order (Do It This Way)

1. **Create the Zod schema** → `src/content.config.ts`
   - Define what fields you want (title, description, keywords, etc.)
   - Set up glob loader to find `*.md` files

2. **Create the markdown file** → `src/content/config/config.md`
   - Add YAML frontmatter with all fields from step 1
   - Fill in actual values

3. **Update Layout.astro** → `src/layouts/Layout.astro`
   - Import `getEntry` from `"astro:content"`
   - Fetch config: `const configEntry = await getEntry("config", "config")`
   - Destructure fields: `const { title, description, keywords } = configEntry.data`
   - Add meta tags to `<head>`

4. **Configure PagesCMS** → `.pages.yml` (at repo root)
   - Set media path
   - Add content entry with:
     - `path:` (full file path to your `.md` file)
     - `type: file` (for single file)
     - `fields:` (list of what's editable, names MUST match YAML keys exactly)

5. **Test it works**
   - `npm run dev` → check localhost:3000
   - `npm run build` → should exit 0
   - Open PagesCMS → should load without errors
   - Edit a field in PagesCMS → should save

---

## Your Current Status

✅ Step 1: Done (`content.config.ts` exists)  
✅ Step 2: Done (`config.md` exists with title, description, keywords)  
✅ Step 3: Done (`Layout.astro` fetches & renders)  
✅ Step 4: Done (`.pages.yml` configured)  
✅ Step 5: Done (tested locally & with PagesCMS)

## You're Done! 🎉

Everything is in place. Just commit and push when ready.

```bash
git add .
git commit -m "feat: complete lab 4 implementation"
git push origin lab-4-pages-cms
```
