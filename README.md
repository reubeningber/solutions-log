# Solutions Log

A lightweight Eleventy site for tracking the engineering solutions, decisions, and outcomes I drive as an EM—so they’re easy to review, search, and share.

## ✨ Features
- Clean cards on the homepage (sorted newest → oldest)
- Compact tag chips + client-side filtering
- Nicely formatted references (Jira keys, GitHub PRs, `Label:https://…`, plain URLs)
- Entry pages with tags + references footer
- Deployed on GitHub Pages; gated by Cloudflare Access

## 🧱 Tech
- [Eleventy (11ty)](https://www.11ty.dev/)
- Nunjucks templates
- Minimal CSS (Pico/Zinc-inspired)
- GitHub Actions → GitHub Pages
- Cloudflare (DNS + Zero Trust Access)

## 🚀 Getting started
```bash
# Node 20+
npm ci
npm run dev      # local dev at http://localhost:8080 (or your configured port)
npm run build    # outputs to _site/
```

## 📁 Project layout
src/
  assets/              # static assets (copied to /assets)
  index.njk            # homepage (cards + filters)
  entry.njk            # single entry layout
  content/             # your markdown entries (YYYY-MM-DD-slug.md)
.eleventy.js           # Eleventy config (collections, filters, passthrough)

## ✍️ Writing an entry
Create a file in `src/content/` named `YYYY-MM-DD-title.md`:

```
---
title: Dismissable Callout – A/B Testing
date: 2025-09-02
layout: entry.njk
tags:
  - Reusability
  - Quality / Standards
references:
  - ET-2356
  - engagement-templates 12480
  - Design brief:https://example.com/brief
---

### Context
Short context paragraph here…

### Decision / Action
What I decided / did…

### Outcome / Impact
Impact, metrics, or follow-ups…
```

## Tags & filtering

- Tags appear as chips and drive the filter bar on the homepage.
- Matching uses **slugified** tags under the hood (e.g., Quality / Standards → quality-standards).

## References

The site normalizes references from front matter:

- ET-1234 → links to Jira https://businessinsider.atlassian.net/browse/ET-1234 with label **“Jira: ET-1234”**
- repo-name 1234 → links to https://github.com/businessinsider/repo-name/pull/1234 with label **“PR #1234”**
- Text:https://… → label **Text** linking to that URL
- Plain https://… → URL as label
- Anything else → shown as plain text

## 🔐 Deploy

This repo uses a simple GitHub Actions workflow to build _site/ and publish to **GitHub Pages**. A custom domain (e.g. solutions.reubeningber.com) is proxied through **Cloudflare** and protected with **Access** (Zero Trust). No client-side encryption is required.

> If you switch to a custom domain, set pathPrefix: "/" in .eleventy.js and ensure _site/CNAME contains your domain.

## 🧪 Local tips

- If styles look off, confirm eleventyConfig.addPassthroughCopy({ "src/assets": "assets" }) is present.
- To clear a saved tag filter in the browser: localStorage.removeItem('sl:tag').

## 📄 License

MIT (personal project).