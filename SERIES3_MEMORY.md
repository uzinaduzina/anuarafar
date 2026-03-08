# Series 3 Memory

## Editorial metadata rule
- Use one `abstract` field and one `keywords` field for published articles.
- Do not split metadata by language in the editorial logic.
- `abstract` starts immediately below the author line and ends strictly before the first keyword label.
- `keywords` collects all keyword blocks that appear in the PDF, in order, separated only by commas.
- Deduplicate only inside each keyword block/language, not across languages. If the same proper name appears in multiple language blocks, keep it in each block so the multilingual metadata remains complete.
- Supported labels include `Keywords`, `Cuvinte-cheie`, `Mots-clés`, `Schlüsselwörter`, `Parole chiave` and close variants.
- If an article has no abstract or no keywords block, leave the field empty.

## Review/notes cut rule
- For `NOTE DE LECTURĂ` and `RECENZII`, keep the page where the next note/review starts.
- Do not include the first page of a new non-review section in the previous review.

## Series 3 issue status
- `2021-2022` (`aaf-xxv-xxvi-2022`) rebuilt and normalized.
- `2023` (`aaf-xxvii-2023`) next in queue.
- `2024` and `2025` still pending under the same metadata rule.

## Important implementation note
- The UI now reads `article.abstract` and `article.keywords` first.
- Old split fields remain only as compatibility fallback.
- PWA cache for `/data/` must stay `network-first`, otherwise stale manifest data hides fixes.
