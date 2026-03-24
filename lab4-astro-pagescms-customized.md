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

PagesCMS is a **free, open-source, Git-based CMS** that lets your team (or clients) edit product descriptions, pricing, services, and testimonials without touching code. All content lives in Markdown/JSON files in your GitHub repo. No database. No monthly fees. When someone edits a product in PagesCMS, it commits directly to GitHub, and your Astro site rebuilds automatically.

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

## Prerequisites

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

### 1.3 Create the content directory

```bash
cd astro-project
mkdir -p src/content/pages
mkdir -p src/content/products    # for furniture/kitchen products
mkdir -p src/content/services    # for delivery, installation, warranty
```

### 1.4 Extract content into Markdown

Your `index.astro` currently has hard-coded content. Extract it into Markdown files:

**`src/content/pages/home.md`**

```markdown
---
title: "Mobila Orhei — Mobilă de Calitate"
description: "Mobilă premium din Moldova. Paturi, bucătării, mese — livrare și instalare incluse."

# Hero section
hero_heading: "Mobilă Premium din Moldova"
hero_subheading: "Paturi confortabile, bucătării moderne, și mobilă de design — directamente din fabrica noastră."
hero_cta_label: "Exploreaza Colectia"
hero_cta_url: "#furniture"

# Services section
services_heading: "De ce să alegi Mobila Orhei?"
services_description: "Facem mobilă care durează."

# Kitchens section
kitchens_heading: "Bucătării Moderne"
kitchens_description: "Proiecte personalizate pentru spațiul tău."

# Furniture section
furniture_heading: "Colecția de Mobilă"
furniture_description: "Din paturi confortabile la mese de design."

# Footer
footer_text: "© 2026 Mobila Orhei. Livrare în toată Moldova."
---
```

> Every field in the frontmatter becomes editable in the PagesCMS UI — perfect for updating prices, descriptions, or CTAs without a developer.

### 1.5 Define a Content Collection

**`src/content/config.ts`** — new file:

```typescript
import { defineCollection, z } from "astro:content";

const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero_heading: z.string(),
    hero_subheading: z.string(),
    hero_cta_label: z.string(),
    hero_cta_url: z.string(),
    services_heading: z.string(),
    services_description: z.string(),
    kitchens_heading: z.string(),
    kitchens_description: z.string(),
    furniture_heading: z.string(),
    furniture_description: z.string(),
    footer_text: z.string(),
  }),
});

export const collections = { pages };
```

### 1.6 Update `index.astro` to read from content

```astro
---
import { getEntry } from 'astro:content';
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import Mascot from '../components/Mascot.astro';
import Hero from '../components/Hero.astro';
import Services from '../components/Services.astro';
import Kitchens from '../components/Kitchens.astro';
import Furniture from '../components/Furniture.astro';
import Footer from '../components/Footer.astro';

// Get the home page content from Markdown
const home = await getEntry('pages', 'home');
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
} = home.data;
---

<Layout title={title}>
  <Header />
  <Mascot />
  <div id="sections" class="font-arial bg-pale-light-gray mt-12.5 flex-1 flex flex-col">
    {/* Hero: Pass content from Markdown */}
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

### 1.7 Test the build locally

```bash
npm run dev
```

Verify:

- Site loads at `http://localhost:3000`
- All content displays (hero, services, kitchens, furniture)
- Content matches what's in `home.md`

Then test production build:

```bash
npm run build
npm run preview
```

### 1.8 Commit this phase

```bash
git add src/content/ src/components/ src/pages/
git commit -m "feat: extract hard-coded content to Markdown for CMS integration"
git push
```

---

## Phase 2 — Configure PagesCMS

PagesCMS is configured entirely through **`public/admin/config.yml`** (one file, no database).

### 2.1 Create the config file

```bash
mkdir -p public/admin
touch public/admin/config.yml
```

### 2.2 Write the configuration

**`public/admin/config.yml`** — This config matches your site structure:

```yaml
# ─────────────────────────────────────────────────────────
# PagesCMS Configuration for Mobila Orhei
# Docs: https://pagescms.org/docs/configuration
# ─────────────────────────────────────────────────────────

media:
  input: astro-project/public/images/uploads
  output: /images/uploads

content:
  # ── Homepage ──────────────────────────────────────────
  - name: home
    label: Pagina Principală # label in CMS (Romanian: "Main Page")
    path: astro-project/src/content/pages
    filename: home.md
    type: file # single file, not a collection
    fields:
      - { name: title, label: "Titlu Site", type: string }
      - { name: description, label: "Meta Description (SEO)", type: string }

      # Hero Section
      - {
          name: hero_heading,
          label: "Hero - Direcție Principală",
          type: string,
        }
      - { name: hero_subheading, label: "Hero - Subtitlu", type: string }
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

  # ── Products (optional: for kitchen designs) ──────────
  - name: kitchens
    label: Proiecte Bucătării # Kitchen projects
    path: astro-project/src/content/products
    filename: "{fields.slug}.md"
    view:
      fields: [title, image]
    fields:
      - { name: title, label: "Nume Proiect", type: string }
      - { name: slug, label: "Slug (ID)", type: string }
      - { name: image, label: "Imagine Proiect", type: image }
      - { name: description, label: "Descriere", type: rich-text }
      - { name: price, label: "Preț (MDL)", type: string }
      - { name: features, label: "Caracteristici", type: rich-text }

  # ── Services (optional: delivery, warranty, custom work) ──
  - name: services
    label: Servicii
    path: astro-project/src/content/services
    filename: "{fields.slug}.md"
    view:
      fields: [title, icon]
    fields:
      - { name: title, label: "Nume Serviciu", type: string }
      - { name: slug, label: "Slug", type: string }
      - { name: icon, label: "Icon (emoji/image)", type: string }
      - { name: description, label: "Descriere", type: rich-text }
      - { name: price_info, label: "Info preț/condiții", type: string }
```

> **PagesCMS Field Types:**  
> `string` (short text) · `text` (long text) · `rich-text` (HTML editor) · `image` · `date` · `boolean` · `number` · `select` · `list` · `object`

### 2.3 Commit the CMS config

```bash
git add public/admin/config.yml
git commit -m "feat: add PagesCMS configuration for all content sections"
git push
```

---

## Phase 3 — Make Content CMS-Editable

Expand the Markdown structure to cover **all** parts of your landing page that should be editable:

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

### Example: Add services list to home.md

**`src/content/pages/home.md` — Add to frontmatter:**

```markdown
services:

- label: "Livrare Gratuită"
  icon: "🚚"
  description: "Livrare în toată Moldova pentru comenzi peste 500 MDL"
- label: "Instalare Inclusă"
  icon: "🔨"
  description: "Oamenii noștri vor instala și aranja totul perfect"
- label: "Garantie 2 Ani"
  icon: "✅"
  description: "Orice defect de fabricație — înlocuim gratuit"
- label: "Mobilă Personalizată"
  icon: "🎨"
  description: "Dimensiuni și culori după preferințele tale"
```

**Update `config.yml`** to include services list:

```yaml
- name: services
  label: Servicii (listă pe pagina principală)
  type: list
  fields:
    - { name: label, label: "Titlu Serviciu", type: string }
    - { name: icon, label: "Icon (emoji)", type: string }
    - { name: description, label: "Descriere", type: text }
```

**Update `src/components/Services.astro`:**

```astro
---
interface Props {
  services: Array<{ label: string; icon: string; description: string }>;
  heading: string;
  description: string;
}

const { services, heading, description } = Astro.props;
---

<section class="py-12 px-6">
  <h2 class="text-3xl font-bold mb-4">{heading}</h2>
  <p class="mb-8 text-slate-600">{description}</p>

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
4. Save — image is stored in `public/images/uploads/` and path is written to the Markdown file

---

## Phase 6 — Verify & Test

### Final Checklist

**Astro & Build**

- [ ] `npm run build` exits with no errors
- [ ] `npm run preview` shows the site locally
- [ ] No hard-coded strings remain in `.astro` files (all in Markdown)
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
    feat: extract hard-coded content to Markdown for CMS integration
    chore: create content directory structure
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

### PagesCMS shows "No configuration file found"

- Confirm file exists at exactly `public/admin/config.yml`
- The `public/` folder in Astro maps to `/` on the deployed site
- Hard-refresh PagesCMS or clear browser cache

### Build fails after CMS changes

- Check `.github/workflows/deploy.yml` — verify `working-directory: astro-project` is set
- Check the build log in **GitHub Actions** for errors
- Run `npm run build` locally to debug

### Content Collections sync errors

```bash
# Regenerate Astro types
npx astro sync
```

### Images not appearing after upload

- Verify `media.input: astro-project/public/images/uploads` in `config.yml` matches your folder structure
- Verify `media.output: /images/uploads` starts with `/`
- Commit the image files to GitHub and rebuild

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
