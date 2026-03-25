# Lab 4 — Astro + PagesCMS (JSON Approach)

> **Stack:** Astro 6 + PagesCMS + Tailwind CSS v4  
> **Architecture:** JSON files + Direct import (no Content Collections)  
> **Deployment:** GitHub Pages → mobila-orhei.tech

---

## Quick Checklist

- [x] `src/data/config.json` created with metadata
- [x] `Layout.astro` imports config: `import config from "../data/config.json"`
- [x] Meta tags render title, description, keywords
- [x] `.pages.yml` points to JSON file at `astro-project/src/data/config.json`
- [x] `npm run build` exits 0
- [x] GitHub Pages deployment works

---

## How It Works: JSON + PagesCMS

### The Flow

```
PagesCMS UI (app.pagescms.org)
        ↓ edit field
        ↓ click Save
PagesCMS commits to GitHub
        ↓
GitHub Actions runs astro build
        ↓
Layout.astro imports config.json
        ↓
Renders HTML with title, description, keywords
        ↓
GitHub Pages deploys
        ↓
mobila-orhei.tech updated ✓
```

### Why JSON?

✅ Simple — just a file, no schema or validation  
✅ PagesCMS native — reads/edits directly  
✅ Direct import — `import config from "../data/config.json"`  
✅ No build overhead — faster than Content Collections

---

## Adding New Content to CMS

### Step 1: Create JSON File

Create `src/data/yourdata.json`:

```json
{
  "title": "Kitchen Modern",
  "description": "Modern kitchen design",
  "price": "5000 MDL",
  "image": "/images/kitchen-modern.jpg"
}
```

### Step 2: Add to `.pages.yml`

Add entry at repo root:

```yaml
media: astro-project/public/images

content:
  # ── Config (Single File) ──
  - name: config
    label: Setari generale
    path: astro-project/src/data/config.json
    type: file
    fields:
      - { name: title, label: "Titlu", type: string }
      - { name: description, label: "Descriere", type: string }
      - { name: keywords, label: "Cuvinte-cheie", type: string }

  # ── Kitchen Projects (Collection) ──
  - name: kitchens
    label: Bucatarii
    path: astro-project/src/data/kitchens
    filename: "{fields.slug}.json"
    type: collection
    fields:
      - { name: title, label: "Titlu", type: string }
      - { name: slug, label: "Slug", type: string }
      - { name: description, label: "Descriere", type: text }
      - { name: price, label: "Pret", type: string }
      - { name: image, label: "Imagine", type: image }
```

**Key Rules:**

- `type: file` = single file (config, settings)
- `type: collection` = multiple files (projects, blog posts)
- Field `name` must match JSON key exactly
- `filename:` pattern uses field values to name files

### Step 3: Use in Astro

```astro
---
// src/pages/kitchens.astro
import Layout from '../layouts/Layout.astro';
import fs from 'fs';
import path from 'path';

// Read all kitchen JSON files
const kitchensDir = path.join(process.cwd(), 'src/data/kitchens');
const files = fs.readdirSync(kitchensDir).filter(f => f.endsWith('.json'));

const kitchens = files.map(file => {
  const data = JSON.parse(
    fs.readFileSync(path.join(kitchensDir, file), 'utf-8')
  );
  return { slug: file.replace('.json', ''), ...data };
});
---

<Layout title="Bucatarii">
  {kitchens.map(kitchen => (
    <div>
      <h2>{kitchen.title}</h2>
      <p>{kitchen.description}</p>
      <span>{kitchen.price} MDL</span>
      <img src={kitchen.image} alt={kitchen.title} />
    </div>
  ))}
</Layout>
```

---

## Collections: Multiple Files Pattern

### Setup

```
src/data/
  ├── config.json          ← Single file
  ├── kitchens/           ← Folder with multiple files
  │   ├── kitchen-modern.json
  │   ├── kitchen-classic.json
  │   └── kitchen-rustic.json
  ├── services/           ← Another collection
  │   ├── delivery.json
  │   ├── installation.json
  │   └── warranty.json
  └── furniture/
      ├── beds.json
      └── tables.json
```

### `.pages.yml` for Collections

