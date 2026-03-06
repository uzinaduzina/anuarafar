# Anuarul Arhivei de Folclor

Repository-ul conține platforma web pentru **Anuarul Arhivei de Folclor**. Proiectul combină site-ul public al revistei cu un dashboard editorial pentru administrarea numerelor, articolelor și submisiilor, inclusiv flux de anonimizare și peer review.

## Ce face aplicația

- publică arhiva numerelor și articolelor revistei;
- gestionează metadatele editoriale din fișiere CSV;
- oferă roluri separate pentru `admin`, `editor`, `reviewer` și `author`;
- permite trimiterea de manuscrise cu atașamente;
- include pas intermediar de anonimizare înainte de evaluare;
- susține double-blind peer review cu doi revieweri diferiți;
- trimite emailuri de autentificare și notificări prin Cloudflare Worker.

## Cum a fost construit

Aplicația a pornit de la o bază tehnică simplă în `React + Vite` și a fost extinsă iterativ pentru nevoile concrete ale revistei. Structura actuală este una custom, orientată pe:

- publicare rapidă a arhivei;
- editare directă a numerelor și articolelor;
- administrare editorială fără OJS;
- export de date pentru DOAJ și flux editorial intern.

Nu este un starter generic și nu urmărește un produs SaaS reutilizabil; repository-ul este adaptat explicit pentru Anuar și pentru fluxul de lucru IAFAR.

## Arhitectură

- `src/`: frontend-ul React pentru site public și dashboard.
- `public/data/`: date statice pentru numere și manifestul arhivei.
- `worker/email-auth/`: Cloudflare Worker pentru autentificare, submisii și notificări email.
- `docs/`: build static folosit pentru publicare.

## Date și editare

- Numerele sunt gestionate CSV-first din `issues.csv`.
- Articolele publicate au metadate editabile din interfața editorială.
- Submisiile noi sunt păstrate în Worker KV, împreună cu fișierele atașate.
- Editorul poate corecta metadatele unei submisii și poate încărca versiunea anonimizată înainte de review.

## Autentificare și workflow editorial

Frontend-ul folosește `VITE_AUTH_API_BASE` pentru a comunica cu worker-ul. Worker-ul gestionează:

- login cu parolă;
- login cu cod trimis pe email;
- sesiuni persistente pe 30 de zile;
- administrarea utilizatorilor;
- notificări editoriale și de review;
- stocarea submisiilor și a fișierelor.

Fluxul editorial actual este:

1. autorul trimite manuscrisul;
2. editorul verifică și corectează metadatele;
3. editorul încarcă versiunea anonimizată;
4. editorul alocă doi revieweri;
5. reviewerii evaluează versiunea blind;
6. editorul ia decizia finală.

## Dezvoltare locală

```bash
npm install
npm run dev
```

Build de producție:

```bash
npm run build
```

Teste:

```bash
npm test
```

## Publicare

Sunt folosite două căi principale:

- frontend static publicat din build-ul Vite;
- Cloudflare Worker pentru autentificare, submisii și emailuri.

Pentru worker este necesară configurarea secretelor și a variabilelor în Cloudflare, inclusiv cheia Resend, `OTP_SECRET` și setările pentru domeniul de email.

## Domeniu și scop

Repository-ul este întreținut pentru publicarea și administrarea **Anuarului Arhivei de Folclor** la domeniul `anuar.iafar.ro`, cu accent pe acces deschis, metadata curate și compatibilitate cu cerințe editoriale precum DOAJ.
