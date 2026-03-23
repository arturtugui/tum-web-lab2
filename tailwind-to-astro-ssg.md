# Converting Your Existing Tailwind Project to Astro SSG

A comprehensive, step-by-step guide to migrating any Tailwind CSS project — whether it's plain HTML, React, Vue, or something else — into a fully static Astro site.

---

## Table of Contents

1. [Why Astro?](#why-astro)
2. [Prerequisites](#prerequisites)
3. [Understanding the Architecture Shift](#understanding-the-architecture-shift)
4. [Step 1 — Scaffold a New Astro Project](#step-1--scaffold-a-new-astro-project)
5. [Step 2 — Install and Configure Tailwind in Astro](#step-2--install-and-configure-tailwind-in-astro)
6. [Step 3 — Map Your Old File Structure to Astro's](#step-3--map-your-old-file-structure-to-astros)
7. [Step 4 — Migrate HTML / Templates to `.astro` Components](#step-4--migrate-html--templates-to-astro-components)
8. [Step 5 — Migrate JavaScript Logic](#step-5--migrate-javascript-logic)
9. [Step 6 — Migrate React / Vue / Svelte Components](#step-6--migrate-react--vue--svelte-components)
10. [Step 7 — Handle Routing and Pages](#step-7--handle-routing-and-pages)
11. [Step 8 — Data Fetching and Content Collections](#step-8--data-fetching-and-content-collections)
12. [Step 9 — Static Assets](#step-9--static-assets)
13. [Step 10 — Build, Preview, and Deploy](#step-10--build-preview-and-deploy)
14. [Common Pitfalls](#common-pitfalls)
15. [Checklist](#checklist)

---

## Why Astro?

Astro is a **content-first static site generator** that ships zero JavaScript to the browser by default. It is framework-agnostic — you can use React, Vue, Svelte, Solid, or plain HTML side by side in the same project — and it has first-class Tailwind support out of the box.

Key wins you get from migrating:

| Feature                       | Before (plain project)     | After (Astro SSG)                    |
| ----------------------------- | -------------------------- | ------------------------------------ |
| JavaScript shipped to browser | All of it                  | Zero by default                      |
| Component model               | Framework-specific or none | `.astro` + any UI framework          |
| Routing                       | Manual or framework router | File-system routing                  |
| Data fetching at build time   | Custom scripts             | `Astro.glob()` / Content Collections |
| Tailwind integration          | Manual PostCSS config      | `@astrojs/tailwind` integration      |
| Deploy target                 | Varies                     | Static HTML — deployable anywhere    |

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed (`node -v` to check)
- **npm**, **pnpm**, or **yarn** available
- Your existing project accessible locally
- Basic familiarity with component-based thinking (Astro components are similar to HTML with a frontmatter script block)

---

## Understanding the Architecture Shift

### The mental model change

In a traditional Tailwind project, your markup lives in whatever template engine or framework you chose. JavaScript often runs in the browser to handle rendering, routing, and data.

In Astro, **all the heavy lifting happens at build time**:

```
Build time (Node.js)           Browser
───────────────────────        ──────────────────────
.astro files                →  Pure HTML + CSS
Astro.glob() / fetch()      →  (data is baked in)
Framework components        →  Static HTML (by default)
Tailwind classes            →  Purged CSS bundle
```

The result is a folder of `.html`, `.css`, and optionally a small amount of `.js` files — fully static and blazing fast.

### Islands Architecture

Astro's "Islands" model lets you opt individual components into client-side JavaScript when you genuinely need interactivity. You annotate a component with a **client directive**:

```astro
<!-- Renders as static HTML, zero JS -->
<MyCard />

<!-- Hydrates only when the component becomes visible -->
<MyCounter client:visible />

<!-- Hydrates immediately on page load -->
<SearchBox client:load />

<!-- Hydrates only on media query match -->
<MobileSidebar client:media="(max-width: 768px)" />
```

Everything else stays HTML. This is the core reason Astro-built sites are so fast.

---

## Step 1 — Scaffold a New Astro Project

Create a fresh Astro project alongside your existing project (you'll migrate files across gradually):

```bash
# Using npm
npm create astro@latest my-astro-site

# Using pnpm
pnpm create astro@latest my-astro-site

# Using yarn
yarn create astro my-astro-site
```

The interactive CLI will ask you a few questions:

- **Template** → Choose "Empty" (you're bringing your own markup)
- **TypeScript** → "Strict" is recommended, but "Relaxed" works if your old project has no types
- **Install dependencies** → Yes

Once scaffolded, your project looks like this:

```
my-astro-site/
├── public/              # Static assets served as-is
├── src/
│   ├── components/      # Reusable .astro (or framework) components
│   ├── layouts/         # Page layout wrappers
│   └── pages/           # One file = one URL route
├── astro.config.mjs     # Astro configuration
├── package.json
└── tsconfig.json
```

---

## Step 2 — Install and Configure Tailwind in Astro

Astro has an official Tailwind integration that wires up PostCSS automatically:

```bash
npx astro add tailwind
```

### In Your Case

You have a `tailwind.config.js` with custom design tokens and a `desktop` breakpoint. In `astro-project/tailwind.config.mjs`, merge your theme extensions:

```js
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  theme: {
    extend: {
      colors: {
        "dark-almost-black": "#212a31",
        gray: "#2e3944",
        "pale-light-gray": "#d3d8d9",
        "muted-gray-blue": "#748d92",
        "vivid-blue": "#124e66",
        "dark-blue": "#0a2f3f",
        "text-gray": "#838c90",
        "bluer-almost-dark": "#324a5f",
        "kitchen-bg": "#1e2c36",
        "furniture-bg": "#324946",
        "button-hover": "#1f3449",
        "footer-text": "#cfd8dc",
      },
      screens: {
        desktop: "1200px",
      },
      fontFamily: {
        arial: ["Arial", "sans-serif"],
        verdana: ["Verdana", "sans-serif"],
      },
    },
  },
};
```

This ensures all your color tokens (e.g., `text-vivid-blue`, `bg-dark-almost-black`) and the `desktop:` breakpoint are available in your components.

This single command:

1. Installs `@astrojs/tailwind` and `tailwindcss` as dependencies
2. Adds the integration to `astro.config.mjs`
3. Creates a `tailwind.config.mjs` at the project root

Your `astro.config.mjs` will now look like this:

```js
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
});
```

### Migrating your existing `tailwind.config.js`

Copy your old config's `theme`, `plugins`, and `extend` sections into the new `tailwind.config.mjs`. Astro auto-sets the `content` array to cover `./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}`, but you can extend it:

```js
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
    // Add any extra paths from your old project here
  ],
  theme: {
    extend: {
      // Paste your old theme extensions here
      colors: {
        brand: "#6366f1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    // Your old plugins (e.g. @tailwindcss/typography, @tailwindcss/forms)
  ],
};
```

### Custom CSS / base styles

If your old project had a `globals.css` or `base.css` with `@tailwind base; @tailwind components; @tailwind utilities;` — **you don't need this file anymore**. The integration injects those directives automatically.

However, if you have custom `@layer` rules or CSS variables, create `src/styles/global.css` and import it in your root layout:

```css
/* src/styles/global.css */
@layer base {
  :root {
    --color-primary: theme("colors.indigo.600");
  }

  h1 {
    @apply text-4xl font-bold tracking-tight;
  }
}
```

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
---
```

---

## Step 3 — Map Your Old File Structure to Astro's

Here's how to think about where each file in your old project belongs in Astro:

| Old project              | Astro equivalent                                      |
| ------------------------ | ----------------------------------------------------- |
| `index.html`             | `src/pages/index.astro`                               |
| `about.html`             | `src/pages/about.astro`                               |
| `components/Card.jsx`    | `src/components/Card.astro` or keep as `.jsx`         |
| `layouts/Default.html`   | `src/layouts/BaseLayout.astro`                        |
| `assets/` or `img/`      | `public/` (served as-is) or `src/assets/` (optimized) |
| `styles/global.css`      | `src/styles/global.css` → imported in layout          |
| Blog posts (`.md` files) | `src/content/blog/*.md` (Content Collections)         |
| Data files (`.json`)     | `src/data/*.json` → imported in frontmatter           |

### In Your Case

Your `index.html` is a single monolithic file with multiple sections. Break it down into components:

```
src/pages/
  └── index.astro          # Main page (imports all components)

src/components/
  ├── Header.astro         # Navigation bar
  ├── Mascot.astro         # Mascot + speech balloon
  ├── Hero.astro           # Hero section with background image
  ├── Services.astro       # 4-column services grid
  ├── Kitchens.astro       # Kitchen models section
  ├── Furniture.astro      # Furniture/bedroom grid
  └── Footer.astro         # Contact info + Google Maps

src/layouts/
  └── Layout.astro         # Base HTML shell (already done)

public/images/
  ├── hero-image.jpg
  ├── bed/                 # Furniture images
  ├── bucatarii/           # Kitchen images
  └── mascot-frames/       # Mascot animation frames (if needed)

src/styles/
  └── global.css           # Your custom @layer rules
```

---

## Step 4 — Migrate HTML / Templates to `.astro` Components

An `.astro` file has two sections separated by `---` fences:

```astro
---
// This is the "component script" — runs at build time in Node.js
// Import other components, fetch data, define variables here
const title = "Hello World";
const items = ["Apples", "Bananas", "Cherries"];
---

<!-- This is the "component template" — just HTML with expressions -->
<h1 class="text-3xl font-bold text-gray-900">{title}</h1>

<ul class="mt-4 space-y-2">
  {items.map(item => (
    <li class="text-gray-600">{item}</li>
  ))}
</ul>
```

### In Your Case

Your `index.html` has distinct sections. Here's how to structure them as components:

**Services component** (already shown as an example above):

- Extract the 4 service cards into an array of objects
- `.map()` over them to render the grid
- Use your custom color `text-vivid-blue` for the dividers

**Kitchens and Furniture sections**:

- These use complex grid layouts from `input.css` with `grid-template-areas`
- Keep the grid CSS in `src/styles/global.css` via `@layer components`
- The Astro component just renders the HTML structure and images

**Header navigation**:

- Extract nav links into an array: `{ name: 'Servicii', href: '#services-section', hideOnMobile: true }`
- Use `hideOnMobile ? 'hidden md:block' : ''` to conditionally apply Tailwind classes

**Mascot with animation**:

- The animation loop from `input.css` stays in `src/styles/global.css`
- The `<script>` tag in `Mascot.astro` handles the `animationend` event listener
- Your custom CSS for `.mascot` and `.speech-balloon` pseudo-elements moves to the global CSS

**Example: Services component structure**:

```astro
---
const services = [
  {
    icon: 'fa-couch',
    title: 'Mobilier pentru Living și Dormitor',
    description: 'Canapele, paturi, dulapuri și piese moderne...'
  },
  // ... rest of services
];
---

<section id="services-section">
  <div class="text-[1.875rem] font-bold text-center mt-8">
    <h2>Servicii oferite</h2>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-4 gap-8 items-stretch mt-6 mb-6 mx-4 pb-4">
    {services.map(service => (
      <div class="bg-white rounded-2xl shadow-md py-8 px-4 text-center flex flex-col items-center justify-start">
        <i class={`fas ${service.icon} fa-3x`}></i>
        <hr class="w-[10%] border-0 border-t border-vivid-blue my-2">
        <h3 class="text-[1.25rem] font-bold mb-4">{service.title}</h3>
        <p class="text-base text-muted-gray-blue grow">{service.description}</p>
      </div>
    ))}
  </div>
</section>
```

### Converting a plain HTML page

**Before (plain HTML):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Site</title>
    <link rel="stylesheet" href="/styles/output.css" />
  </head>
  <body class="bg-white font-sans">
    <header class="bg-indigo-600 text-white px-6 py-4">
      <h1 class="text-2xl font-bold">My Site</h1>
    </header>
    <main class="max-w-4xl mx-auto px-6 py-12">
      <p class="text-gray-700 leading-relaxed">Welcome to my site.</p>
    </main>
  </body>
</html>
```

**After (Astro):**

First, extract the shell into a layout:

```astro
---
// src/layouts/BaseLayout.astro
const { title = "My Site" } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
</head>
<body class="bg-white font-sans">
  <header class="bg-indigo-600 text-white px-6 py-4">
    <h1 class="text-2xl font-bold">My Site</h1>
  </header>
  <main class="max-w-4xl mx-auto px-6 py-12">
    <slot />
  </main>
</body>
</html>
```

Then create the page:

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Home">
  <p class="text-gray-700 leading-relaxed">Welcome to my site.</p>
</BaseLayout>
```

### `<slot />` — Astro's version of `children`

`<slot />` is where child content is injected, exactly like React's `{children}`. Named slots let you inject into multiple positions:

```astro
<!-- Layout with named slots -->
<header><slot name="header" /></header>
<main><slot /></main>
<aside><slot name="sidebar" /></aside>
```

```astro
<!-- Page using named slots -->
<BaseLayout>
  <nav slot="header">...</nav>
  <p>Main content goes in the default slot.</p>
  <ul slot="sidebar">...</ul>
</BaseLayout>
```

---

## Step 5 — Migrate JavaScript Logic

### Build-time JS (data fetching, transformations)

Any JS that runs to **prepare data** — reading files, calling APIs, transforming content — moves into the frontmatter:

```astro
---
// This runs in Node.js at build time — not in the browser
const response = await fetch('https://api.example.com/posts');
const posts = await response.json();
---

<ul>
  {posts.map(post => (
    <li class="py-2 border-b border-gray-200">
      <a href={`/blog/${post.slug}`} class="text-indigo-600 hover:underline">
        {post.title}
      </a>
    </li>
  ))}
</ul>
```

### In Your Case

You have a mascot animation that runs in the browser. This is **client-side JavaScript** and belongs in a `<script>` tag.

**In your current `index.html`:**

```js
document.getElementById("mascot").addEventListener("animationend", (e) => {
  e.target.classList.add("ready");
});
```

**In `src/components/Mascot.astro`:**

```astro
---
// Empty frontmatter — no build-time logic needed
---

<div id="mascot"></div>

<div id="speech-balloon">
  <p class="m-0 text-base font-bold text-vivid-blue">Ai intrebări?</p>
  <a href="#footer" class="py-2.5 px-5 rounded-lg bg-vivid-blue text-white text-[0.9rem] border-none cursor-pointer font-bold transition-colors duration-300 hover:bg-dark-blue w-fit no-underline">
    Contactează-ne
  </a>
</div>

<script>
  // This runs in the browser when the page loads
  const mascot = document.getElementById('mascot');

  mascot?.addEventListener('animationend', (e) => {
    e.target.classList.add('ready');
  });
</script>
```

The animation frames and keyframes stay in `src/styles/global.css` as `@layer components`.

### Client-side JS (event listeners, animations, DOM manipulation)

Use a `<script>` tag inside the component template. Astro automatically bundles and deduplicates these:

```astro
<button id="toggle" class="px-4 py-2 bg-indigo-600 text-white rounded-lg">
  Toggle Menu
</button>

<nav id="menu" class="hidden">...</nav>

<script>
  const toggle = document.getElementById('toggle');
  const menu = document.getElementById('menu');

  toggle?.addEventListener('click', () => {
    menu?.classList.toggle('hidden');
  });
</script>
```

> **Important:** Scripts in `.astro` files are **module scripts** by default — they run once even if the component appears multiple times on the page. Use `is:inline` to opt out of this behavior.

---

## Step 6 — Migrate React / Vue / Svelte Components

Astro supports multiple UI frameworks simultaneously via official integrations.

### Adding framework support

```bash
# React
npx astro add react

# Vue
npx astro add vue

# Svelte
npx astro add svelte

# Multiple at once
npx astro add react vue
```

### Using existing framework components

Your existing `.jsx`, `.tsx`, `.vue`, or `.svelte` components **can be used as-is** inside `.astro` files. You just need to decide how much JavaScript they ship to the browser.

```astro
---
import MyReactCounter from '../components/Counter.jsx';
import MyVueModal from '../components/Modal.vue';
---

<!-- Renders as pure HTML — no JS shipped, no interactivity -->
<MyReactCounter />

<!-- Ships JS and hydrates immediately — full React interactivity -->
<MyReactCounter client:load />

<!-- Hydrates only when the component enters the viewport -->
<MyVueModal client:visible />
```

### The migration decision

For each component in your old project, ask:

1. **Does it need client-side interactivity?** (click handlers, state, animations)
   - Yes → Keep it as a framework component, add a `client:*` directive
   - No → Convert it to a `.astro` component (simpler, zero JS)

2. **Is it purely presentational?** (renders props into HTML)
   - Yes → Strong candidate for `.astro` conversion

### Converting a simple React component to Astro

**Before (React):**

```jsx
// components/Card.jsx
export default function Card({ title, description, href }) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </a>
  );
}
```

**After (Astro):**

```astro
---
// src/components/Card.astro
const { title, description, href } = Astro.props;
---

<a href={href} class="block rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-lg font-semibold text-gray-900">{title}</h3>
  <p class="mt-2 text-sm text-gray-600">{description}</p>
</a>
```

Note: `className` → `class`, `{props}` → `Astro.props`.

---

## Step 7 — Handle Routing and Pages

Astro uses **file-system routing** — the file path under `src/pages/` directly maps to the URL:

```
src/pages/index.astro         →  /
src/pages/about.astro         →  /about
src/pages/blog/index.astro    →  /blog
src/pages/blog/my-post.astro  →  /blog/my-post
```

### Dynamic routes

For pages generated from data (e.g., blog posts), use bracket syntax and export `getStaticPaths()`:

```astro
---
// src/pages/blog/[slug].astro

export async function getStaticPaths() {
  // Astro calls this at build time to know which pages to generate
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<h1 class="text-4xl font-bold">{post.title}</h1>
<div class="prose mt-8" set:html={post.content} />
```

### 404 page

Create `src/pages/404.astro` — Astro and most static hosts (Netlify, Vercel, Cloudflare Pages) will serve it automatically.

---

## Step 8 — Data Fetching and Content Collections

### Astro.glob() — for local files

Quickly import multiple files matching a glob pattern:

```astro
---
// Get all markdown posts
const posts = await Astro.glob('../content/blog/*.md');

// Sort by date
const sorted = posts.sort(
  (a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
);
---
```

### Content Collections — the recommended approach for Markdown/MDX

Content Collections give you type-safe frontmatter validation. Define a schema in `src/content/config.ts`:

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
```

Place your `.md` / `.mdx` files in `src/content/blog/`. Then query them:

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
const sorted = posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

{sorted.map(post => (
  <article class="border-b border-gray-200 py-6">
    <time class="text-sm text-gray-500">{post.data.date.toLocaleDateString()}</time>
    <h2 class="mt-1 text-xl font-semibold">{post.data.title}</h2>
    <a href={`/blog/${post.slug}`} class="mt-2 text-indigo-600 hover:underline text-sm">
      Read more →
    </a>
  </article>
))}
```

And render a single post:

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<article class="prose prose-indigo max-w-none">
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

---

## Step 9 — Static Assets

### `public/` — unprocessed assets

Files in `public/` are copied verbatim to the build output. Use this for:

- Favicons, `robots.txt`, `sitemap.xml`
- Fonts you're self-hosting
- Images that don't need optimization

Reference them with a root-relative path:

```astro
<img src="/images/hero.jpg" alt="Hero" class="w-full h-64 object-cover" />
```

### In Your Case

Your images are organized by category:

- `images/hero-image.jpg` — Hero background
- `images/bucatarii/` — Kitchen showroom photos (b1.jpg to b5.jpg)
- `images/bed/` — Furniture bedroom units (d1.jpg to d7.jpg)

**Move all of these to `public/images/`** at the same structure:

```
public/images/
  ├── hero-image.jpg
  ├── bucatarii/
  │   ├── b1.jpg
  │   ├── b2.jpg
  │   ├── b3.jpg
  │   ├── b4.jpg
  │   └── b5.jpg
  └── bed/
      ├── d1 (1).jpg
      ├── d3 (1).jpg
      ├── d4 (1).jpg
      ├── d5 (1).jpg
      ├── d6 (1).jpg
      └── d7 (1).jpg
```

Then in your components, use:

```astro
<!-- Hero background -->
<div style="background-image: url('./images/hero-image.jpg')">...</div>

<!-- Kitchen images -->
<img src="/images/bucatarii/b1.jpg" alt="Kitchen 1" class="w-full h-auto rounded-lg shadow-md object-cover" />

<!-- Furniture images -->
<img src="/images/bed/d1 (1).jpg" alt="Furniture 1" class="w-full h-auto rounded-lg shadow-md object-cover" />
```

Since your images don't need WebP conversion or responsive srcsets, using `public/` is simpler than `src/assets/`. Keep the paths exactly as they are in your HTML.

### `src/assets/` — optimized assets

Images imported from `src/assets/` are processed by Astro's built-in image optimization pipeline (WebP conversion, resizing, lazy loading):

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image
  src={heroImage}
  alt="Hero"
  width={1200}
  height={600}
  class="w-full h-64 object-cover rounded-xl"
/>
```

This outputs an `<img>` with correct `width`/`height` attributes (preventing layout shift), converts to WebP, and generates a srcset automatically.

### Fonts

For Google Fonts or self-hosted fonts, add them to `BaseLayout.astro`:

```astro
<head>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
    rel="stylesheet"
  />
</head>
```

Then reference in `tailwind.config.mjs`:

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
},
```

---

## Step 10 — Build, Preview, and Deploy

### Development server

```bash
npm run dev
# → http://localhost:4321
```

### Production build

```bash
npm run build
# Output goes to dist/
```

The `dist/` folder is a flat directory of `.html` files and assets — fully static, no server required.

### Preview the build locally

```bash
npm run preview
# Serves dist/ exactly as a CDN would
```

### Deploy

Astro's static output deploys to any static host with zero configuration:

**Vercel:**

```bash
npm install -g vercel
vercel
```

**Netlify:**

- Connect your Git repo → Set build command to `npm run build` → Set publish directory to `dist`

**Cloudflare Pages:**

- Connect repo → Build command: `npm run build` → Output directory: `dist`

**GitHub Pages:**

```bash
npx astro add github
```

Then push — GitHub Actions will build and deploy automatically.

### In Your Case

You currently have a live site at `tum-web-lab2.pages.dev` (as indicated by your CNAME file).

**For deployment, you have two options:**

1. **Keep Cloudflare Pages** (recommended, since you already have it set up):
   - Push your Astro project to the `lab-4-ssg-astro` branch
   - Cloudflare will auto-detect the `astro-project/` directory and build it
   - Set build command: `npm run build` (in the `astro-project` directory)
   - Output directory: `astro-project/dist`

2. **Use GitHub Pages** (simpler if you just want static hosting):
   ```bash
   cd astro-project
   npx astro add github
   git add .
   git commit -m "Add GitHub Pages deployment config"
   git push
   ```
   Then enable GitHub Pages in your repo settings, pointing to the `gh-pages` branch.

**Before deploying, verify locally:**

```bash
cd astro-project
npm run build
npm run preview
# Visit http://localhost:4321 and test all sections, links, and images
```

---

## Common Pitfalls

### 1. `className` vs `class`

Astro component templates use standard HTML attributes. Unlike JSX, it's `class` not `className`. If you paste React JSX directly, do a find-and-replace.

### 2. Forgetting `client:*` directives

If a React/Vue component needs interactivity and you forget the directive, it renders as static HTML and event handlers silently do nothing.

### 3. `window` / `document` in component scripts

The frontmatter (between `---`) runs in Node.js at build time. `window`, `document`, and `localStorage` don't exist there. Move browser-only code into a `<script>` tag or behind a `typeof window !== 'undefined'` guard.

### 4. Tailwind not purging correctly

If custom component paths aren't in the `content` array of `tailwind.config.mjs`, those classes will be purged in production. Double-check the glob patterns cover all file types you use.

### 5. Images returning 404 in build

Images imported from `public/` use root-relative URLs (`/images/foo.jpg`). Images from `src/assets/` must be imported in the frontmatter and used with `<Image />`. Mixing these up is a common source of broken images in production.

### 6. `getStaticPaths` is only for dynamic routes

You only need `getStaticPaths` in files with `[bracket]` route parameters. A regular page like `src/pages/about.astro` just renders statically — no extra config needed.

### In Your Case: Project-Specific Pitfalls

**Custom CSS with `grid-template-areas` and `@layer`:**

- Your Kitchens and Furniture sections use complex CSS Grid layouts defined in `input.css`
- Move these **entire rules** to `src/styles/global.css` under `@layer components`
- Astro will apply them globally, but only the CSS that matches Tailwind selectors gets class-based utilities
- Example structure in global.css:
  ```css
  @layer components {
    #kitchens-section {
      display: grid;
      grid-template-areas:
        "heading"
        "description"
        "button"
        "image1"
        /* ... */;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .kitchens-heading {
      grid-area: heading;
    }
    .kitchens-description {
      grid-area: description;
    }
    /* etc */
  }
  ```

**Custom color names are safe:**

- Your color tokens like `text-vivid-blue`, `bg-dark-kitchen-bg`, `text-footer-text` are defined in `tailwind.config.mjs`
- They will **always** work because Tailwind generates classes for them at build time
- No special handling needed — just use them confidently in your components

**Mascot animation pseudo-elements:**

- Your `#speech-balloon` uses `::before` and `::after` for the arrow pointer
- These must stay in `src/styles/global.css` — they can't be expressed with Tailwind utilities
- The DOM element HTML stays in `Mascot.astro`, the CSS styling goes to global.css
- The `animationend` event listener goes in `Mascot.astro`'s `<script>` tag

---

## Checklist

Use this to track your migration progress:

- [ ] New Astro project scaffolded
- [ ] `@astrojs/tailwind` installed and configured
- [ ] Old `tailwind.config.js` theme/plugins merged into `tailwind.config.mjs`
- [ ] Custom CSS / `@layer` rules moved to `src/styles/global.css`
- [ ] Base layout (`BaseLayout.astro`) created with `<slot />`
- [ ] All HTML pages converted to `src/pages/*.astro`
- [ ] Reusable HTML blocks extracted to `src/components/*.astro`
- [ ] Framework integrations added (React / Vue / Svelte) if needed
- [ ] Interactive components annotated with `client:*` directives
- [ ] Static assets moved to `public/` or `src/assets/`
- [ ] Dynamic routes set up with `getStaticPaths()`
- [ ] Markdown/MDX content moved to Content Collections with schemas
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` looks correct
- [ ] Deployed to chosen static host

### In Your Case

Your furniture shop site checklist:

- [ ] **Tailwind config:** Custom colors (vivid-blue, dark-almost-black, etc.) + desktop breakpoint merged into `tailwind.config.mjs`
- [ ] **Components created:**
  - [ ] `Header.astro` (with nav links array)
  - [ ] `Hero.astro` (with background image)
  - [ ] `Services.astro` (with 4 service cards data)
  - [ ] `Kitchens.astro` (with kitchen images + grid-area CSS)
  - [ ] `Furniture.astro` (with furniture grid images)
  - [ ] `Footer.astro` (with contact info + Google Maps iframe)
  - [ ] `Mascot.astro` (with animation script)
- [ ] **CSS migrations:**
  - [ ] All `#kitchens-section` grid layout rules moved to `src/styles/global.css`
  - [ ] All `#furniture-section` grid layout rules moved to `src/styles/global.css`
  - [ ] All `.mascot` animation keyframes moved to `src/styles/global.css`
  - [ ] All `.speech-balloon` pseudo-element styles moved to `src/styles/global.css`
- [ ] **Images organized:**
  - [ ] `public/images/hero-image.jpg` copied
  - [ ] `public/images/bucatarii/` directory with b1-b5.jpg
  - [ ] `public/images/bed/` directory with d1-d7.jpg
- [ ] **Homepage built:** `src/pages/index.astro` imports all 7 components in correct order
- [ ] **Tested locally:** `npm run dev` → all sections render, links work, images load, mascot animation plays
- [ ] **Built successfully:** `npm run build` → no errors
- [ ] **Preview works:** `npm run preview` → site looks identical to original
- [ ] **Deployed:** Pushed to Cloudflare Pages or GitHub Pages

---

_Built with Astro and Tailwind CSS — the modern stack for fast, content-first websites._
