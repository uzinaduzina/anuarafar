from __future__ import annotations

import csv
import json
import re
import shutil
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter

REPO = Path('/Users/liviupop/Downloads/ojs_alternative_iafar/afar-ai')
ISSUE_ID = '2'
ISSUE_DIR = REPO / 'ingest/issues/aaf-xxvii-2023'
ARTICLES_DIR = ISSUE_DIR / 'articles'
SOURCE_PDF = ISSUE_DIR / 'source/issue.pdf'
BACKUP_ROOT = Path('/Users/liviupop/Downloads/ojs_alternative_iafar/pdf_recut_backups')
MANIFEST_PATHS = [
    REPO / 'public/data/issues_manifest_user.js',
    REPO / 'docs/data/issues_manifest_user.js',
    REPO / 'docs/anuarafar/data/issues_manifest_user.js',
]
ISSUES_CSV_PATHS = [
    REPO / 'public/data/issues.csv',
    REPO / 'docs/data/issues.csv',
    REPO / 'docs/anuarafar/data/issues.csv',
]

ENTRIES = [
    ('I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE', 'Ion Taloș', 'Arhiva de Folclor a Academiei Române în comparație cu Centro de Estudios Históricos și cu Deutsches Volksliedarchiv', 15),
    ('I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE', 'Ion Cuceu', 'Corpusul răspunsurilor la Chestionarele Ion Mușlea. O experiență editorială', 39),
    ('I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE', 'Cosmina-Maria Berindei', 'Răspunsurile la Chestionarul VII. Instrumente muzicale al Muzeului Limbii Române – Destinul unor manuscrise interbelice', 57),
    ('I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE', 'Anamaria Lisovschi', 'Construcția casei: locuri faste și nefaste', 71),
    ('I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE', 'Liviu-Ovidiu Pop', 'Fondul Fonograf al Arhivei de Folclor a Academiei Române', 85),
    ('I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE', 'Sanda Ignat', 'In Memoriam Hanni Markel (1939–2023)', 89),
    ('II. STUDII ȘI CERCETĂRI', 'Marin Marian-Bălașa', 'Introducere la „Maxima Varia” a etnoantropologiei sexului', 101),
    ('II. STUDII ȘI CERCETĂRI', 'Astrid Cambose', 'Reglementarea sexualității în lumea românească veche: amestecarea de sânge, malahia, curvia și alte săblazne', 105),
    ('II. STUDII ȘI CERCETĂRI', 'Mircea Păduraru', 'O introducere în etologia folclorului pornografic', 117),
    ('II. STUDII ȘI CERCETĂRI', 'Daria Ioan', 'Sexualitate, ascetism și teatralitate la comunitățile Hijra din subcontinentul indian', 137),
    ('II. STUDII ȘI CERCETĂRI', 'Marin Marian-Bălașa', 'Oglinzi ale realismului civic și ale interculturalității (etnoantropologie prismatică)', 143),
    ('II. STUDII ȘI CERCETĂRI', 'Bogdan Neagota', 'Neputincios din Iele. Un caz de boală culturală în Țara Românească, sfârșit de secol XVIII', 155),
    ('II. STUDII ȘI CERCETĂRI', 'Nicolae Mihai', '„Robul Măriei tale, Ene Seimenu, neputincios din Ele”. Notele imperfecte istoric... pe marginea unui fapt cultural', 165),
    ('II. STUDII ȘI CERCETĂRI', 'Cătălin Alexa', 'Portretul fotografic ca imagine a actorului ritual', 175),
    ('II. STUDII ȘI CERCETĂRI', 'Elena Bărbulescu', 'Etnologul și cele mai bune intenții ale cercetării', 193),
    ('II. STUDII ȘI CERCETĂRI', 'Zamfir Dejeu', 'Interferențe culturale în muzica și dansul tradițional din Transilvania', 205),
    ('II. STUDII ȘI CERCETĂRI', 'Constanța Cristescu', 'Contribuția școlii etnomuzicologice clujene la sistematica repertorială tipologică', 255),
    ('II. STUDII ȘI CERCETĂRI', 'Paul-Alexandru Remeș', 'Jocuri feciorești cu fată în Transilvania', 263),
    ('II. STUDII ȘI CERCETĂRI', 'Zoltan Gergely', 'Câteva considerații despre cercetarea muzicii populare în secolul XXI', 287),
    ('II. STUDII ȘI CERCETĂRI', 'Svetlana Badrajan, Vitalie Grib', 'Lidia Severin – o promotoare a cântecului folcloric în a doua jumătate a secolului XX, începutul secolului XXI', 295),
    ('II. STUDII ȘI CERCETĂRI', 'Liviu-Ovidiu Pop', 'Fantomele turcului mecanic. Imaginația populară față în față cu automatizarea', 307),
    ('III. RESTITUIRI', 'Alina Branda', 'Câteva considerații privind interviul cu profesorul universitar și cercetătorul Virgiliu Florea (1941–2019)', 321),
    ('III. RESTITUIRI', 'Virgiliu Florea', '„Din activitatea mea de folclorist” interviu realizat de conf. univ. dr. Alina Branda', 327),
    ('III. RESTITUIRI', 'Virgiliu Florea', 'Memoriu de activitate', 343),
    ('III. RESTITUIRI', 'Virgiliu Florea', 'Curriculum Vitae', 362),
    ('IV. NOTE DE LECTURĂ', 'Ileana Benga', 'Despre o masă rotundă: Rafinament și putere de pătrundere în Folclor, etnologie, antropologie de Sanda Golopenția', 369),
    ('IV. NOTE DE LECTURĂ', 'Sanda Golopenția', 'Cuvânt înainte', 373),
    ('IV. NOTE DE LECTURĂ', 'Elena Platon', 'Intermemoria etnologică', 375),
    ('IV. NOTE DE LECTURĂ', 'Eleonora Sava', 'Plante și scenarii magice', 381),
    ('IV. NOTE DE LECTURĂ', 'Ioana-Ruxandra Fruntelată', 'Explorări teoretice: în dialog cu etnologia Sandei Golopenția', 387),
    ('IV. NOTE DE LECTURĂ', 'Mihaela Călinescu', 'Mihai Pop – Repere identitare, influențe cosmopolite, reflectări afective', 399),
    ('IV. NOTE DE LECTURĂ', 'Ileana Benga', 'Spre altă minte transmisă', 413),
    ('IV. NOTE DE LECTURĂ', 'Bogdan Neagota', 'Iconografia vrăjitoriei în arta religioasă românească. Eseu de antropologie vizuală', 425),
    ('V. RECENZII', 'Marin Marian-Bălașa', '„Revista de etnografie și folclor / Journal of Ethnography and Folklore”, 1–2, 2022, București, Editura Academiei Române, 281 p., ISSN 0034–8198', 433),
    ('V. RECENZII', 'Marin Marian-Bălașa', 'Revista de etnografie și folclor / Journal of Ethnography and Folklore” 1–2/2023, București, Editura Academiei Române, 303 p., ISSN 0034–8198', 436),
    ('V. RECENZII', 'Theodor Constantiniu', 'Ross Cole, The Folk. Music, Modernity and the Political Imagination, Berkley, University of California Press, 2021, 276 p.', 439),
    ('V. RECENZII', 'Theodor Constantiniu', 'Constanța Cristescu, Un secol de etnomuzicologie românească. Parcurs și perspectivă în sistematica repertorială, București, Editura Muzicală, 2021, 241 p.', 443),
    ('V. RECENZII', 'Stelu Șerban', 'Sabrina Tosi Cambini, Altri confini. Storia, mobilità e migrazioni di una rete di famiglie rudari tra la Romania e l’Italia, Milano-Udine, Mimesis, 2021, 274 p.', 447),
    ('V. RECENZII', 'Iordan Datcu', 'Antoaneta Olteanu, Mitologie română, Târgoviște, Editura Cetatea de Scaun, 2021, I, 509 p.; II, 354 p.; III, 421 p.', 450),
    ('V. RECENZII', 'Maria Aldea', 'Constanța Vintilă, Giulia Calvi, Mária Pakucs-Willcocks, Nicoleta Roman, Michał Wasiucionek, Lux, modă și alte bagatele politicești în Europa de Sud-Est în secolele XVI‒XIX, București, Editura Humanitas, 2021, 431 p.', 452),
    ('V. RECENZII', 'Elena Bărbulescu', 'Marin Marian-Bălașa, Ochiul dracului și al lui Dumnezeu (mentalități economice tradiționale), București, Editura Muzicală, 2021, 620 p.', 459),
    ('V. RECENZII', 'Elena Bărbulescu', 'Valer Simion Cosma, Emanuel Modoc (edit.), Culese din rural, Sibiu, Editura Universității „Lucian Blaga”, 2022, 207 p.', 463),
    ('V. RECENZII', 'Bogdan Neagota', 'Vasile Mathe, Nicolae Cristea. Ultimul ceteraș din Poienile Mogoșului, comuna Mogoș (Alba). Film etnografic, Orma Sodalitas Anthropologica, 2022, 90 min.', 466),
    ('V. RECENZII', 'Bogdan Neagota', 'Hortensia Pop, Calna – Studiu etnografic și folcloric, Cluj-Napoca, Editura Risoprint, 2022, 271 p.', 467),
    ('V. RECENZII', 'Ileana Benga', '„Anuarul Institutului de Etnografie și Folclor «Constantin Brăiloiu»”. Serie nouă, tomul 32, 2021, București, Editura Academiei Române, 341 p.', 470),
    ('V. RECENZII', 'Ileana Benga', 'Ioana-Ruxandra Fruntelată, Despre interpretarea etnologică, București, Editura Etnologică, 2020, 218 p.', 483),
    ('V. RECENZII', 'Ileana Benga', 'Astrid Cambose, Cealaltă grădină. Cultura tradițională a morții la români, Cluj-Napoca, Editura Argonaut, 2019, 630 p.', 501),
    ('V. RECENZII', 'Ileana Benga', 'Cătălin Alexa, Ritualul Călușului în contextul sociocultural actual, Cluj-Napoca, Editura MEGA, 2022, 420 p.', 513),
    ('IN MEMORIAM', 'Acad. Mihai Bărbulescu', 'Răzvan Theodorescu (1939–2023)', 523),
]

