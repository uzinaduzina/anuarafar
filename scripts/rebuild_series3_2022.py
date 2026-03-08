from __future__ import annotations

import csv
import json
import re
import shutil
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


REPO = Path("/Users/liviupop/Downloads/ojs_alternative_iafar/afar-ai")
ISSUE_DIR = REPO / "ingest/issues/aaf-xxv-xxvi-2022"
ARTICLES_DIR = ISSUE_DIR / "articles"
SOURCE_PDF = ISSUE_DIR / "source/issue.pdf"
BACKUP_ROOT = Path("/Users/liviupop/Downloads/ojs_alternative_iafar/pdf_recut_backups")
MANIFEST_PATHS = [
    REPO / "public/data/issues_manifest_user.js",
    REPO / "docs/data/issues_manifest_user.js",
    REPO / "docs/anuarafar/data/issues_manifest_user.js",
]
ISSUES_CSV_PATHS = [
    REPO / "public/data/issues.csv",
    REPO / "docs/data/issues.csv",
    REPO / "docs/anuarafar/data/issues.csv",
]


ENTRIES = [
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Ion Taloș", "Un nou început", 13),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Ion Cuceu", "Cercetările etnologice zonale la Cluj", 17),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Elena Hlinca Drăgan", "Arhiva de Folclor Cluj – O realitate acceptată", 29),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Ion H. Ciubotaru", "Un vrednic urmaș al lui Ion Mușlea", 45),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Sanda Ignat", "Etnologul Ion Cuceu la 80 de Ani. O viață închinată Arhivei de Folclor", 59),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Ileana Benga", "In honorem Sabina Ispas", 67),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Nicolae Constantinescu", "Sanda Golopenția: modelul și modelele", 89),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Zoltán Gergely", "In memoriam István Almási (1934–2021)", 99),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Ilie Moise", "Profesorul Virgiliu Florea și Sibiul", 105),
    (
        "I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI",
        "Amalia Pavelescu",
        "Relația dintre Gh. Pavelescu și Ion Mușlea – de la devenire, la roade, în studierea culturii tradiționale și desăvârșirea unei frumoase prietenii",
        115,
    ),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Iordan Datcu", "G.T. Kirileanu și Petru Caraman", 123),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Rodica Raliade", "Itinerariu bibliografic", 127),
    ("I. ARHIVA DE FOLCLOR A ACADEMIEI ROMÂNE LA 90 DE ANI", "Lucia Cireș", "Gânduri la apariția Anuarului Arhivei de Folklor, seria a 3-a", 133),
    (
        "II. STUDII ȘI CERCETĂRI",
        "Ion Taloș",
        "„Vechea și noua Dacie Germană”, de Johannes Tröster, sursă documentară pentru antropologia culturală a secolului al XVII-lea la români",
        145,
    ),
    (
        "II. STUDII ȘI CERCETĂRI",
        "Ioan Augustin Goia",
        "Considerații privind procesul istoric al configurării identităților zonale rurale în nord vestul Transilvaniei",
        167,
    ),
    ("II. STUDII ȘI CERCETĂRI", "Sanda Golopenția", "Trei cuvinte magice", 185),
    ("II. STUDII ȘI CERCETĂRI", "Cristina Florescu", "Proiecții lexicografice asupra gândirii contemporane", 195),
    ("II. STUDII ȘI CERCETĂRI", "Elena Platon", "Metafore ale facerii în imaginarul folcloric", 203),
    ("II. STUDII ȘI CERCETĂRI", "Ela Cosma", "Etnogonie mitică și etnogeneză istorică în spațiul românesc. teorie, metode, izvoare", 219),
    ("II. STUDII ȘI CERCETĂRI", "Anamaria Iuga", "Patrimoniul imaterial valorificat într-un geoparc", 229),
    ("II. STUDII ȘI CERCETĂRI", "Nicolae Panea", "Antropologia franceză între două colocvii cardinale (1977-2003)", 243),
    ("II. STUDII ȘI CERCETĂRI", "Narcisa Știucă", "Fotografia, martor vizual în cercetarea de teren", 261),
    (
        "II. STUDII ȘI CERCETĂRI",
        "Ioana-Ruxandra Fruntelată",
        "Cercetarea tipologică a folclorului literar: perspective actuale asupra tipologiilor narative",
        267,
    ),
    ("II. STUDII ȘI CERCETĂRI", "Otilia Hedeșan", "Cunoștințe și valori ale unei femei din Europa de Răsărit la începutul mileniului trei", 279),
    ("II. STUDII ȘI CERCETĂRI", "Emil Țîrcomnicu", "Sărbători, obiceiuri, credințe la românii din satul Gradskovo (Serbia)", 295),
    ("II. STUDII ȘI CERCETĂRI", "Annemarie Sorescu-Marinković", "Biserică, religiozitate populară și oameni ai locului. O perspectivă din Serbia de Răsărit", 313),
    ("II. STUDII ȘI CERCETĂRI", "Paul Drogeanu", "Cântarea bunului păstor", 333),
    (
        "II. STUDII ȘI CERCETĂRI",
        "Laura Jiga Iliescu",
        "Propunere metodologică pentru abordarea integrativă a fenomenelor religioase. O perspectivă folcloristică",
        339,
    ),
    ("II. STUDII ȘI CERCETĂRI", "Astrid Cambose", "Prezentul crucilor de jurământ din Oltenia – între tradiție, ordine și interdicție", 353),
    ("II. STUDII ȘI CERCETĂRI", "Corina Iosif", "Sisteme normative în Țara Oașului: crima ca indice al unității morale comunitare", 373),
    ("II. STUDII ȘI CERCETĂRI", "Tünde Komáromi", "Criză și disconfort moral: păcatul unei femei bătrâne, fost cantor romano-catolic", 383),
    ("II. STUDII ȘI CERCETĂRI", "Elena Bărbulescu", "Cin’ să țeasă cămașă de COVID? O uliță de sat transilvan în fața pandemiei", 393),
    ("II. STUDII ȘI CERCETĂRI", "Anamaria Lisovschi", "De-ale casei și gospodăriei. Chestionarul X din Fondul „Ion Mușlea”", 403),
    (
        "II. STUDII ȘI CERCETĂRI",
        "Camelia Burghele",
        "Succese feminine. Fals tratat despre făcutul gârtenilor și keoaștelor (sarmalelor) în satele de pe Valea Barcăului (Sălaj)",
        413,
    ),
    ("II. STUDII ȘI CERCETĂRI", "Eleonora Sava", "Familia la masă. Memorie individuală și memorie familială în caietele cu rețete culinare", 425),
    ("II. STUDII ȘI CERCETĂRI", "Mihaela Bucin", "Redescoperirea vieții și activității unei familii interbelice: Ion și Sanda Mateiu", 439),
    (
        "II. STUDII ȘI CERCETĂRI",
        "Nicolae Mihai",
        "„Ritual memorial” și „scenografie rurală”. O lectură etnologică a instrucțiunilor societății „Mormintele Eroilor căzuți în Război”, referitoare la organizarea zilei „Eroilor Neamului” (1920)",
        455,
    ),
    ("II. STUDII ȘI CERCETĂRI", "Radu Toader", "Pace și război. O privire asupra textelor Bibliei", 467),
    ("II. STUDII ȘI CERCETĂRI", "Ioan Haplea", "Despre variațiune și ornamentică", 485),
    ("II. STUDII ȘI CERCETĂRI", "Lucia Iștoc", "Planul variațional în cântecul propriu-zis", 503),
    ("II. STUDII ȘI CERCETĂRI", "Zamfir Dejeu", "Ritmul sincopat amfibrahic descendent în context muzical coregrafic", 519),
    ("II. STUDII ȘI CERCETĂRI", "Theodor Constantiniu", "Etnomuzicologia și obiectul ei de studiu. O încercare de evaluare și sistematizare", 537),
    ("III. RESTITUIRI", "Traian Gherman", "Urme preistorice în colinde din Ardeal", 551),
    ("III. RESTITUIRI", "Bogdan Neagota", "Rădăcinile preistorice ale colindelor românești arhaice. Note pe marginea studiului lui Traian Gherman", 571),
    ("IV. NOTE DE LECTURĂ", "Ileana Benga", "Eroism şi sacrificiu în Împăratul Traian și conștiința romanității românilor de Ion Taloş", 581),
    (
        "V. RECENZII",
        "Silvia Ciubotaru",
        "Nicolae Edroiu, Plugul în Țările Române (până în secolul al XVIII-lea), Cluj-Napoca, Editura Școala Ardeleană, 2017, 223 p.",
        609,
    ),
    (
        "V. RECENZII",
        "Maria Aldea",
        "Petru Caraman, Restituiri etnologice, ediție îngrijită, introducere și notă asupra ediției de Ion H. Ciubotaru, Iași, Editura Universității „Alexandru Ioan Cuza”, 2018, 688 p. cu ilustrații",
        614,
    ),
    (
        "V. RECENZII",
        "Emil Țîrcomnicu",
        "Dorin Lozovanu, Populația românească din Peninsula Balcanică. Studiu antropogeografic, Academia Română – Institutul de Arheologie, Iași, Muzeul Brăilei „Carol I”, Institutul „Eudoxiu Hurmuzachi” pentru Românii de Pretutindeni, colecția Basarabica nr. 16, coord. Victor Spinei, Ionel Cândea, Editura Academiei Române – Editura Istros, București – Brăila, 2019, 417 p. + mapă cu 73 hărți",
        619,
    ),
    (
        "V. RECENZII",
        "Valentyna Symionka",
        "Nicolae Saramandu, Emil Țîrcomnicu, Manuela Nevaci, Cătălin Alexa, „Lecturi vizuale” etnolingvistice la aromânii din Republica Macedonia. Ohrida, Struga, Crușova. Memorie, tradiție, grai, patrimoniu, Societatea de Cultură Macedo-Română, București, Editura Universității din București, 2018, 196 p.",
        622,
    ),
    (
        "V. RECENZII",
        "Maria Năstase",
        "Nistor Bardu, Emil Țîrcomnicu, Cătălin Alexa, Stoica Lascu, Ioana Iancu, „Lecturi vizuale” etnologice la aromânii din Republica Macedonia. Regiunea Bitolia. Memorie, tradiție, grai, patrimoniu, Societatea de Cultură Macedo-Română, Editura Etnologică, 2018, 196 p.",
        625,
    ),
    (
        "V. RECENZII",
        "Stelu Șerban",
        "Annemarie Sorescu-Marinković / Thede Kahl / Biljana Sikimić (eds.), Boyash Studies: Researching “Our People”, Berlin, Frank & Timme Verlag für wissenschaftliche Literatur, 2021, 466 p.",
        628,
    ),
    (
        "V. RECENZII",
        "Ionucu Pop",
        "Constantin Eretescu, Moartea lui Patroclu: studii și articole de etnologie, București, Spandugino, 2020, ISBN 978–606-8944–47-0, 375 p. [The Death of Patroclus: ethnological studies and articles]",
        631,
    ),
    ("V. RECENZII", "Gabriel Cătălin Stoian", "Iordan Datcu, M-au onorat cu epistolele lor, București, RCR Editorial, 2019, 414 p.", 634),
    (
        "V. RECENZII",
        "Ionucu Pop",
        "Corin Braga (edit.), Enciclopedia imaginariilor din România, First vol., Imaginar literar. Coordinated by Adrian Tudurachi. Iași, Polirom, 2020, 440 p. [The Encyclopaedia of Romanian Imaginaries, Volume I: Literary Imaginary]",
        636,
    ),
    (
        "V. RECENZII",
        "Ileana Benga",
        "Laura Ioana Toader, Laptele matern și aburul hranei. Contexte etnologice. Prefață de prof. univ. emerit dr. Silviu Angelescu. București, Editura Etnologică, 2020, 956 p.",
        640,
    ),
    ("V. RECENZII", "Liviu Ovidiu Pop", "Vintilă Mihăilescu, În căutarea corpului regăsit. O ego-analiză a spitalului, Iași, Editura Polirom, 2019, 248 p.", 652),
    (
        "V. RECENZII",
        "Tünde Komáromi",
        "„MARTOR. Revistă de antropologie a Muzeului Țăranului Român”, nr. 24/2019, Politics of Memory: the Collecting, Storage, Ownership and Selective Disclosure of Archival Material [Politici ale memoriei: colecționare, depozitare, proprietate și dezvăluire selectivă a materialelor de arhivă]. Coordonatori: Corina Iosif, Bogdan Iancu, Iris Șerban",
        654,
    ),
    (
        "V. RECENZII",
        "Paul Alexandru Remeș",
        "Sándor Varga, Two Traditional Central Transylvanian Dances and Their Economic and Cultural/ Political Background, in “Acta Ethnographica Hungarica” vol. 65, issue 1, 2020, p. 39–64",
        656,
    ),
]


