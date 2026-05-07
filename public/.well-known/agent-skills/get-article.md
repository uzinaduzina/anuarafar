---
name: get-article
type: data
description: Retrieve metadata, abstract, and PDF location for a single AAF article by id.
---

# Fetch an AAF article

## Landing page

    https://anuar.iafar.ro/article/{id}

The HTML page shows authors, abstract (multilingual), keywords, DOI (when assigned), and the embedded PDF viewer.

## Metadata via manifest

To get article metadata programmatically, fetch the manifest at `https://anuar.iafar.ro/data/issues_manifest_user.js`, parse, and look up the article by `id` in the `articles` array.

Fields returned per article:

- `id`, `issue_id`, `series`, `section`
- `title`, `authors`, `affiliations`, `emails`
- `abstract` (and language variants `abstract_ro/en/de/fr`)
- `keywords` (and language variants)
- `pages_start`, `pages_end`
- `doi` (when assigned via Zenodo sync)
- `language`, `status`, `is_review`
- `pdf_path` — relative to the site root

## DOI policy

DOIs are minted via Zenodo for seria-3 articles after publication. Articles in seria-1 and seria-2 are publicly archived but may not have a DOI assigned.

## License

Series III articles are published under CC BY 4.0. Under this licence, any user — including AI agents — may read, download, distribute, index, crawl, perform text and data mining, and reuse the full text for any lawful purpose, provided that proper attribution is given to the author, journal, and original source (a link back to the article landing page satisfies the attribution requirement).

Series I (1932–1945) and Series II (1980–1996) are presented as a heritage digital archive; reuse of those scanned materials is governed individually per issue.