KEYWORD_LABELS = [
    'Keywords:', 'Key words:', 'Cuvinte-cheie:', 'Cuvinte cheie:', 'Mots-clés:', 'Mots clés:',
    'Schlüsselworte:', 'Schlüsselwörter:', 'Parola chiave:', 'Parole chiave:'
]
INSTITUTION_HINTS = ['univers', 'institut', 'muze', 'academ', 'centr', 'college', 'facult', 'email', 'department', 'school']


def normalize(value: str) -> str:
    ascii_value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii').lower()
    return re.sub(r'[^a-z0-9]+', ' ', ascii_value).strip()


def normalize_keywords(raw: str) -> str:
    if not raw:
        return ''
    text = re.sub(r'\s+', ' ', raw.replace('\xa0', ' ')).strip().rstrip('.')
    parts = re.split(r'\s*[,;]\s*', text)
    out = []
    seen = set()
    for part in parts:
        cleaned = re.sub(r'\s+', ' ', part).strip().strip(' ,;.')
        if not cleaned:
            continue
        key = normalize(cleaned)
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(cleaned)
    return ', '.join(out)


def clean_text(value: str) -> str:
    return re.sub(r'\s+', ' ', value.replace('\xa0', ' ')).strip()


def is_keyword_line(line: str) -> str | None:
    lowered = line.lower()
    for label in KEYWORD_LABELS:
        if label.lower() in lowered:
            return label
    return None