def normalize(value: str) -> str:
    ascii_value = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    return re.sub(r"[^a-z0-9]+", " ", ascii_value).strip()


def slugify(value: str) -> str:
    value = normalize(value)
    value = value.replace(" ", "-")
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value[:180]


def normalize_keywords(raw: str) -> str:
    if not raw:
        return ""
    text = re.sub(r"\s+", " ", raw).strip().rstrip(".")
    parts = re.split(r"\s*[,;]\s*", text)
    deduped = []
    seen = set()
    for part in parts:
        cleaned = re.sub(r"\s+", " ", part).strip().strip(" ,;.")
        if not cleaned:
            continue
        key = normalize(cleaned)
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(cleaned)
    return ", ".join(deduped)


KEYWORD_LABELS = [
    "Keywords:",
    "Key words:",
    "Cuvinte-cheie:",
    "Cuvinte cheie:",
    "Mots-clés:",
    "Mots clés:",
    "Schlüsselwörter:",
    "Parole chiave:",
]


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def is_keyword_line(line: str) -> str | None:
    lowered = line.lower()
    for label in KEYWORD_LABELS:
        if label.lower() in lowered:
            return label
    return None


def find_author_line(lines: list[str], authors: str) -> int:
    author_key = normalize(authors)
    if author_key:
        for idx, line in enumerate(lines):
            if author_key in normalize(line):
                return idx
    surname_tokens = [normalize(part.split()[-1]) for part in authors.split(",") if part.strip()]
    for idx, line in enumerate(lines):
        normalized_line = normalize(line)
        if any(token and token in normalized_line for token in surname_tokens):
            return idx
    return -1


