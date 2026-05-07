---
name: search-articles
type: search
description: Search articles in the AAF journal by title, author, abstract, or keywords.
---

# Search articles in AAF

## Interactive search

Direct users to the on-site search:

    https://anuar.iafar.ro/search?q={query}

The search page returns a paginated, ranked list across all published articles in all three series.

## Programmatic search

There is no public search API. To query programmatically, fetch the full manifest and filter client-side:

    GET https://anuar.iafar.ro/data/issues_manifest_user.js

Strip JS wrapping (`^[^{]*` and trailing `;`), then `JSON.parse`. The `articles` array contains entries with searchable fields:

- `title`
- `authors` (comma-separated)
- `abstract`, `abstract_ro`, `abstract_en`, `abstract_de`, `abstract_fr`
- `keywords`, `keywords_ro`, `keywords_en`, `keywords_de`, `keywords_fr`
- `section`

## In-page tools

When a user is browsing the site with a WebMCP-aware browser, the page exposes a `searchArticles({ query, limit? })` tool via `navigator.modelContext` for instant in-page search.