def marker_count_from_author_line(line: str) -> int:
    match = re.search(r'(\*+)$', line.strip())
    return len(match.group(1)) if match else 0


def find_author_line(lines: list[str], authors: str) -> int:
    key = normalize(authors)
    if key:
        for idx, line in enumerate(lines):
            if key in normalize(line):
                return idx
    surname_tokens = [normalize(part.split()[-1]) for part in authors.split(',') if part.strip()]
    for idx, line in enumerate(lines):
        nline = normalize(line)
        if any(tok and tok in nline for tok in surname_tokens):
            return idx
    return -1


def looks_like_affiliation(text: str) -> bool:
    lowered = text.lower()
    return any(h in lowered for h in INSTITUTION_HINTS)


def extract_front_matter(pdf_path: Path, authors: str) -> dict[str, str]:
    reader = PdfReader(str(pdf_path))
    text = '\n'.join((reader.pages[i].extract_text() or '') for i in range(min(2, len(reader.pages))))
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    author_idx = find_author_line(lines, authors)
    keyword_indexes = [idx for idx, line in enumerate(lines) if is_keyword_line(line)]
    first_keyword_idx = keyword_indexes[0] if keyword_indexes else -1

    abstract_value = ''
    if author_idx >= 0 and first_keyword_idx > author_idx:
        abstract_parts = [line for line in lines[author_idx + 1:first_keyword_idx] if line not in {'*', '**'}]
        abstract_value = clean_text(' '.join(abstract_parts))

    keyword_value = ''
    if keyword_indexes:
        blocks = []
        idx = first_keyword_idx
        while idx < len(lines):
            label = is_keyword_line(lines[idx])
            if not label:
                break
            start = lines[idx].lower().find(label.lower()) + len(label)
            parts = [lines[idx][start:].strip()]
            idx += 1
            if not parts[0].rstrip().endswith('.'):
                while idx < len(lines):
                    if is_keyword_line(lines[idx]):
                        break
                    parts.append(lines[idx])
                    if lines[idx].rstrip().endswith('.'):
                        idx += 1
                        break
                    idx += 1
            blocks.append(normalize_keywords(' '.join(parts)))
        merged = []
        for block in blocks:
            merged.extend(item.strip() for item in block.split(',') if item.strip())
        keyword_value = ', '.join(merged)

    affiliation = ''
    if author_idx >= 0:
        marker_count = marker_count_from_author_line(lines[author_idx])
        if marker_count:
            expected_prefix = '*' * marker_count
            for line in lines[author_idx + 1:]:
                if line.startswith(expected_prefix):
                    candidate = clean_text(line[marker_count:])
                    if looks_like_affiliation(candidate):
                        affiliation = candidate
                        break

    return {
        'abstract': abstract_value,
        'keywords': keyword_value,
        'affiliations': affiliation,
    }


