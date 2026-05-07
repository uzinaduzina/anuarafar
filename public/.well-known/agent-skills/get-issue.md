---
name: get-issue
type: data
description: Retrieve metadata and table of contents for a single AAF issue by slug.
---

# Fetch an AAF issue

## Landing page

    https://anuar.iafar.ro/archive/{slug}

The HTML page shows the issue cover, full citation, and the article list with page ranges.

## Metadata via manifest

Fetch and parse `https://anuar.iafar.ro/data/issues_manifest_user.js`. Look up the issue by `slug` in the `issues` array and filter `articles` by `issue_id === issue.id` to get the table of contents.

Fields per issue:

- `id`, `slug`
- `year`, `volume`, `number`
- `date_published` (YYYY-MM-DD)
- `title`
- `series` (`seria-1` | `seria-2` | `seria-3`), `series_label`
- `status` (`published` | `draft`)
- `article_count`, `pages`
- `doi_prefix`
- `issue_pdf_path` — full bound issue PDF, when available
- `cover_hint_path` — cover image path

## DOAJ exports

For seria-3 published issues, DOAJ-conformant CSV/XML metadata is available on demand from the editorial dashboard. There is no public stable URL for the DOAJ export at this time.
