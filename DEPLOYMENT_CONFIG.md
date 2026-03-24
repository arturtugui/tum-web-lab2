# Deployment Configuration - tum-web-lab2 (Astro SSG)

## Project Overview

- **Repository**: arturtugui/tum-web-lab2
- **Framework**: Astro 4 (Static Site Generator)
- **Styling**: Tailwind CSS v4
- **Deployment Target**: GitHub Pages
- **Custom Domain**: `www.mobila-orhei.tech`
- **Project Site URL**: `https://arturtugui.github.io/tum-web-lab2/`

## Current Issue

Custom domain `www.mobila-orhei.tech` returns **404 Not Found**, even though:

- DNS CNAME record exists and points to `arturtugui.github.io`
- GitHub Pages settings show no custom domain configured
- Site works at `https://arturtugui.github.io/tum-web-lab2/`
- Deployment files are in place

---

## 1. Astro Configuration

**File**: `astro-project/astro.config.mjs`

```javascript
// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.mobila-orhei.tech",
  base: "/tum-web-lab2/",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Key Settings Explained**:

- `site: 'https://www.mobila-orhei.tech'` — Sets the canonical URL for sitemap/metadata
- `base: '/tum-web-lab2/'` — **Critical**: Prepends this path to all URLs since site is at a subdirectory of `arturtugui.github.io`
  - All image paths must include `/tum-web-lab2/` prefix
  - All links must account for this base path
- `output: 'static'` — Generates static HTML (required for GitHub Pages)

---

## 2. GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml` (at repo **root**, NOT in `astro-project/`)

```yaml
name: Deploy Astro to GitHub Pages

on:
  push:
    branches: [master]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install dependencies
        working-directory: astro-project
        run: npm install
      - name: Build
        working-directory: astro-project
        run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: astro-project/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**Critical Notes**:

- Workflow file **must be in the repo root** at `.github/workflows/deploy.yml` (not in `astro-project/.github/`)
- `node-version: 22` — Astro requires Node.js >= 22.12.0
- `working-directory: astro-project` — All commands run in the `astro-project/` subdirectory
- Uploads `astro-project/dist/` as the Pages artifact (the built static site)
- Triggers automatically on push to `master` branch

---

## 3. CNAME Configuration (Custom Domain)

**File**: `astro-project/public/CNAME`

```
www.mobila-orhei.tech
```

**How It Works**:

1. This file is placed in `public/` so Astro copies it to `dist/` during build
2. GitHub Pages uses the CNAME file in the deployed artifact to know which custom domain to serve
3. The DNS provider has a CNAME record: `www.mobila-orhei.tech` → `arturtugui.github.io`

**File Location is Critical**:

- ✅ `astro-project/public/CNAME` → Gets copied to `dist/CNAME` during build
- ❌ Repo root `CNAME` → Would be in wrong place when artifact is deployed

---

## 4. Jekyll Bypass

**File**: `astro-project/public/.nojekyll`

```
[empty file]
```

**Purpose**:

- Tells GitHub Pages to skip Jekyll processing
- Necessary because Astro's `.astro` files have YAML frontmatter that Jekyll would try to parse
- Without this, Jekyll would fail on `.astro` file syntax

---

## 5. Image Path Configuration

**Issue**: All image paths must include the `/tum-web-lab2/` base path because of the `base` setting in `astro.config.mjs`.

**Example Updates**:

```astro
<!-- WRONG (will 404) -->
<img src="/images/hero-image.jpg" />

<!-- CORRECT -->
<img src="/images/hero-image.jpg" />
```

**Also in CSS**:

```css
/* WRONG */
background-image: url("/images/mascot-frames/sleep.png");