def parse_manifest(path: Path) -> dict:
    text = path.read_text(encoding='utf-8')
    prefix = 'window.__USER_MANIFEST_OVERRIDE = '
    return json.loads(text[len(prefix):].rstrip(' ;\n'))


def dump_manifest(path: Path, data: dict) -> None:
    prefix = 'window.__USER_MANIFEST_OVERRIDE = '
    path.write_text(prefix + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';', encoding='utf-8')


def build_entries() -> list[dict]:
    built = []
    for index, (section, authors, title, start) in enumerate(ENTRIES):
        if index < len(ENTRIES) - 1:
            next_section, _, _, next_start = ENTRIES[index + 1]
            if section == 'V. RECENZII' and next_section == 'V. RECENZII':
                end = next_start
            else:
                end = next_start - 1
        else:
            end = 526
        built.append({
            'section': section,
            'authors': authors,
            'title': title,
            'pages_start': str(start),
            'pages_end': str(end),
            'is_review': 'true' if section == 'V. RECENZII' else 'false',
        })
    return built


def backup_articles_dir() -> None:
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup_dir = BACKUP_ROOT / f'aaf-xxvii-2023-articles-{timestamp}'
    if ARTICLES_DIR.exists():
        shutil.copytree(ARTICLES_DIR, backup_dir)


def old_issue_articles() -> list[dict]:
    manifest = parse_manifest(MANIFEST_PATHS[0])
    articles = [a for a in manifest['articles'] if str(a.get('issue_id')) == ISSUE_ID]
    articles.sort(key=lambda a: int(str(a.get('pages_start') or '0')))
    return articles