def extract_front_matter_from_pdf(pdf_path: Path, authors: str) -> dict[str, str]:
    reader = PdfReader(str(pdf_path))
    text = "\n".join((reader.pages[i].extract_text() or "") for i in range(min(2, len(reader.pages))))
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    keyword_indexes = [idx for idx, line in enumerate(lines) if is_keyword_line(line)]
    if not keyword_indexes:
        return {"abstract": "", "keywords": ""}

    first_keyword_idx = keyword_indexes[0]
    author_idx = find_author_line(lines, authors)
    if author_idx < 0 or author_idx >= first_keyword_idx:
        return {"abstract": "", "keywords": ""}

    abstract_parts = []
    for line in lines[author_idx + 1:first_keyword_idx]:
        if line in {"*", "**"}:
            continue
        abstract_parts.append(line)
    abstract_value = clean_text(" ".join(abstract_parts))

    keyword_blocks = []
    idx = first_keyword_idx
    while idx < len(lines):
        label = is_keyword_line(lines[idx])
        if not label:
            break
        start = lines[idx].lower().find(label.lower()) + len(label)
        parts = [lines[idx][start:].strip()]
        idx += 1
        if not parts[0].rstrip().endswith("."):
            while idx < len(lines):
                if is_keyword_line(lines[idx]):
                    break
                parts.append(lines[idx])
                if lines[idx].rstrip().endswith("."):
                    idx += 1
                    break
                idx += 1
        keyword_blocks.append(normalize_keywords(" ".join(parts)))

    deduped = []
    for block in keyword_blocks:
        deduped.extend(item.strip() for item in block.split(",") if item.strip())

    return {
        "abstract": abstract_value,
        "keywords": ", ".join(deduped),
    }


