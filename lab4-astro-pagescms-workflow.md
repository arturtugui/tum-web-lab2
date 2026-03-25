# Lab 4 — Astro + PagesCMS Reference Guide

## Your Actual Implementation: Markdown + Content Collections

> **Stack:** Astro 6 (SSG) + PagesCMS (Git-based CMS) + Tailwind CSS v4  
> **Business:** Mobila Orhei — Premium Furniture & Kitchen Store  
> **Deployment:** GitHub Pages → [mobila-orhei.tech](https://www.mobila-orhei.tech)  
> **Architecture:** Markdown files + Astro Content Collections + Zod schema

---

## ✅ Quick Completion Checklist

Use this to verify every step is done. Check off each item:

### Phase 1: Content Collections Setup

- [x] `src/content.config.ts` created with glob loader pattern
- [x] Schema defined with Zod: `title`, `description`, `keywords`
- [x] Glob loader finds `*.md` files in `./src/content/config`
- [x] `src/content/config/config.md` created with YAML frontmatter
- [x] All metadata fields populated in frontmatter

### Phase 2: Layout Integration

- [x] `Layout.astro` imports `getEntry` from `"astro:content"`
- [x] Fetches config: `const configEntry = await getEntry("config", "config")`
- [x] Guard clause: `if (!configEntry) throw new Error(...)`
- [x] Destructures fields: `const { title, description, keywords } = configEntry.data`
- [x] Meta tags added: `<meta name="description" content={description} />`
- [x] Meta tags added: `<meta name="keywords" content={keywords} />`
- [x] Title tag: `<title>{title}</title>`

### Phase 3: PagesCMS Configuration

- [x] `.pages.yml` exists at repo root
- [x] Media path configured: `media: astro-project/public/images`
- [x] Config entry type is `file` with **full file path**
- [x] Path is: `astro-project/src/content/config/config.md` (not just folder)
- [x] Field names match YAML keys exactly: `title`, `description`, `keywords`
- [x] Tested manually: PagesCMS loads without errors

### Phase 4: Deployment & Testing

- [x] `.github/workflows/deploy.yml` targets `lab-4-pages-cms` branch
- [x] GitHub Pages environment protection configured
- [x] `npm run build` exits with code 0
- [x] `npm run dev` works at localhost:3000
- [x] `npm run preview` shows production build locally

### Phase 5: Git & Live Testing

- [x] All changes committed to `lab-4-pages-cms` branch
- [x] PagesCMS GitHub App installed and authorized
- [x] PagesCMS edits auto-commit to GitHub
- [x] GitHub Actions auto-rebuilds on commits
- [x] Live site reflects changes within 1-2 minutes

---

## How It Works: The Complete Architecture

### The Data Flow (End-to-End)

```
1. Developer/Editor opens PagesCMS (app.pagescms.org)
                    ↓
2. PagesCMS reads .pages.yml configuration
   (finds: config.md location, field definitions, media path)
                    ↓
3. PagesCMS fetches & displays config.md YAML frontmatter in editing form
                    ↓
4. Editor updates a field (e.g., title or description)
   Clicks "Save"
                    ↓
5. PagesCMS writes updated YAML to config.md
   Auto-commits to lab-4-pages-cms branch
                    ↓
6. GitHub detects commit → triggers deploy.yml workflow
                    ↓
7. astro build runs:
   - glob loader finds config.md
   - Zod validates YAML frontmatter
   - Caches validated content
                    ↓
8. Layout.astro runs at build time:
   - getEntry("config", "config") fetches data
   - Destructures title, description, keywords
   - Renders <title> and <meta> tags
                    ↓
9. dist/ uploaded to GitHub Pages
                    ↓
10. mobila-orhei.tech displays updated content ✓
    (within 1-2 minutes of save)
```

### Why This Architecture Works

| Component             | Technology                        | Benefit                                              |
| --------------------- | --------------------------------- | ---------------------------------------------------- |
| **Content Storage**   | Markdown in `src/content/config/` | PagesCMS native format, Git-tracked, version history |
| **Schema Validation** | Zod in `src/content.config.ts`    | TypeScript type safety, catches errors at build time |
| **Data Fetching**     | `getEntry()` in Layout.astro      | Server-side, no hydration, fastest load times        |
| **CMS Configuration** | `.pages.yml` at repo root         | Single source of truth for CMS + fields              |
| **Deployment**        | GitHub Pages + Actions            | Free, auto-deploy on commit, no database             |
| **Language**          | Markdown YAML frontmatter         | Human-readable, easy to edit manually or via CMS     |

### The Three Core Concepts

**1. Astro Content Collections Configuration**

```typescript
// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const config = defineCollection({
  loader: glob({
    pattern: "*.md", // Find all .md files
    base: "./src/content/config", // In this folder
  }),
  schema: z.object({
    // Validate YAML frontmatter
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
  }),
});

export const collections = { config };
```

**2. Markdown Content with YAML Frontmatter**

```markdown
---
title: Magazin de mobila Moldova
description: Magazin de mobilă și bucătării în Orhei, Moldova. Ofertă largă...
keywords: mobilă orhei, bucătării orhei, mobilier moldova, mobilă pentru casă
---
```

**3. PagesCMS Configuration**

```yaml
# .pages.yml
media: astro-project/public/images

content:
  - name: config
    label: Setari generale
    path: astro-project/src/content/config/config.md # FULL FILE PATH
    type: file
    fields:
      - name: title
        label: Titlu Tab Browser
        type: string
      - name: description
        label: Descriere (SEO)
        type: string
      - name: keywords
        label: Cuvinte-cheie (SEO)
        type: string
```

---

## File Locations & Naming

### Critical Rule: Field Names Must Match Exactly

The field `name` in `.pages.yml` MUST match the YAML key in `config.md`:

| In `.pages.yml`       | In `config.md`     | Match?                    |
| --------------------- | ------------------ | ------------------------- |
| `- name: title`       | `title: ...`       | ✅ YES                    |
| `- name: description` | `description: ...` | ✅ YES                    |
| `- name: keywords`    | `keywords: ...`    | ✅ YES                    |
| `- name: hero_title`  | `heading: ...`     | ❌ NO — will cause issues |

If names don't match, PagesCMS won't recognize the field and won't save changes.

### Current File Structure

```
tum-web-lab2/                                    ← repo root
├── .pages.yml                                   ← PagesCMS config
├── .github/
│   └── workflows/
│       └── deploy.yml                           ← GitHub Pages auto-deploy
├── astro-project/
│   ├── src/
│   │   ├── content/
│   │   │   └── config/
│   │   │       └── config.md                    ← YAML FRONTMATTER (editable via CMS)
│   │   ├── content.config.ts                    ← Zod schema + glob loader
│   │   ├── layouts/
│   │   │   └── Layout.astro                     ← Fetches & renders data
│   │   ├── pages/
│   │   │   └── index.astro
│   │   ├── components/
│   │   │   ├── Header.astro
│   │   │   ├── Hero.astro
│   │   │   ├── Services.astro
│   │   │   ├── Kitchens.astro
│   │   │   ├── Furniture.astro
│   │   │   ├── Mascot.astro
│   │   │   └── Footer.astro
│   │   └── styles/
│   │       └── global.css                       ← Tailwind v4
│   ├── public/
│   │   ├── images/
│   │   │   ├── bed/
│   │   │   ├── bucatarii/
│   │   │   ├── mascot-frames/
│   │   │   └── uploads/                         ← PagesCMS uploads here
│   │   └── CNAME                                ← mobila-orhei.tech
│   ├── package.json
│   ├── tsconfig.json
│   └── astro.config.mjs
└── README.md
```

---

## Implementation Details

### Content Collections Configuration

**File:** `src/content.config.ts`

```typescript
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const config = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/config" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
  }),
});

export const collections = {
  config,
};
```

**How it works:**

- `glob` loader searches for `*.md` files in `src/content/config/`
- Each `.md` file is validated against the Zod schema
- Only valid files are accessible via `getEntry()`
- If YAML frontmatter is missing fields, build fails with clear error

### Layout Component

**File:** `src/layouts/Layout.astro`

```astro
---
import "../styles/global.css";
import { getEntry } from "astro:content";

// Fetch config at build time (runs once, server-side)
const configEntry = await getEntry("config", "config");
if (!configEntry) throw new Error("config not found");

// Destructure all fields
const { title, description, keywords } = configEntry.data;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <title>{title}</title>
    <!-- ... rest of head ... -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Why this approach:**

- `getEntry()` runs at build time, not browser render
- No JavaScript hydration needed
- Fast, secure, SEO-friendly
- Every HTML file contains final values

### Markdown Content File

**File:** `src/content/config/config.md`

```markdown
---
title: Magazin de mobila Moldova
description: Magazin de mobilă și bucătării în Orhei, Moldova. Ofertă largă de mobilier de calitate cu livrare și montaj.
keywords: mobilă orhei, mobila orhei mobilier orhei, bucătării orhei, bucatarii orhei, mobilă moldova, mobilier moldova, bucătării moldova, mobilier de calitate, mobilă pentru casă
---
```

**Editing:**

- PagesCMS shows a form with three fields
- Saves directly to YAML frontmatter
- Triggers auto-commit to GitHub
- GitHub Actions rebuilds site

### PagesCMS Configuration

**File:** `.pages.yml` (at repo root)

```yaml
# PagesCMS Configuration for Mobila Orhei
media: astro-project/public/images

content:
  - name: config
    label: Setari generale
    path: astro-project/src/content/config/config.md # FULL file path, not folder!
    type: file
    fields:
      - name: title
        label: Titlu Tab Browser
        type: string
      - name: description
        label: Descriere (pentru meta tags)
        type: string
      - name: keywords
        label: Cuvinte-cheie (descriptoare SEO)
        type: string
```

**Important Notes:**

- `path` must be **full file path**, not just folder
- If you use `path: astro-project/src/content/config`, PagesCMS errors: "Expected a file but found a directory"
- `type: file` = single file (home page settings)
- `type: collection` = multiple files (kitchen projects, blog posts, etc.)

---

## Testing & Verification

### Local Testing

**Start dev server:**

```bash
cd astro-project
npm run dev
```

- Opens at `http://localhost:3000`
- Watch mode recompiles on file changes
- edit `config.md` manually → refresh browser → see changes

**Build for production:**

```bash
npm run build
npm run preview
```

- `build` creates optimized `dist/` folder
- `preview` serves production build locally
- Check that all content renders correctly

### PagesCMS Testing

1. **Open PagesCMS:** [app.pagescms.org](https://app.pagescms.org)
2. **Sign in** with GitHub
3. **Open project:** Search and select `tum-web-lab2`
4. **Click "Setari generale"** in sidebar
5. **Edit any field** (e.g., change title slightly)
6. **Click Save**
7. **Wait 1-2 minutes** for GitHub Actions to rebuild
8. **Refresh live site** → see updated content

### Common Issues

| Issue                                                | Cause                                           | Solution                                                                  |
| ---------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| PagesCMS shows "Expected a file but found directory" | `path` in `.pages.yml` is folder, not file      | Change to full path: `path: astro-project/src/content/config/config.md`   |
| Fields don't show in PagesCMS form                   | Field `name` doesn't match YAML key             | Example: `.pages.yml` has `title` but `.md` has `heading`                 |
| Build fails with "undefined" error                   | Zod schema expects field that's missing         | Add missing field to YAML frontmatter or mark optional with `.optional()` |
| Site doesn't update after CMS edit                   | GitHub Actions still building, or deploy failed | Check `.github/workflows/deploy.yml` or GitHub Actions tab                |
| `npm run build` fails                                | Wrong Node/npm version                          | Run `node -v` — should be ≥22.12.0                                        |

---

## Expanding (Future Phases)

### Adding More Metadata Fields

When you want to add new fields (e.g., author, language, etc.):

**Step 1:** Add to schema in `src/content.config.ts`

```typescript
schema: z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string(),
  author: z.string().optional(),  // ← new field
  language: z.string().optional(),
}),
```

**Step 2:** Add to YAML in `config.md`

```markdown
---
title: Magazin de mobila Moldova
description: ...
keywords: ...
author: Mobila Orhei Team
language: ro
---
```

**Step 3:** Add to `.pages.yml`

```yaml
fields:
  - name: title
    label: Titlu Tab Browser
    type: string
  - name: author # ← new field
    label: Autor
    type: string
```

**Step 4:** Use in Layout.astro

```astro
const { title, description, keywords, author, language } = configEntry.data;
```

### Creating a Kitchen Projects Collection

To add multiple kitchen projects (not just one config):

**Step 1:** Create folder

```bash
mkdir -p src/content/kitchens
```

**Step 2:** Add to schema in `src/content.config.ts`

```typescript
const kitchens = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/kitchens" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    price: z.string(),
    description: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = { config, kitchens };
```

**Step 3:** Create markdown files

```
src/content/kitchens/
  ├── kitchen-modern.md
  ├── kitchen-classic.md
  └── kitchen-rustic.md
```

**Step 4:** Add to `.pages.yml`

```yaml
- name: kitchens
  label: Bucătării
  path: astro-project/src/content/kitchens
  filename: "{fields.slug}.md"
  type: collection
  fields:
    - { name: title, label: "Nume", type: string }
    - { name: slug, label: "Slug", type: string }
    - { name: price, label: "Preț", type: string }
    - { name: description, label: "Descriere", type: text }
    - { name: image, label: "Imagine", type: image }
```

**Step 5:** Fetch in component

```astro
---
import { getCollection } from "astro:content";

const kitchens = await getCollection("kitchens");
---

{kitchens.map(kitchen => (
  <div>
    <h3>{kitchen.data.title}</h3>
    <p>{kitchen.data.description}</p>
  </div>
))}
```

---

## Git Commits for Lab

Keep your commit history clean. Each commit should represent one logical step:

```bash
# Phase 1: Set up Content Collections
git add src/content.config.ts src/content/config/
git commit -m "feat: create astro content collections with config markdown"

# Phase 2: Update Layout
git add src/layouts/Layout.astro
git commit -m "feat: fetch and render config metadata in layout"

# Phase 3: Configure PagesCMS
git add .pages.yml
git commit -m "feat: configure pagescms for markdown content editing"

# Phase 4: Test and verify
git commit --allow-empty -m "test: verify local build and pagescms integration"

git push origin lab-4-pages-cms
```

---

## References

- **Astro Docs:** [astro.build/docs](https://docs.astro.build/)
- **Content Collections:** [astro.build/docs/guides/content-collections](https://docs.astro.build/en/guides/content-collections/)
- **Glob Loader:** [astro.build/docs/guides/content-collections/#creating-a-collection-with-glob-loaders](https://docs.astro.build/en/guides/content-collections/#creating-a-collection-with-glob-loaders)
- **PagesCMS:** [pagescms.org](https://pagescms.org)
- **PagesCMS Docs:** [pagescms.org/docs](https://pagescms.org/docs)
- **GitHub Actions:** [docs.github.com/actions](https://docs.github.com/en/actions)
- **GitHub Pages:** [pages.github.com](https://pages.github.com)

---

## Summary

You now have a **production-ready workflow:**

✅ **Local editing:** `config.md` with `npm run dev`  
✅ **CMS editing:** PagesCMS with auto-commits  
✅ **Auto-deployment:** GitHub Pages rebuilds on commit  
✅ **Type safety:** Zod validates schema at build time  
✅ **SEO:** Meta tags rendered at build time  
✅ **Version control:** All changes in Git history  
✅ **No database:** Just Git + Markdown files

Everything is in place. Check the checklist above to verify each step is complete, then you're ready to present your lab!