def rebuild_pdfs(entries: list[dict], current_articles: list[dict]) -> list[dict]:
    if len(entries) != len(current_articles):
        raise RuntimeError(f'Entry count mismatch: {len(entries)} vs {len(current_articles)}')
    reader = PdfReader(str(SOURCE_PDF))
    for entry, current in zip(entries, current_articles, strict=True):
        pdf_path = REPO / current['pdf_path']
        pdf_path.parent.mkdir(parents=True, exist_ok=True)
        writer = PdfWriter()
        start = int(entry['pages_start'])
        end = int(entry['pages_end'])
        for page_number in range(start - 1, end):
            writer.add_page(reader.pages[page_number])
        with pdf_path.open('wb') as fh:
            writer.write(fh)
        entry['id'] = str(current['id'])
        entry['pdf_path'] = current['pdf_path']
        entry['md_path'] = current.get('md_path', '')
    return entries


def safe_old_affiliation(old: dict) -> str:
    value = clean_text(str(old.get('affiliations') or ''))
    if not value:
        return ''
    if len(value) > 140:
        return ''
    if value.endswith(('unde', 'care', 'și', 'sau')):
        return ''
    return value


def rebuild_manifest(entries: list[dict], current_articles: list[dict]) -> None:
    current_by_id = {str(article['id']): article for article in current_articles}
    for manifest_path in MANIFEST_PATHS:
        data = parse_manifest(manifest_path)
        rest = [a for a in data['articles'] if str(a.get('issue_id')) != ISSUE_ID]
        new_issue_articles = []
        for entry in entries:
            old = current_by_id[entry['id']]
            extracted = extract_front_matter(REPO / entry['pdf_path'], entry['authors'])
            affiliation = extracted['affiliations'] or safe_old_affiliation(old)
            article = {
                'id': entry['id'],
                'issue_id': ISSUE_ID,
                'title': entry['title'],
                'authors': entry['authors'],
                'affiliations': affiliation,
                'emails': old.get('emails', ''),
                'abstract': extracted['abstract'],
                'abstract_ro': '',
                'abstract_en': '',
                'abstract_de': '',
                'abstract_fr': '',
                'keywords': extracted['keywords'],
                'keywords_ro': '',
                'keywords_en': '',
                'keywords_de': '',
                'keywords_fr': '',
                'pages_start': entry['pages_start'],
                'pages_end': entry['pages_end'],
                'doi': old.get('doi', ''),
                'language': old.get('language', 'ro') or 'ro',
                'status': 'published',
                'section': entry['section'],
                'series': 'seria-3',
                'pdf_path': entry['pdf_path'],
                'md_path': entry['md_path'],
                'conf_title': old.get('conf_title', ''),
                'conf_authors': old.get('conf_authors', ''),
                'conf_keywords_ro': old.get('conf_keywords_ro', ''),
                'conf_keywords_en': old.get('conf_keywords_en', ''),
                'conf_abstract': old.get('conf_abstract', ''),
                'is_review': entry['is_review'],
                'extract_front_source': old.get('extract_front_source', ''),
                'extract_full_source': old.get('extract_full_source', ''),
                'extract_quality': old.get('extract_quality', ''),
            }
            new_issue_articles.append(article)

        for issue in data['issues']:
            if str(issue.get('id')) == ISSUE_ID:
                issue['article_count'] = str(len(entries))
        data['articles'] = rest + new_issue_articles
        data['generated_at'] = datetime.now(timezone.utc).isoformat()
        dump_manifest(manifest_path, data)


def rewrite_issue_csv() -> None:
    for csv_path in ISSUES_CSV_PATHS:
        with csv_path.open('r', encoding='utf-8', newline='') as fh:
            rows = list(csv.DictReader(fh))
        if not rows:
            continue
        headers = list(rows[0].keys())
        for row in rows:
            if row.get('id') == ISSUE_ID:
                row['article_count'] = str(len(ENTRIES))
        with csv_path.open('w', encoding='utf-8', newline='') as fh:
            writer = csv.DictWriter(fh, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)


def main() -> None:
    backup_articles_dir()
    current_articles = old_issue_articles()
    entries = build_entries()
    rebuilt = rebuild_pdfs(entries, current_articles)
    rebuild_manifest(rebuilt, current_articles)
    rewrite_issue_csv()
    print(f'Rebuilt {len(rebuilt)} entries for issue {ISSUE_ID}.')


if __name__ == '__main__':
    main()
