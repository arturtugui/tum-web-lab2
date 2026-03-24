# Deployment Strategy Changes - tum-web-lab2

**Date**: March 24, 2026  
**Status**: In Progress - Fixing image paths  
**Objective**: Deploy to custom domain root instead of GitHub Pages subdirectory

---

## What Changed

### Previous Configuration (Subdirectory Deployment)

- **Site URL**: `https://arturtugui.github.io/tum-web-lab2/`
- **astro.config.mjs**: Had `base: '/tum-web-lab2/'`
- **Image paths**: `/tum-web-lab2/images/...`
- **Use case**: Project site at subdirectory of GitHub Pages user site

### New Configuration (Domain Root Deployment)

- **Site URL**: `https://www.mobila-orhei.tech/` (custom domain root)
- **astro.config.mjs**: **NO `base` parameter**
- **Image paths**: `/images/...` (root-relative)
- **Use case**: Entire site at custom domain root

---

## Files Modified

### 1. `astro.config.mjs`

**BEFORE:**

```javascript
export default defineConfig({
  site: "https://www.mobila-orhei.tech",
  base: "/tum-web-lab2/", // ← REMOVED
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**AFTER:**

```javascript
export default defineConfig({
  site: "https://www.mobila-orhei.tech",
  // base parameter removed - no more subdirectory
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Impact**: Astro no longer prepends `/tum-web-lab2/` to any paths.

### 2. Image Paths in Components

Updated all image references from `/tum-web-lab2/images/...` to `/images/...`

**Files Changed:**

- `src/components/Hero.astro`
- `src/components/Kitchens.astro`
- `src/components/Furniture.astro`

**Example:**

```astro
<!-- BEFORE -->
<img src="/tum-web-lab2/images/bucatarii/b1.jpg" />

<!-- AFTER -->
<img src="/images/bucatarii/b1.jpg" />
```

### 3. Image Paths in CSS

Updated `src/styles/mascot.css` - all 8 image URL references:

```css
/* BEFORE */
background-image: url("/tum-web-lab2/images/mascot-frames/sleep.png");

/* AFTER */
background-image: url("/images/mascot-frames/sleep.png");
```

**Updated:**

- 3 static image references in `#mascot` states
- 5 image references in `@keyframes mascotEntrance`

---

## Technical Details

### Why Image Paths Must Match `base` Setting

When Astro has `base: '/tum-web-lab2/'`, it automatically:

1. Prepends `/tum-web-lab2/` to all root-relative paths (`/images/...` → `/tum-web-lab2/images/...`)
2. Updates all internal links accordingly
3. Configures the dev server to serve from that base path

**Without `base`:**

- All paths are served from site root
- `/images/...` resolves to `https://www.mobila-orhei.tech/images/`
- No automatic path rewriting

### Cache Issues Encountered

During transition, the **Astro build cache** (`.astro/` folder) continued applying the old `base` setting even after configuration was changed.

**Solution**: Clear the cache

```bash
rm -r .astro
npm run dev
```

This forces Astro to rebuild without cached metadata.

---

## Deployment Targets

Now you have **TWO working URLs** to access the site:

| URL                                          | Status         | Notes                             |
| -------------------------------------------- | -------------- | --------------------------------- |
| `https://arturtugui.github.io/tum-web-lab2/` | ✅ Works       | GitHub Pages subfolder (fallback) |
| `https://www.mobila-orhei.tech/`             | ⏳ In progress | Custom domain (primary target)    |

### GitHub Pages Configuration Required

For custom domain to work, you must:

1. Settings → Pages → Custom domain field
2. Enter: `www.mobila-orhei.tech`
3. Click Save
4. GitHub will verify DNS against CNAME file in `astro-project/public/CNAME`
5. When verified, site becomes live at custom domain

---

## Key Files Involved

### Configuration

- `astro.config.mjs` — Build settings (base removed)
- `astro-project/public/CNAME` — Custom domain mapping
- `astro-project/public/.nojekyll` — Disable Jekyll processing

### Components (Updated Image Paths)

- `src/components/Hero.astro`
- `src/components/Kitchens.astro`
- `src/components/Furniture.astro`

### Styles (Updated Image Paths)

- `src/styles/mascot.css` — 8 image URL updates

---

## Testing Locally

After clearing cache, the dev server should request:

```
✅ GET /images/bucatarii/b5.jpg
✅ GET /images/mascot-frames/sleep.png
✅ GET /images/hero-image.jpg
```

**NOT:**

```
❌ GET /tum-web-lab2/images/bucatarii/b5.jpg
❌ GET /tum-web-lab2/images/hero-image.jpg
```

If you still see `/tum-web-lab2/` requests after clearing `.astro/`:

- Hard refresh browser: `Ctrl+Shift+Delete`
- Check DevTools Network tab for actual request URLs
- Verify `astro.config.mjs` has **no `base` line**

---

## What's Next

1. **Verify localhost works**: Images should load at `/images/...` paths
2. **Build for production**: `npm run build` should generate correct paths
3. **Push to master**: Triggers GitHub Actions deployment
4. **Configure GitHub Pages**: Enter custom domain in repo settings
5. **Test live**: Visit `www.mobila-orhei.tech` once DNS verifies

---

## Commit Message (When Ready)

```
Remove base path - deploy to custom domain root

- Remove 'base: /tum-web-lab2/' from astro.config.mjs
- Update all image paths from /tum-web-lab2/images/ to /images/
- Site now deploys to domain root instead of subdirectory
- Supports www.mobila-orhei.tech deployment
```

---

## Troubleshooting

### Images still showing `/tum-web-lab2/` paths?

**Cause**: Build cache or browser cache  
**Solution**:

```bash
rm -r .astro
npm run dev
# Then hard refresh browser (Ctrl+Shift+Delete)
```

### astro.config.mjs still shows `base` parameter?

**Cause**: File not saved or git hasn't committed  
**Solution**: Verify file contents:

```bash
cat astro.config.mjs | find "base"
# Should return nothing
```

### Custom domain still shows 404?

**Cause**: GitHub Pages not configured with custom domain  
**Solution**:

1. Go to repo Settings → Pages
2. Enter domain in "Custom domain" field
3. Wait for DNS verification
4. GitHub will show "Your site is live at..." message

---

## Summary of Configuration

| Setting                | Value                            | Purpose                     |
| ---------------------- | -------------------------------- | --------------------------- |
| `site`                 | `https://www.mobila-orhei.tech`  | Canonical URL for SEO       |
| `base`                 | (removed)                        | No path prefix              |
| `output`               | `static`                         | Generate static HTML        |
| Image paths            | `/images/...`                    | Root-relative URLs          |
| CNAME file             | In `public/`                     | Maps domain to GitHub Pages |
| Domain registrar CNAME | Points to `arturtugui.github.io` | DNS routing                 |