```yaml
- name: kitchens
  label: Bucatarii
  path: astro-project/src/data/kitchens # Folder, not file!
  filename: "{fields.slug}.json" # Uses slug field for filename
  type: collection # Not "file"
  fields:
    - { name: title, label: "Titlu", type: string }
    - { name: slug, label: "Slug (URL)", type: string }
    - { name: description, label: "Descriere", type: text }
    - { name: price, label: "Pret", type: string }
    - { name: image, label: "Imagine", type: image }
```

When you create new item in PagesCMS:

- PagesCMS auto-generates filename from slug: `kitchen-modern.json`
- Saves to `astro-project/src/data/kitchens/kitchen-modern.json`
- Updates `.pages.yml` list automatically

### Reading Collections in Astro

**Method 1: Read all files at build time**

```astro
---
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src/data/kitchens');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const items = files.map(file => {
  const content = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), 'utf-8')
  );
  return { slug: file.replace('.json', ''), ...content };
});
---

{items.map(item => <div>{item.title}</div>)}
```

**Method 2: Import individual files**

```astro
---
import kitchenModern from '../data/kitchens/kitchen-modern.json';
import kitchenClassic from '../data/kitchens/kitchen-classic.json';

const kitchens = [kitchenModern, kitchenClassic];
---

{kitchens.map(k => <div>{k.title}</div>)}
```

---

## Image Handling

### Upload in PagesCMS

1. Add `type: image` field in `.pages.yml`:

```yaml
- { name: image, label: "Imagine", type: image }
```

2. PagesCMS UI shows file picker
3. Uploads to: `astro-project/public/images/uploads/my-image.jpg`
4. Saves path to JSON: `"image": "/images/uploads/my-image.jpg"`

### Display in Astro

```astro
---
import kitchen from '../data/kitchens/kitchen-modern.json';
---

<img src={kitchen.image} alt={kitchen.title} />
```

### Organize Images

```
public/images/
├── uploads/              ← PagesCMS auto-uploads here
│   ├── kitchen-1.jpg
│   └── sofa-2.jpg
├── kitchens/            ← Manual images (git-tracked)
│   ├── modern.jpg
│   └── classic.jpg
├── furniture/
│   ├── beds.jpg
│   └── tables.jpg
└── hero.jpg
```

**In `.pages.yml`, point uploads to correct folder:**

```yaml
media: astro-project/public/images/uploads # Where PagesCMS uploads
```

---

## Field Types Reference

| Type        | Use For     | Example              |
| ----------- | ----------- | -------------------- |
| `string`    | Short text  | Title, slug, price   |
| `text`      | Long text   | Description, bio     |
| `rich-text` | HTML editor | Detailed description |
| `image`     | File upload | Product photo        |
| `number`    | Numeric     | Price, quantity      |
| `date`      | Date picker | Launch date          |
| `boolean`   | Yes/no      | Featured, active     |
| `select`    | Dropdown    | Status, season       |
| `list`      | Array       | Tags, features       |

---

## Workflow: Add New Kitchen Project

### In PagesCMS:

1. Go to **Bucatarii** section
2. Click **+ New**
3. Fill form:
   - Title: "Kitchen Modern Pro"
   - Slug: "kitchen-modern-pro"
   - Description: "Modern kitchen with premium fixtures"
   - Price: "7500 MDL"
   - Upload image
4. Click **Save**

### What happens:

- PagesCMS creates `kitchen-modern-pro.json`
- Commits to GitHub
- GitHub Actions runs `astro build`
- Astro reads all kitchen files
- Renders new kitchen on live site

### Git history:

```bash
$ git log --oneline
a1f2c3d Create kitchen-modern-pro.json (from PagesCMS)
b2e3d4f Update kitchens/kitchen-modern-pro.json
c3f4e5f ...
```

---

## Testing Locally

### Build & test:

```bash
cd astro-project
npm run build      # Should exit 0
npm run preview    # Serve dist/ locally
```

### Edit JSON manually:

```bash
# Change config.json
# Restart npm run dev
# Refresh browser → see changes
```

### Test in PagesCMS:

1. [app.pagescms.org](https://app.pagescms.org)
2. Sign in → Choose repo
3. Edit a field
4. Click Save
5. Wait 1-2 min for GitHub Actions
6. Refresh live site

---

## Common Patterns

### Pattern 1: Single Config File

```
src/data/config.json
{
  "title": "Site Title",
  "description": "...",
  "keywords": "..."
}
```

Usage in Astro:

```astro
import config from '../data/config.json';
<title>{config.title}</title>
```

---

### Pattern 2: Products Collection

```
src/data/products/
├── sofa-modern.json
├── table-oak.json
└── chair-leather.json
```

Each file:

```json
{
  "title": "Sofa Modern",
  "slug": "sofa-modern",
  "price": "3000",
  "image": "/images/uploads/sofa.jpg",
  "inStock": true
}
```

---

### Pattern 3: Nested Data (Services with Features)

```json
{
  "title": "Free Delivery",
  "slug": "delivery",
  "description": "Delivery anywhere in Moldova",
  "features": [
    "Free shipping over 500 MDL",
    "Same-day pickup option",
    "Damaged goods replacement"
  ]
}
```

In `.pages.yml`:

```yaml
- { name: features, label: "Features", type: list }
```

In Astro:

```astro
{service.features.map(f => <li>{f}</li>)}
```

---

## File Structure

```
tum-web-lab2/
├── .pages.yml                         ← CMS configuration
├── .github/workflows/deploy.yml       ← Auto-deploy
├── astro-project/
│   ├── src/
│   │   ├── data/                      ← All JSON files
│   │   │   ├── config.json            ← Metadata
│   │   │   ├── kitchens/              ← Collection
│   │   │   │   ├── modern.json
│   │   │   │   └── classic.json
│   │   │   ├── services/              ← Collection
│   │   │   │   ├── delivery.json
│   │   │   │   ├── installation.json
│   │   │   │   └── warranty.json
│   │   │   └── furniture/             ← Collection
│   │   ├── layouts/Layout.astro       ← Renders config
│   │   ├── pages/
│   │   │   ├── index.astro
│   │   │   ├── kitchens.astro         ← Reads kitchens/
│   │   │   └── services.astro         ← Reads services/
│   │   └── styles/global.css
│   ├── public/images/
│   │   ├── uploads/                   ← PagesCMS uploads
│   │   ├── kitchens/
│   │   └── furniture/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## Git Workflow

### First time setup:

```bash
git add src/data/ .pages.yml
git commit -m "feat: add JSON config and cms setup"
git push origin lab-4-pages-cms
```

### After editing in PagesCMS:

```bash
# PagesCMS auto-commits, so just pull
git pull

# Or from other branch:
git pull origin lab-4-pages-cms
```

### Manual JSON editing:

```bash
# Edit src/data/config.json
git add src/data/config.json
git commit -m "update: change config title"
git push
```

---

## Troubleshooting

| Problem                                              | Cause                                          | Fix                                                           |
| ---------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| "Expected file but found directory" in PagesCMS      | `.pages.yml` has folder path for `type: file`  | Use full file path: `astro-project/src/data/config.json`      |
| Fields don't show in PagesCMS                        | JSON keys don't match `.pages.yml` field names | Ensure exact match: `"title": ...` and `name: title`          |
| Build fails with "ENOENT: no such file or directory" | JSON file doesn't exist yet                    | Create file or use `try/catch` in Astro                       |
| Images don't load                                    | Path in JSON is wrong                          | Check: should be `/images/uploads/file.jpg` (starts with `/`) |
| PagesCMS not detecting changes                       | Outdated `.pages.yml` cache                    | Refresh page or clear browser cache                           |

---

## Summary

**Your setup:**

- JSON files in `src/data/` (one file or collection folders)
- `.pages.yml` tells PagesCMS where files are
- Astro imports JSON directly: `import data from '../data/file.json'`
- PagesCMS auto-commits changes
- GitHub Pages auto-rebuilds

**To add new content:**

1. Either manually create `src/data/newfile.json`
2. Or use PagesCMS UI for collections (auto-creates files)
3. Add field definitions in `.pages.yml`
4. Reference in Astro components

**No Content Collections, no Zod schema, no complexity.** Just JSON + PagesCMS + Astro. Ship it! 🚀