/* CORRECT */
background-image: url("/tum-web-lab2/images/mascot-frames/sleep.png");
```

---

## 6. Directory Structure

```
tum-web-lab2/
├── .github/
│   └── workflows/
│       └── deploy.yml                 ← Workflow file (REPO ROOT!)
├── astro-project/
│   ├── astro.config.mjs              ← Astro config
│   ├── package.json
│   ├── public/
│   │   ├── CNAME                     ← Custom domain file
│   │   ├── .nojekyll                 ← Jekyll bypass
│   │   ├── images/
│   │   │   ├── bucatarii/
│   │   │   ├── bed/
│   │   │   └── mascot-frames/
│   │   └── ...
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── styles/
│   ├── dist/                         ← Built site (generated)
│   └── ...
├── README.md
└── CNAME                             ← OLD (can delete - in wrong place)
```

---

## 7. Deployment Checklist

### Required Files

- [ ] `.github/workflows/deploy.yml` at **repo root**
- [ ] `astro-project/public/CNAME` with domain name
- [ ] `astro-project/public/.nojekyll` (empty file)
- [ ] `astro-project/astro.config.mjs` with correct `base` and `site`

### GitHub Pages Settings

Go to: Repository → Settings → Pages

- **Source**: GitHub Actions ✓
- **Custom domain**: `www.mobila-orhei.tech` (enter in text field and Save)
  - GitHub should verify DNS and show: "DNS check successful" or "Your site is live at..."
  - This creates GitHub's own CNAME file in the deployed artifact

### DNS Configuration (at domain registrar)

- Type: `CNAME`
- Name: `www.mobila-orhei.tech` (or just `www` depending on registrar)
- Value: `arturtugui.github.io`
- Status: Should be "Active"

### Local Verification

```bash
# Check if DNS propagated
nslookup www.mobila-orhei.tech

# Should output something like:
# Name: www.mobila-orhei.tech
# Address: [IP address of GitHub Pages]
```

---

## 8. Common Issues & Solutions

### Issue: "Custom domain configuration fails with DNS error"

**Cause**: DNS hasn't propagated yet (can take up to 48 hours)

**Solution**:

1. Verify DNS record at your registrar
2. Use `nslookup www.mobila-orhei.tech` to check
3. Wait for propagation
4. Retry "Save" in GitHub Pages settings

### Issue: Site works at `arturtugui.github.io/tum-web-lab2/` but custom domain shows 404

**Cause**: GitHub Pages custom domain setting not configured

**Solution**:

1. Go to Settings → Pages
2. In "Custom domain" field, enter: `www.mobila-orhei.tech`
3. Click Save
4. Wait for DNS verification (green checkmark)

### Issue: Images don't load

**Cause**: Image paths don't include `/tum-web-lab2/` base

**Solution**:

1. Update all image references: `/images/...` → `/tum-web-lab2/images/...`
2. Update CSS `url()` calls similarly
3. Rebuild and push

### Issue: Build fails with "Node.js version error"

**Cause**: Workflow still using Node.js 20

**Solution**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22 # Changed from 20
```

---

## 9. Next Steps to Debug Custom Domain

1. **Verify GitHub Pages Settings**:
   - Open: Repository → Settings → Pages
   - Under "Custom domain", is `www.mobila-orhei.tech` saved and verified?
   - If empty or shows error, re-enter and save

2. **Check CNAME in Deployed Artifact**:
   - After successful deployment, check if `dist/CNAME` file exists
   - `GitHub Actions` → Latest run → Artifacts should show `github-pages` artifact

3. **Test DNS**:

   ```bash
   nslookup www.mobila-orhei.tech
   dig www.mobila-orhei.tech CNAME
   ```

4. **Verify CNAME File Location**:
   - Must be: `astro-project/public/CNAME`
   - Not: `CNAME` at repo root
   - Not: `astro-project/CNAME`

5. **Force Rebuild**:
   - Make a trivial commit to `master` branch
   - This triggers GitHub Actions
   - Watch deployment complete

---

## 10. Project URLs

| URL                                          | Status     | Notes                                                    |
| -------------------------------------------- | ---------- | -------------------------------------------------------- |
| `https://arturtugui.github.io/tum-web-lab2/` | ✅ Working | Project site (subfolder of user site)                    |
| `https://www.mobila-orhei.tech/`             | ❌ 404     | Custom domain (DNS exists, GitHub Pages not configured?) |
| `https://arturtugui.github.io/`              | N/A        | User site (not used for this project)                    |

---

## References

- [Astro Deployment: GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Astro + Tailwind v4 Setup](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
