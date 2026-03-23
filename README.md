# Lab 4 - Static Site Generator & Git Content Management System

## SSG Migration: HTML → Astro

Migrated the monolithic HTML landing page to **Astro 4.0** static site generator for improved maintainability, component reusability.

### Architecture Changes

**From:** Single `index.html` → **To:** Component-based Astro project

```
astro-project/src/
├── pages/
│   └── index.astro              # Homepage assembling all components
├── components/
│   ├── Header.astro             # Navigation
│   ├── Hero.astro               # Hero section
│   ├── Services.astro           # Sevices section
│   ├── Mascot.astro             # Mascot with speech balloon
│   ├── Kitchens.astro           # Kitchen section
│   ├── Furniture.astro          # Bedroom section
│   └── Footer.astro             # Contact info + address
├── layouts/
│   └── Layout.astro             # Global HTML shell, meta tags, FontAwesome
└── styles/
    ├── global.css               # Tailwind + custom @layer, responsive fonts
    ├── mascot.css               # Mascot animations & speech balloon pseudo-elements
    └── kitchens.css             # Kitchen section grid-area layout
```

### Key Changes

1. **Component Decomposition:** Broke monolithic HTML into 7 reusable `.astro` components
2. **CSS Migration:**
   - Removed all `@apply` directives (Tailwind v4 incompatibility)
   - Converted to explicit CSS properties for `mascot.css` and `kitchens.css`
   - Moved complex grid layouts (`grid-template-areas`) to separate CSS files
3. **Image Paths:** Updated all image references to use root-relative URLs (`/images/...`)
4. **Build System:** Integrated `@astrojs/tailwind` for zero-config Tailwind support
5. **Global Configurations:** Moved from `tailwind.config.js` to `global.css`

## Git CMS Integration

_To be implemented in next phase_

## Project Links

- GitHub Repository: https://github.com/arturtugui/tum-web-lab2/
- Live Site (GitHub Pages): https://www.mobila-orhei.tech/