def parse_manifest(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    prefix = "window.__USER_MANIFEST_OVERRIDE = "
    return json.loads(text[len(prefix):].rstrip(" ;\n"))


def dump_manifest(path: Path, data: dict) -> None:
    prefix = "window.__USER_MANIFEST_OVERRIDE = "
    path.write_text(prefix + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";", encoding="utf-8")


def build_entries() -> list[dict]:
    built = []
    for index, (section, authors, title, start) in enumerate(ENTRIES):
        if index < len(ENTRIES) - 1:
            next_start = ENTRIES[index + 1][3]
            if section == "V. RECENZII":
                end = next_start
            else:
                end = next_start - 1
        else:
            end = 660
        built.append(
            {
                "section": section,
                "authors": authors,
                "title": title,
                "pages_start": str(start),
                "pages_end": str(end),
                "is_review": "true" if section == "V. RECENZII" else "false",
            }
        )
    return built


def backup_articles_dir() -> None:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_dir = BACKUP_ROOT / f"aaf-xxv-xxvi-2022-articles-{timestamp}"
    if ARTICLES_DIR.exists():
        shutil.copytree(ARTICLES_DIR, backup_dir)


def rebuild_pdfs(entries: list[dict]) -> list[dict]:
    reader = PdfReader(str(SOURCE_PDF))
    if ARTICLES_DIR.exists():
        shutil.rmtree(ARTICLES_DIR)
    ARTICLES_DIR.mkdir(parents=True, exist_ok=True)

    for idx, entry in enumerate(entries, start=1):
        slug = slugify(entry["title"])
        pdf_name = f"{idx:03d}-{slug}.pdf"
        writer = PdfWriter()
        start = int(entry["pages_start"])
        end = int(entry["pages_end"])
        for page_number in range(start - 1, end):
            writer.add_page(reader.pages[page_number])
        pdf_path = ARTICLES_DIR / pdf_name
        with pdf_path.open("wb") as fh:
            writer.write(fh)
        entry["pdf_name"] = pdf_name
        entry["pdf_path"] = f"ingest/issues/aaf-xxv-xxvi-2022/articles/{pdf_name}"
        entry["md_path"] = f"ingest/issues/aaf-xxv-xxvi-2022/md/{idx:03d}-{slug}.md"
    return entries


def metadata_map(old_articles: list[dict]) -> dict[tuple[str, str], dict]:
    mapping = {}
    for article in old_articles:
        key = (normalize(str(article.get("title", ""))), normalize(str(article.get("authors", ""))))
        mapping[key] = article
    return mapping


def rebuild_manifest(entries: list[dict]) -> None:
    public_manifest = parse_manifest(MANIFEST_PATHS[0])
    old_articles = [a for a in public_manifest["articles"] if str(a.get("issue_id")) == "1"]
    rest_articles = [a for a in public_manifest["articles"] if str(a.get("issue_id")) != "1"]
    lookup = metadata_map(old_articles)

    new_issue_articles = []
    for idx, entry in enumerate(entries, start=1):
        key = (normalize(entry["title"]), normalize(entry["authors"]))
        old = lookup.get(key, {})
        extracted = extract_front_matter_from_pdf(REPO / entry["pdf_path"], entry["authors"])
        article = {
            "id": str(idx),
            "issue_id": "1",
            "title": entry["title"],
            "authors": entry["authors"],
            "affiliations": old.get("affiliations", "") if old else "",
            "emails": old.get("emails", "") if old else "",
            "abstract": extracted["abstract"],
            "abstract_ro": "",
            "abstract_en": "",
            "abstract_de": "",
            "abstract_fr": "",
            "keywords": extracted["keywords"],
            "keywords_ro": "",
            "keywords_en": "",
            "keywords_de": "",
            "keywords_fr": "",
            "pages_start": entry["pages_start"],
            "pages_end": entry["pages_end"],
            "doi": old.get("doi", "") if old else "",
            "language": old.get("language", "ro") if old else "ro",
            "status": "published",
            "section": entry["section"],
            "series": "seria-3",
            "pdf_path": entry["pdf_path"],
            "md_path": entry["md_path"],
            "conf_title": old.get("conf_title", "") if old else "",
            "conf_authors": old.get("conf_authors", "") if old else "",
            "conf_keywords_ro": old.get("conf_keywords_ro", "") if old else "",
            "conf_keywords_en": old.get("conf_keywords_en", "") if old else "",
            "conf_abstract": old.get("conf_abstract", "") if old else "",
            "is_review": entry["is_review"],
            "extract_front_source": old.get("extract_front_source", "") if old else "",
            "extract_full_source": old.get("extract_full_source", "") if old else "",
            "extract_quality": old.get("extract_quality", "") if old else "",
        }
        new_issue_articles.append(article)

    for manifest_path in MANIFEST_PATHS:
        data = parse_manifest(manifest_path)
        for issue in data["issues"]:
            if str(issue.get("id")) == "1":
                issue["article_count"] = str(len(entries))
        rest = [a for a in data["articles"] if str(a.get("issue_id")) != "1"]
        data["articles"] = new_issue_articles + rest
        data["generated_at"] = datetime.now(timezone.utc).isoformat()
        dump_manifest(manifest_path, data)


def rebuild_issues_csv(entries: list[dict]) -> None:
    for csv_path in ISSUES_CSV_PATHS:
        with csv_path.open("r", encoding="utf-8", newline="") as fh:
            rows = list(csv.DictReader(fh))
            fieldnames = fh.readline()
        if not rows:
            continue
        headers = list(rows[0].keys())
        for row in rows:
            if row.get("id") == "1":
                row["article_count"] = str(len(entries))
        with csv_path.open("w", encoding="utf-8", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)


def main() -> None:
    entries = build_entries()
    backup_articles_dir()
    rebuilt_entries = rebuild_pdfs(entries)
    rebuild_manifest(rebuilt_entries)
    rebuild_issues_csv(rebuilt_entries)
    print(f"Rebuilt {len(rebuilt_entries)} entries for issue 1.")


if __name__ == "__main__":
    main()
