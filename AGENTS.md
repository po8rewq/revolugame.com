# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Serve locally with live reload
hugo server

# Build for production (outputs to ./public)
hugo

# Create a new post from archetype
hugo new post/my-post-title/index.md
```

The theme is installed as a git submodule at `themes/hugo-theme-stack`. To update it, download the latest release from the [hugo-theme-stack repo](https://github.com/CaiJimmy/hugo-theme-stack/releases/latest) and replace the directory.

## Deployment

Pushes to `main` trigger a GitHub Actions workflow (`.github/workflows/hugo.yml`) that builds with Hugo 0.161.1 (extended) and deploys to GitHub Pages. The `./public` directory is the build artifact — don't commit it manually.

## Architecture

This is a Hugo static site using the [Stack theme](https://stack.jimmycai.com/).

**Content structure:**
- `content/post/` — blog posts, each in their own directory with `index.md` + assets
- `content/projects/` — project showcase pages (custom layout at `layouts/projects/`)
- `content/page/` — standalone pages (about, archives, search, courses, work)

**Post front matter** (from existing posts):
```yaml
title: "Post title"
description: Short description
image: cover-image.jpg   # featured image
date: 2024-01-15
categories:
  - tutorials            # or: games
tags:
  - react
  - typescript
```

**Custom layouts:** `layouts/projects/` overrides the theme's project list and single templates.

**AEO / AI SEO:** The site has an answer-engine optimization layer that should be preserved when changing content, layouts, or theme overrides.
- `layouts/_partials/head/custom.html` injects JSON-LD through the Stack theme's supported custom head hook.
- `layouts/_partials/head/schema.html` generates `Person`, `WebSite`, `ProfilePage`, `BlogPosting`, `CreativeWork`, and `BreadcrumbList` structured data.
- Do not copy or override `themes/hugo-theme-stack/layouts/_partials/head/head.html` just to add metadata. Use `layouts/_partials/head/custom.html` so future Stack theme updates remain compatible.
- Keep the canonical author/entity data in `config.yaml` under `params.author` accurate.
- Keep `static/robots.txt` and `static/llms.txt` aligned with the site's canonical URLs and key topic pages.
- New or updated posts should include a clear `description`, `date`, useful `tags`, and an early 2-4 sentence answer-ready summary that states the main takeaway directly.
- New or updated project pages should include `description`, `status`, `stack`, `projectUrl`, `sourceUrl` when available, and useful `tags`; `layouts/projects/single.html` renders these as visible project details and schema uses them.
- Topic/identity pages such as `content/page/about.md` and `content/page/topics.md` should link to the best supporting posts and projects, keeping the site's expertise areas explicit.
- After AEO-related changes, run `hugo` and check that generated JSON-LD remains valid if templates changed.

**Custom assets:**
- `assets/scss/custom.scss` — site-wide SCSS overrides on top of the theme
- `assets/icons/` — custom SVG icons (coffee, news, notebook, package, brand-linkedin)

**Permalinks** are configured as `/p/:slug/` for posts and `/:slug/` for pages.
