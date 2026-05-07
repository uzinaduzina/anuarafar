---
name: browse-archive
type: navigation
description: Browse the AAF (Anuarul Arhivei de Folclor) journal archive by year, volume, or series.
---

# Browse the AAF archive

The journal archive is published at https://anuar.iafar.ro/archive .

## Series

The journal has three series:

- `seria-1` — Seria I (1932–1945)
- `seria-2` — Seria a II-a (1980–1998)
- `seria-3` — Seria a III-a (2002–present, peer-reviewed open access)

## Machine-readable manifest

The complete list of issues and articles is at:

    https://anuar.iafar.ro/data/issues_manifest_user.js

The file is JS-wrapped JSON. To parse: strip everything before the first `{` and any trailing `;`, then `JSON.parse`. The parsed object exposes `issues[]` and `articles[]`.

## URL patterns

- Issue page: `https://anuar.iafar.ro/archive/{slug}`
- Article landing: `https://anuar.iafar.ro/article/{id}`
- Article PDF: relative to the site root via `article.pdf_path`
- Issue PDF (full bound issue, when available): `issue.issue_pdf_path`

## License

Articles are published open access under CC BY-NC-SA 4.0 unless otherwise noted on the article page.
