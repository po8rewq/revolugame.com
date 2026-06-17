# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**Custom assets:**
- `assets/scss/custom.scss` — site-wide SCSS overrides on top of the theme
- `assets/icons/` — custom SVG icons (coffee, news, notebook, package, brand-linkedin)

**Permalinks** are configured as `/p/:slug/` for posts and `/:slug/` for pages.
