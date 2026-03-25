# Lab 4 — Static Site Generator & Git CMS

## Migrating Mobila Orhei to Astro + PagesCMS

> **Stack:** Astro (SSG) + PagesCMS (Git-based CMS) + Tailwind CSS v4  
> **Business:** Mobila Orhei — Premium Furniture & Kitchen Store  
> **Deployment:** GitHub Pages → [mobila-orhei.tech](https://www.mobila-orhei.tech)

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1 — Prepare Your Astro Project](#phase-1--prepare-your-astro-project)
4. [Phase 2 — Configure PagesCMS](#phase-2--configure-pagescms)
5. [Phase 3 — Make Content CMS-Editable](#phase-3--make-content-cms-editable)
6. [Phase 4 — Deploy to GitHub Pages](#phase-4--deploy-to-github-pages)
7. [Phase 5 — Connect PagesCMS to Your Repo](#phase-5--connect-pagescms-to-your-repo)
8. [Phase 6 — Verify & Test](#phase-6--verify--test)
9. [Git History Checklist](#git-history-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is PagesCMS?

PagesCMS is a **free, open-source, Git-based CMS** that lets your team (or clients) edit product descriptions, pricing, services, and testimonials without touching code. All content lives in JSON files in your GitHub repo. No database. No monthly fees. When someone edits a product in PagesCMS, it commits directly to GitHub, and your Astro site rebuilds automatically.

### How the pieces fit together (for a furniture store)

```
Marketing team updates product
or service description
        │
        ▼
  PagesCMS UI (app.pagescms.org)
        │  commits updated product details to GitHub
        ▼
  GitHub Repository
        │  triggers GitHub Actions
        ▼
  GitHub Pages (runs `astro build`)
        │
        ▼
  mobila-orhei.tech displays new content ✓
```

**Benefit:** Your team doesn't wait for a developer to update pricing, add new furniture collections, or edit the kitchens page.

---

## How It Works: The PagesCMS + Astro Bridge

### Approach: JSON Files (Simple & Recommended for You)

The guide uses **JSON files with direct import** — the simplest way to connect PagesCMS to Astro.

> **Note:** Gemini recommended Astro **Content Collections** with TypeScript schemas (Zod). That's also valid but requires more setup code. We chose the simpler JSON approach your colleague used with Eleventy.

**Why JSON files are simpler:**

- No `src/content/config.ts` schema file needed
- No `defineCollection()` or Zod validation
- Just import and use: `import home from '../data/home.json'`
- PagesCMS doesn't care how you use the data — it just edits the JSON file

**Trade-off:**

- Content Collections (Gemini's approach) = Type-safe, catches errors before build
- JSON files (your approach) = Simple, flexible, faster to set up

Both work. We're using JSON files because they're closer to what your colleague did and require less boilerplate.

### The Three Core Concepts

**1. Metadata (`.pages.yml`)**
This YAML file in your repo root tells PagesCMS:

- Where your data files live (`src/data/home.json`)
- What fields are editable (`hero_heading`, `services`, etc.)
- Where media uploads go (`public/images/uploads/`)

PagesCMS reads `.pages.yml` once and uses it to build the editing UI.

**2. Data Files (JSON)**
These are plain JSON files in `src/data/` that store all your content:

```json
{
  "title": "Mobila Orhei",
  "hero_heading": "Mobilă Premium",
  "services": [...]
}
```

PagesCMS **edits these files directly** and commits to GitHub. No database. No API.

**3. Astro Components**
Your `.astro` components **import the JSON** and display it:

```astro
import home from '../data/home.json';
<h1>{home.hero_heading}</h1>
```

### The Workflow Order (Step-by-Step)

This is critical — do it in this order:

| Step | What                                                  | Why                              |
| ---- | ----------------------------------------------------- | -------------------------------- |
| 1️⃣   | Create **JSON data files** (`src/data/home.json`)     | Establishes the data structure   |
| 2️⃣   | Create/update **`.pages.yml`** to match those files   | Tells the CMS what fields exist  |
| 3️⃣   | Update **Astro components** to accept props from JSON | Displays the data in HTML        |
| 4️⃣   | Update **`index.astro`** to import and pass data      | Wires everything together        |
| 5️⃣   | Commit everything to GitHub                           | Prepares for PagesCMS connection |
| 6️⃣   | Connect PagesCMS GitHub App to repo                   | CMS can now edit the JSON files  |

> ⚠️ **Don't do this backwards** — if you configure `.pages.yml` for fields that don't exist in `home.json`, PagesCMS will fail to load.

### Media Handling (Images & Uploads)

PagesCMS manages image uploads automatically. Here's how:

**In `.pages.yml`, you define the media folder:**

```yaml
media:
  input: astro-project/public/images/uploads # where files are stored
  output: /images/uploads # URL path for HTML
```

**When someone uploads an image in the CMS:**

1. PagesCMS saves it to `astro-project/public/images/uploads/photo.jpg`
2. PagesCMS writes the **path** to your JSON file: `"image": "/images/uploads/photo.jpg"`
3. Your Astro component displays it: `<img src={home.hero_image} />`

**Important:** The `input` and `output` paths must match:

- `input`: The actual file system path (relative to repo root)
- `output`: The URL path that Astro serves (starts with `/`)

### Components & Astro Props

Your Astro components need to accept data as **props**. This is the "link" between the JSON and the HTML.

**Example: Hero.astro**

```astro
---
interface Props {
  heading: string;
  subheading: string;
}

const { heading, subheading } = Astro.props;
---

<h1>{heading}</h1>
<p>{subheading}</p>
```

Then in `index.astro`, you **pass the data**:

```astro
import home from '../data/home.json';
<Hero heading={home.hero_heading} subheading={home.hero_subheading} />
```

---

| Tool           | Version    | Check                    |
| -------------- | ---------- | ------------------------ |
| Node.js        | ≥ 22.12.0  | `node -v`                |
| npm            | ≥ 10.x     | `npm -v`                 |
| Git            | any modern | `git --version`          |
| GitHub account | —          | push access to your repo |

---

## Phase 1 — Prepare Your Astro Project

### 1.1 Confirm your Astro project structure

Your Astro project lives inside `astro-project/` folder. The structure is already set up:

```
tum-web-lab2/                         ← repo root
├── .github/
│   └── workflows/
│       └── deploy.yml
├── astro-project/                     ← Astro lives here
│   ├── public/
│   │   ├── images/
│   │   │   ├── bed/
│   │   │   ├── bucatarii/            ← kitchen images
│   │   │   ├── mascot-frames/
│   │   │   └── uploads/              ← CMS will upload images here
│   │   └── CNAME                      ← custom domain config
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.astro
│   │   │   ├── Hero.astro
│   │   │   ├── Services.astro        ← delivery, warranty, custom furniture
│   │   │   ├── Kitchens.astro        ← kitchen designs & prices
│   │   │   ├── Furniture.astro       ← beds, tables, cabinets, etc.
│   │   │   ├── Mascot.astro
│   │   │   └── Footer.astro
│   │   ├── content/
│   │   │   └── pages/                ← content files go here
│   │   ├── layouts/
│   │   │   └── Layout.astro
│   │   ├── pages/
│   │   │   └── index.astro
│   │   └── styles/
│   │       ├── global.css            ← Tailwind v4
│   │       ├── reset.css
│   │       ├── kitchens.css
│   │       └── mascot.css
│   ├── astro.config.mjs
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

### 1.2 Confirm Tailwind v4 is working

You're already using **Tailwind CSS v4** (no separate config file). Tailwind directives are in `src/styles/global.css`.

```bash
cd astro-project
npm run dev
```

Verify the site loads at `http://localhost:3000` with proper styling.

### 1.3 Create the data directory

```bash
cd astro-project
mkdir -p src/data
mkdir -p public/images/uploads   # where PagesCMS uploads images
```

### 1.4 Create the home data file **FIRST** (this is critical)

**Most important rule:** Create the JSON file BEFORE configuring `.pages.yml`.

PagesCMS generates the editing UI based on what it finds in the data file. If the file doesn't exist, the CMS won't know what to edit.

**`src/data/home.json`** — This is your "database" (purely data, no code):

```json
{
  "title": "Mobila Orhei — Mobilă de Calitate",
  "description": "Mobilă premium din Moldova. Paturi, bucătării, mese — livrare și instalare incluse.",
  "hero_heading": "Mobilă Premium din Moldova",
  "hero_subheading": "Paturi confortabile, bucătării moderne, și mobilă de design — directamente din fabrica noastră.",
  "hero_cta_label": "Exploreaza Colectia",
  "hero_cta_url": "#furniture",
  "services_heading": "De ce să alegi Mobila Orhei?",
  "services_description": "Facem mobilă care durează.",
  "kitchens_heading": "Bucătării Moderne",
  "kitchens_description": "Proiecte personalizate pentru spațiul tău.",
  "furniture_heading": "Colecția de Mobilă",
  "furniture_description": "Din paturi confortabile la mese de design.",
  "footer_text": "© 2026 Mobila Orhei. Livrare în toată Moldova."
}
```

> Every field becomes editable in the PagesCMS UI — perfect for updating prices, descriptions, or CTAs without a developer.

### 1.5 Update `index.astro` to read from JSON

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Mascot from '../components/Mascot.astro';
import Hero from '../components/Hero.astro';
import Services from '../components/Services.astro';
import Kitchens from '../components/Kitchens.astro';
import Furniture from '../components/Furniture.astro';
import Footer from '../components/Footer.astro';

// Import data from JSON file
import home from '../data/home.json';

const {
  title,
  hero_heading,
  hero_subheading,
  hero_cta_label,
  hero_cta_url,
  services_heading,
  services_description,
  kitchens_heading,
  kitchens_description,
  furniture_heading,
  furniture_description,
  footer_text,
} = home;
---

<Layout title={title}>
  <Header />
  <Mascot />
  <div id="sections" class="font-arial bg-pale-light-gray mt-12.5 flex-1 flex flex-col">
    {/* Hero: Pass content from JSON */}
    <Hero
      heading={hero_heading}
      subheading={hero_subheading}
      ctaLabel={hero_cta_label}
      ctaUrl={hero_cta_url}
    />

    {/* Services: Editable descriptions */}
    <Services
      heading={services_heading}
      description={services_description}
    />

    {/* Kitchens: CMS-driven content */}
    <Kitchens
      heading={kitchens_heading}
      description={kitchens_description}
    />

    {/* Furniture: Product showcase */}
    <Furniture
      heading={furniture_heading}
      description={furniture_description}
    />
  </div>
  <Footer footerText={footer_text} />
</Layout>
```

**Update your components** to accept these props:

Example — `src/components/Hero.astro`:

```astro
---
interface Props {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaUrl: string;
}

const { heading, subheading, ctaLabel, ctaUrl } = Astro.props;
---

<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
  <div class="text-center text-white px-6">
    <h1 class="text-5xl font-bold mb-4">{heading}</h1>
    <p class="text-xl mb-8 text-slate-300">{subheading}</p>
    <a href={ctaUrl} class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition">
      {ctaLabel}
    </a>
  </div>
</section>
```

### 1.6 Update components to accept props

Your components need to accept data as props. Example — `src/components/Hero.astro`:

```astro
---
interface Props {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaUrl: string;
}

const { heading, subheading, ctaLabel, ctaUrl } = Astro.props;
---

<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
  <div class="text-center text-white px-6">
    <h1 class="text-5xl font-bold mb-4">{heading}</h1>
    <p class="text-xl mb-8 text-slate-300">{subheading}</p>
    <a href={ctaUrl} class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition">
      {ctaLabel}
    </a>
  </div>
</section>
```

Do the same for `Services.astro`, `Kitchens.astro`, `Furniture.astro`, and `Footer.astro`.

### 1.7 Test the build locally

```bash
npm run dev
```

Verify:

- Site loads at `http://localhost:3000`
- All content displays (hero, services, kitchens, furniture)
- Content matches what's in `home.json`

Then test production build:

```bash
npm run build
npm run preview
```

### 1.8 Commit this phase

```bash
git add src/data/ src/components/ src/pages/
git commit -m "feat: extract hard-coded content to JSON for CMS integration"
git push
```

---

## Phase 2 — Configure PagesCMS

PagesCMS is configured entirely through **`.pages.yml`** at the repo root (one file, no database).

### 2.1 Understand the `.pages.yml` Structure

Your `.pages.yml` is **already created**. Now we need to update it to match your actual data files.

The file has three critical sections:

**Section A: Media Settings**

```yaml
media: astro-project/public/images/uploads
```

This tells PagesCMS where to save uploaded images.

**Section B: Content Collections** (the files PagesCMS can edit)

```yaml
content:
  - name: home
    label: Pagina Principală
    path: astro-project/src/data
    filename: home.json
    type: file
```

**Section C: Fields** (the editing form in the browser)

```yaml
fields:
  - { name: hero_heading, label: "Hero - Titlu", type: string }
  - { name: hero_image, label: "Hero Image", type: image }
```

### 2.2 Critical Rule: Field Names Must Match Exactly

**The field `name` in `.pages.yml` must match the JSON key exactly:**

✅ **Correct:**

```json
{ "hero_heading": "Mobilă Premium" }
```

```yaml
- { name: hero_heading, label: "Hero - Titlu", type: string }
```

❌ **Wrong:**

```json
{ "heading": "Mobilă Premium" }
```

```yaml
- { name: hero_heading, label: "Hero - Titlu", type: string } # name doesn't match!
```

PagesCMS checks the JSON file against your `.pages.yml`. If names don't match, it won't recognize the fields.

### 2.3 How Image Fields Work

When you add a `type: image` field:

1. **You upload in PagesCMS** → Browser opens file picker
2. **PagesCMS saves the file** → Goes to `astro-project/public/images/uploads/my-photo.jpg`
3. **PagesCMS updates JSON** → `"hero_image": "/images/uploads/my-photo.jpg"`
4. **Your Astro component displays it** → `<img src={home.hero_image} />`

### 2.4 Complete `.pages.yml` Example

Here's the full config for your project:

```yaml
# .pages.yml — PagesCMS Configuration for Mobila Orhei
# Documentation: https://pagescms.org/docs/configuration

media: astro-project/public/images/uploads

content:
  # ── Homepage (Single File) ────────────────────────
  - name: home
    label: Pagina Principală
    path: astro-project/src/data
    filename: home.json
    type: file
    fields:
      - { name: title, label: "Titlu Site", type: string }
      - { name: description, label: "Meta Description (SEO)", type: string }

      # Hero Section
      - { name: hero_heading, label: "Hero - Titlu Principal", type: string }
      - { name: hero_subheading, label: "Hero - Subtitlu", type: string }
      - { name: hero_image, label: "Hero - Imagine de Fundal", type: image }
      - { name: hero_cta_label, label: "Hero - Buton CTA", type: string }
      - { name: hero_cta_url, label: "Hero - Link Buton", type: string }

      # Services Section
      - { name: services_heading, label: "Servicii - Titlu", type: string }
      - {
          name: services_description,
          label: "Servicii - Descriere",
          type: rich-text,
        }

      # Kitchens Section
      - { name: kitchens_heading, label: "Bucătării - Titlu", type: string }
      - {
          name: kitchens_description,
          label: "Bucătării - Descriere",
          type: rich-text,
        }

      # Furniture Section
      - { name: furniture_heading, label: "Mobilă - Titlu", type: string }
      - {
          name: furniture_description,
          label: "Mobilă - Descriere",
          type: rich-text,
        }

      # Footer
      - { name: footer_text, label: "Footer - Text", type: string }

  # ── Kitchen Projects (Collection of many files) ─────
  - name: kitchens
    label: Proiecte Bucătării
    path: astro-project/src/data/products
    filename: "{fields.slug}.json"
    type: collection
    fields:
      - { name: title, label: "Nume Proiect", type: string }
      - { name: slug, label: "URL Slug", type: string }
      - { name: image, label: "Imagine Proiect", type: image }
      - { name: price, label: "Preț (MDL)", type: string }
      - { name: description, label: "Descriere", type: rich-text }

  # ── Services (Collection) ──────────────────────────
  - name: services_items
    label: Servicii
    path: astro-project/src/data/services
    filename: "{fields.slug}.json"
    type: collection
    fields:
      - { name: title, label: "Nume Serviciu", type: string }
      - { name: slug, label: "Slug", type: string }
      - { name: icon, label: "Icon (emoji)", type: string }
      - { name: description, label: "Descriere", type: rich-text }
```

### 2.5 Important: Collection vs File

- **`type: file`** — Single file (e.g., `home.json`). Best for homepage settings.
- **`type: collection`** — Multiple files (e.g., many kitchen projects). PagesCMS auto-creates new files using the `filename` pattern.

Example: If `filename: "{fields.slug}.json"` and you create a kitchen called "kitchen-modern", PagesCMS creates `kitchen-modern.json` in that folder.

### 2.6 Commit the configuration

```bash
git add .pages.yml src/data/
git commit -m "feat: configure PagesCMS with media, collections, and fields"
git push
```

filename: "{fields.slug}.md"
view:
fields: [title, icon]
fields:

- { name: title, label: "Nume Serviciu", type: string }
- { name: slug, label: "Slug", type: string }
- { name: icon, label: "Icon (emoji/image)", type: string }
- { name: description, label: "Descriere", type: rich-text }
- { name: price_info, label: "Info preț/condiții", type: string }

````

> **PagesCMS Field Types:**
> `string` (short text) · `text` (long text) · `rich-text` (HTML editor) · `image` · `date` · `boolean` · `number` · `select` · `list` · `object`

### 2.3 Commit the CMS config

```bash
git add public/admin/config.yml
git commit -m "feat: add PagesCMS configuration for all content sections"
git push
````

---

## Phase 3 — Make Content CMS-Editable

Expand the JSON structure to cover **all** parts of your landing page that should be editable:

### Checklist — What to make editable:

- [x] Hero section (heading, CTA)
- [x] Services descriptions (delivery, installation, warranty, custom work)
- [x] Kitchen projects & pricing
- [x] Furniture catalog descriptions
- [x] Footer contact & links
- [ ] Contact form (email, phone, address)
- [ ] Navigation links (if not hard-coded)
- [ ] Social media links
- [ ] Images (hero background, kitchen photos, testimonials)

### Example: Add services list to home.json

**`src/data/home.json` — Add to the JSON:**

```json
{
  "title": "Mobila Orhei",
  "services": [
    {
      "label": "Livrare Gratuită",
      "icon": "🚚",
      "description": "Livrare în toată Moldova pentru comenzi peste 500 MDL"
    },
    {
      "label": "Instalare Inclusă",
      "icon": "🔨",
      "description": "Oamenii noștri vor instala și aranja totul perfect"
    },
    {
      "label": "Garantie 2 Ani",
      "icon": "✅",
      "description": "Orice defect de fabricație — înlocuim gratuit"
    },
    {
      "label": "Mobilă Personalizată",
      "icon": "🎨",
      "description": "Dimensiuni și culori după preferințele tale"
    }
  ]
}
```

**Update `.pages.yml`** to include services array:

```yaml
- name: home
  label: Pagina Principală
  path: astro-project/src/data
  filename: home.json
  type: file
  fields:
    - { name: title, label: "Titlu Site", type: string }
    - name: services
      label: Servicii (listă)
      type: list
      fields:
        - { name: label, label: "Titlu Serviciu", type: string }
        - { name: icon, label: "Icon (emoji)", type: string }
        - { name: description, label: "Descriere", type: text }
```

**Update `src/components/Services.astro`:**

```astro
---
interface Service {
  label: string;
  icon: string;
  description: string;
}

interface Props {
  services?: Service[];
  heading: string;
  description: string;
}

const { services = [], heading, description } = Astro.props;
---

<section class="py-12 px-6">
  <h2 class="text-3xl font-bold mb-4">{heading}</h2>
  <p class="mb-8 text-slate-600">{description}</p>

  {services.length > 0 && (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {services.map(service => (
        <div class="border rounded-lg p-8">
          <div class="text-4xl mb-4">{service.icon}</div>
          <h3 class="text-xl font-bold mb-2">{service.label}</h3>
          <p>{service.description}</p>
      </div>
    ))}
  </div>
</section>
```

### Commit this phase

```bash
git add .
git commit -m "feat: expand CMS coverage to services, products, and all editable sections"
git push
```

---

## Phase 4 — Deploy to GitHub Pages

Your site is already deployed at **[mobila-orhei.tech](https://www.mobila-orhei.tech)** via GitHub Pages. Just verify the workflow still works:

### 4.1 Check your GitHub Actions workflow

**`.github/workflows/deploy.yml`** should have `working-directory: astro-project`:

```yaml
name: Deploy Astro to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: astro-project # ← critical for subfolder repos
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22 # match your local version
          cache: npm
          cache-dependency-path: astro-project/package-lock.json
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: astro-project/dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 4.2 Verify astro.config.mjs

```js
// astro-project/astro.config.mjs
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.mobila-orhei.tech",
  // No `base` needed — you use a custom domain, not /repo-name/
});
```

### 4.3 The deployment flow with PagesCMS

```
Marketing team edits "Bucătării - Titlu" in PagesCMS
        │
        ▼
  PagesCMS saves → commits to main branch
        │
        ▼
  GitHub detects push → triggers .github/workflows/deploy.yml
        │
        ▼
  `astro build` runs in astro-project/
        │
        ▼
  dist/ is uploaded to GitHub Pages
        │
        ▼
  mobila-orhei.tech shows new content ✓  (1–2 minutes later)
```

### Commit a note

```bash
git commit --allow-empty -m "ci: confirm GitHub Pages deployment with PagesCMS integration"
git push
```

---

## Phase 5 — Connect PagesCMS to Your Repo

### 5.1 Install the PagesCMS GitHub App

1. Go to **[github.com/apps/pages-cms](https://github.com/apps/pages-cms)**
2. Click **Install**
3. Select your GitHub account
4. Under **Repository access** → **Only select repositories** → choose `tum-web-lab2`
5. Click **Install**

> Without this, PagesCMS can read config but cannot commit changes back to your repo.

### 5.2 Open PagesCMS and sign in

1. Go to **[app.pagescms.org](https://app.pagescms.org)**
2. Click **Sign in with GitHub** and authorize

### 5.3 Open your repository in PagesCMS

1. Click **Open a project**
2. Search for `tum-web-lab2` → select it

PagesCMS auto-detects `public/admin/config.yml` and loads your content structure.

### 5.4 Test editing in the CMS

1. In PagesCMS sidebar, click **Pagina Principală** (Homepage)
2. Edit any field (e.g., change "Mobilă Premium din Moldova" to something else)
3. Click **Save**
4. PagesCMS commits the change to `main` branch
5. GitHub Actions automatically rebuilds (~1–2 minutes)
6. Refresh [mobila-orhei.tech](https://www.mobila-orhei.tech) → see the updated text

### 5.5 Test image uploads

1. Open a kitchen project (or add one) in PagesCMS
2. Click the image field
3. Upload a furniture photo
4. Save — image is stored in `astro-project/public/images/uploads/` and path is written to the JSON file

---

## Phase 6 — Verify & Test

### Final Checklist

**Astro & Build**

- [ ] `npm run build` exits with no errors
- [ ] `npm run preview` shows the site locally
- [ ] No hard-coded strings remain in `.astro` files (all in JSON)
- [ ] Tailwind CSS classes render correctly

**PagesCMS**

- [ ] Sidebar shows: "Pagina Principală", "Proiecte Bucătării", "Servicii"
- [ ] All fields are editable (hero, services, footer, etc.)
- [ ] Images upload to `public/images/uploads/`
- [ ] Save button works and commits to GitHub

**Deployment & Live Site**

- [ ] [mobila-orhei.tech](https://www.mobila-orhei.tech) is accessible
- [ ] GitHub Actions build succeeds after each CMS save
- [ ] Edited content appears on live site (within 2 minutes)
- [ ] Styling is intact (no broken CSS or layout shifts)

**CMS Coverage**

- [ ] ≥10 editable fields (hero, services, kitchens, furniture, footer)
- [ ] ≥2 image fields are editable
- [ ] Rich-text fields render HTML correctly on the site

---

## Git History Checklist

A good lab submission includes meaningful commits across all phases. Your history should show:

```
commit abc1234 (main)
Author: You <you@email.com>

    feat: expand CMS coverage to services, products, and all editable sections
    feat: add PagesCMS configuration for all content sections
    feat: extract hard-coded content to JSON for CMS integration
    chore: create data directory structure
    ...
```

Aim for at least **5–7 commits** that show progression. If you're missing commits, add them:

```bash
git commit --allow-empty -m "docs: add CMS integration guide for team"
git commit --allow-empty -m "content: add kitchen project catalogs via CMS"
git commit --allow-empty -m "style: improve mobile responsiveness with Tailwind"
```

---

## Troubleshooting

### Setup Order Issues (Most Common Problems)

**Problem: PagesCMS sidebar is empty or shows no content**

Cause: You configured `.pages.yml` before creating the data files.

Solution: Follow the correct order:

1. Create `src/data/home.json` (the actual file)
2. Update `.pages.yml` to point to it
3. Push to GitHub
4. Refresh PagesCMS dashboard

PagesCMS reads the JSON files first, then builds the UI from `.pages.yml`. If the file doesn't exist, the UI won't appear.

**Problem: PagesCMS field values aren't showing**

Cause: Field names in `.pages.yml` don't match keys in JSON.

Example (wrong):

```json
{ "heading": "Hello" }  ← JSON key is "heading"
```

```yaml
- { name: hero_heading, label: "Titlu", type: string }  ← YAML field is "hero_heading"
```

Solution: Make sure they match exactly:

```json
{ "hero_heading": "Hello" }
```

```yaml
- { name: hero_heading, label: "Titlu", type: string }
```

**Problem: Components display "undefined" values**

Cause: You imported JSON but didn't pass data to components.

Wrong:

```astro
import home from '../data/home.json';
<Hero />  ← no props passed!
```

Right:

```astro
import home from '../data/home.json';
<Hero heading={home.hero_heading} subheading={home.hero_subheading} />
```

### PagesCMS shows "No configuration file found"

- Expected: `.pages.yml` at repo root (not in a subfolder)
- The file should be pushed to GitHub
- Hard-refresh PagesCMS or clear browser cache

### Build fails after CMS changes

- Check `.github/workflows/deploy.yml` — verify `working-directory: astro-project` is set
- Check the build log in **GitHub Actions** for errors
- Run `npm run build` locally to debug

### JSON syntax errors

If your site fails to build after CMS edits:

- Check that `.json` files are valid JSON (use a JSON validator)
- Ensure all field names in JSON match the field names in `.pages.yml`
- Check GitHub Actions build log for specific JSON parse errors
- Make sure image paths start with `/` (e.g., `/images/uploads/photo.jpg`)

### Images not appearing after upload

- Verify `media:` in `.pages.yml` points to `astro-project/public/images/uploads`
- Confirm images are saved in the correct folder
- In Astro, use paths like `<img src={home.hero_image} />` (no `/public/` prefix)

### CMS saves but site doesn't rebuild

- Check that GitHub Actions workflow has permission to write to Pages
- Verify `main` is your production branch
- Check GitHub Actions log for workflow failures

---

## Summary

You now have a **completely editable furniture store** where:

✅ Marketing team can update product descriptions, prices, and services via PagesCMS  
✅ New kitchen projects can be added without developer help  
✅ Hero section, services, and footer are all CMS-editable  
✅ Images are uploaded directly through the CMS  
✅ Every change is tracked in Git history  
✅ Site rebuilds automatically and deploys to [mobila-orhei.tech](https://www.mobila-orhei.tech)

---

## Reference Links

| Resource                    | URL                                                             |
| --------------------------- | --------------------------------------------------------------- |
| Astro Documentation         | https://docs.astro.build                                        |
| Astro Content Collections   | https://docs.astro.build/en/guides/content-collections/         |
| Astro + GitHub Pages Deploy | https://docs.astro.build/en/guides/deploy/github/               |
| PagesCMS Docs               | https://pagescms.org/docs                                       |
| PagesCMS Config Reference   | https://pagescms.org/docs/configuration                         |
| Tailwind CSS + Astro        | https://docs.astro.build/en/guides/integrations-guide/tailwind/ |
