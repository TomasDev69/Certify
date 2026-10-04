# Checklist funzioni — Certify (certify.tmslab.it)

> Elenco di TUTTE le funzioni reali del sito, con una prova concreta per
> ciascuna. **Obbligatorio prima di ogni pubblicazione** (qualsiasi voce di
> changelog, patch o no): passare in rassegna l'intera checklist — non solo
> l'area che hai toccato. Una modifica in un punto può rompere qualcosa
> altrove: qui il rischio tipico è la catena
> `scraping → parsing → render → snapshot PNG → PDF`, dove un cambio
> apparentemente innocuo di CSS può far esplodere solo l'export.
>
> Se una modifica ha aggiunto o cambiato una funzione, AGGIORNA questo file
> (nuova voce o voce rivista) come parte dello stesso lavoro, prima di
> considerarlo finito — non lasciarlo per dopo.
>
> Non esiste una suite di test automatici in questo progetto: la verifica è
> `npm run build` (obbligatoria sempre) più un giro manuale reale secondo
> questa checklist.

Contesto tecnico: Next.js 16 App Router, sorgenti sotto `src/`, alias
`@/*` → `./src/*`, Tailwind v4, PM2 processo `certify` su `127.0.0.1:3003`,
esposto da Cloudflare Tunnel su https://certify.tmslab.it.
Tier **PUBBLICO**: nessuna area `/admin` in questo progetto, nessun
tracciamento di IP/visitatori qui dentro (quei dati vivono solo in
`dashboard.tmslab.it`).

---

## Come testare (metodo)

**Livello 1 — sempre, automatico, prima di qualunque riavvio:**

```bash
cd ~/certify
npm run build
```

Se fallisce, non si va oltre. (`npm run lint` è disponibile ma non
bloccante.)

**Livello 2 — reachability di tutte le pagine (automatico, in locale):**

```bash
for p in / /legal /changelog; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:3003$p")
  echo "$code  $p"
done
```

Tutte devono dare `200`. Un `500` qui è già un bug, prima ancora di guardare
la logica.

**Livello 3 — API di verifica (automatico, in locale):**

```bash
# formato URL non valido -> 400
curl -s -o /dev/null -w '%{http_code} (atteso 400)\n' \
  "http://127.0.0.1:3003/api/verify?url=https://example.com/c/abc"
# host non Skilljar -> 400 (guardia anti-SSRF)
curl -s -o /dev/null -w '%{http_code} (atteso 400)\n' \
  "http://127.0.0.1:3003/api/verify?url=http://127.0.0.1:3003/"
# body JSON malformato -> 400
curl -s -o /dev/null -w '%{http_code} (atteso 400)\n' -X POST \
  -H 'Content-Type: application/json' -d 'non-json' \
  "http://127.0.0.1:3003/api/verify"
```

**Livello 4 — funzionale vero (browser, richiede un certificato reale):**
serve un URL Skilljar valido di un certificato Anthropic realmente
conseguito (`https://verify.skilljar.com/c/<id>`). Non è scritto in questo
file e non va scritto in nessun file del repo: usa il tuo, oppure chiedilo a
Tomas. Senza quello i punti marcati **[cert reale]** non sono verificabili.

**Livello 5 — log puliti:**
dopo `pm2 restart certify`, fai `pm2 flush certify`, ripeti il livello 2/3,
poi `pm2 logs certify --lines 30 --nostream --err` — deve restare vuoto.

**Livello 6 — bind e raggiungibilità pubblica:**

```bash
ss -tlnp | grep 3003          # deve mostrare SOLO 127.0.0.1:3003, mai 0.0.0.0
curl -I https://certify.tmslab.it   # deve restare 200
```

---

## 1. Verifica della credenziale (`/` + `src/app/api/verify/route.ts`)

### 1.1 Home page e form
- **Cosa fa:** intestazione "Certify", titolo, campo URL e bottone
  "Redesign". Il bottone è disabilitato finché il campo è vuoto e mentre è
  in corso una validazione (dove mostra "Validating…").
- **Come testare:** apri https://certify.tmslab.it — il bottone parte grigio/
  disabilitato; scrivi qualcosa e si abilita; durante l'invio diventa
  "Validating…" e il campo si disabilita.

### 1.2 Validazione dell'URL lato server (guardia anti-SSRF)
- **Cosa fa:** accetta SOLO `https://verify.skilljar.com/c/<id>` (host
  bloccato, protocollo obbligatoriamente https, path che matcha
  `/^\/c\/([A-Za-z0-9]+)\/?$/`). L'URL viene poi **ricostruito** dalle sole
  parti fidate, buttando via query string, fragment e credenziali: l'endpoint
  non può essere usato come proxy per scaricare URL arbitrari.
- **Come testare:** livello 3 sopra. In più, da browser incolla
  `https://verify.skilljar.com/c/<id>?foo=bar#x` di un certificato reale:
  deve funzionare identico alla versione pulita **[cert reale]**.
- **Perché conta:** è la protezione principale di questo servizio. Se tocchi
  `parseSkilljarUrl`, ritesta tutti e tre i casi del livello 3.

### 1.3 Riconoscimento "è davvero un certificato Anthropic"
- **Cosa fa:** dopo aver scaricato la pagina Skilljar, richiede sia la
  tabella di validazione (`.certificate-table` /
  `#certificate_table_student_row`) sia un riferimento ad "anthropic" (meta
  `og:site_name`, riga organizzazione emittente, o meta description).
  Altrimenti risponde 422 con "This page is not a recognized Anthropic
  certificate."
- **Come testare:** incolla l'URL di un certificato Skilljar **non**
  Anthropic (di un altro fornitore che usa Skilljar): deve dare l'errore
  422, non un certificato ridisegnato.

### 1.4 Estrazione dei dati
- **Cosa fa:** legge nome studente, titolo del corso e data di
  completamento dalle righe della tabella di validazione; se una riga manca,
  ripiega sulla meta description (`"...verifies that <Nome> completed
  <Corso>"`). Se nome o corso restano vuoti → 422 "Couldn't read the name and
  course…".
- **Come testare:** con un certificato reale, il nome e il corso mostrati
  sotto "Credential validated" devono corrispondere **esattamente** a quelli
  sulla pagina Skilljar originale (aprile le due schede affiancate)
  **[cert reale]**.

### 1.5 Formato della data di completamento
- **Cosa fa:** converte "June 13, 2026" in `13/06/2026`. Se non riesce a
  parsare, tiene la stringa grezza. Se la data manca del tutto, il
  certificato ripiega sulla data di oggi.
- **Come testare:** con un certificato reale, la data in basso sul
  certificato ridisegnato deve essere in formato `gg/mm/aaaa` e coincidere
  con quella della pagina Skilljar **[cert reale]**.

### 1.6 Errori di rete e stati HTTP
- **Cosa fa:** 404 se Skilljar non ha quel certificato; 502 se Skilljar è
  irraggiungibile o risponde con uno stato inatteso; messaggio "Network
  error…" lato client se la fetch verso `/api/verify` fallisce.
- **Come testare:** un id inesistente
  (`https://verify.skilljar.com/c/zzzzzzzzzzzz`) deve dare il messaggio "No
  certificate exists at that URL", non un errore generico.

### 1.7 API accessibile sia in POST che in GET
- **Cosa fa:** `POST /api/verify` con body `{"url": "..."}` (usato dalla UI)
  e `GET /api/verify?url=...` (comodo da riga di comando) fanno la stessa
  cosa. La route è `force-dynamic`: nessuna cache, ogni richiesta rilegge la
  pagina esterna.
- **Come testare:** livello 3 sopra + un GET con URL valido deve tornare il
  JSON `{name, courseTitle, verifyId, completionDate}` **[cert reale]**.

---

## 2. Certificato ridisegnato (`src/components/Certificate.tsx`, `src/lib/courses.ts`)

### 2.1 Colore accento per corso
- **Cosa fa:** 18 corsi Anthropic hanno un accento dedicato (es. "Claude Code
  101" → Terracotta `#C15F3C`, "Introduction to Agent Skills" → Petrol Blue).
  Il match è case-insensitive e normalizza gli spazi. Un corso non mappato
  ricade sul corallo Anthropic `#D97757`.
- **Come testare:** verifica due certificati di corsi diversi tra quelli
  mappati: la cornice e i dettagli devono avere due colori diversi
  **[cert reale]**. Se aggiungi un corso alla mappa, ritesta anche il
  fallback (un titolo inventato deve restare corallo).

### 2.2 Blocco "competenze dimostrate" per corso
- **Cosa fa:** ogni corso mappato ha il suo elenco di 4 competenze; i corsi
  non mappati usano l'elenco generico `DEFAULT_SKILLS`.
- **Come testare:** il blocco elenco sul certificato deve cambiare
  contenuto tra due corsi diversi **[cert reale]**.

### 2.3 QR code di verifica
- **Cosa fa:** generato **lato client** come data URL (libreria `qrcode`,
  import dinamico) e punta a `https://verify.skilljar.com/c/<id>`. È
  generato in locale di proposito: un'immagine esterna "sporcherebbe" il
  canvas e romperebbe l'export.
- **Come testare:** inquadra il QR del certificato mostrato con il telefono —
  deve aprire la pagina Skilljar originale di quel certificato **[cert
  reale]**. Ripeti la prova **anche sul PDF scaricato**, non solo a schermo.

### 2.4 Selettore formato: Standard / 16:9
- **Cosa fa:** due formati. "Standard" = 1000px di larghezza, altezza
  guidata dal contenuto (verticale). "16:9" = 1280×720, modalità landscape:
  tipografia e spaziature scalate (×1.1), competenze su due colonne, bande
  centrate verticalmente.
- **Come testare:** premi i due bottoni: il certificato deve cambiare
  proporzioni davvero; in 16:9 le competenze vanno su due colonne e nulla
  deve uscire dalla cornice o essere tagliato **[cert reale]**.

### 2.5 Anteprima responsive
- **Cosa fa:** il certificato mantiene la sua larghezza intrinseca (per
  catturarlo a piena risoluzione) e il contenitore viene scalato per
  entrare nella colonna. La misura si aggiorna su resize, dopo il
  caricamento dei web font e dopo l'arrivo del QR.
- **Come testare:** ridimensiona la finestra dal desktop fino a larghezza
  mobile: il certificato si rimpicciolisce senza essere tagliato, e il
  riquadro non lascia una banda vuota sotto **[cert reale]**. Ricarica con
  cache disabilitata (DevTools → Network → Disable cache) per verificare che
  anche con i font caricati in ritardo l'altezza si assesti bene.

---

## 3. Download PDF (`src/components/CertificateCard.tsx`)

### 3.1 Esportazione
- **Cosa fa:** aspetta `document.fonts.ready`, cattura il nodo con
  `html-to-image` (`toPng`, `pixelRatio: 2`, sfondo `#Fdfbf7`, transform
  forzato a `none` per catturare la dimensione intrinseca e non quella
  scalata a schermo), poi lo impagina in un PDF con `jsPDF` di dimensioni
  pari al certificato. Nome file:
  `anthropic-<slug-del-corso>-<standard|wide>-certificate.pdf`.
- **Come testare:** scarica in entrambi i formati **[cert reale]**. Verifica:
  (a) il file si apre; (b) il testo è nitido (è 2×, non sgranato); (c) il
  nome dello studente **non** ha spazi collassati ("Tomas Guardati", non
  "TomasGuardati" — è la regressione storica per cui si usa `html-to-image`
  e non `html2canvas`); (d) i colori dell'accento sono quelli giusti; (e) il
  QR funziona.
- **Perché conta:** è l'output finale del prodotto. Qualunque modifica al CSS
  del certificato va riverificata **qui**, non solo a schermo: l'export usa
  colori esadecimali inline apposta perché Tailwind v4 emette `oklch()`, che
  la vecchia catena di cattura non sa leggere.

### 3.2 Stato di caricamento ed errore
- **Cosa fa:** durante l'export il bottone mostra "Generating PDF…" ed è
  disabilitato; su errore appare un messaggio rosso sotto.
- **Come testare:** il testo del bottone cambia durante la generazione (su
  un Pi/portatile lento si vede bene).

### 3.3 "Verify another"
- **Cosa fa:** azzera stato, errore, risultato e campo URL, riportando alla
  schermata iniziale.
- **Come testare:** dopo una verifica riuscita, premi "Verify another": il
  form torna vuoto e il certificato sparisce.

---

## 4. Pagine statiche e contorno

### 4.1 `/legal` — Privacy & Terms
- **Cosa fa:** pagina con tre sezioni (1. Legal Disclaimer & Terms of Use,
  2. Privacy, 3. Cookie) e un link "← Certify" per tornare alla home. Ha
  metadata e OpenGraph propri.
- **Come testare:** `curl -s -o /dev/null -w '%{http_code}'
  http://127.0.0.1:3003/legal` → 200; il link in fondo alla home ci porta;
  il link "← Certify" riporta indietro.

### 4.2 Footer della home
- **Cosa fa:** "Built by Tomas Guardati", link a `/legal`, data
  "Last updated" (costante `LAST_UPDATED` in `src/app/page.tsx`) e link al
  portfolio (`https://portfolio.tmslab.it/`, apre in nuova scheda).
- **Come testare:** entrambi i link funzionano; se hai cambiato qualcosa di
  sostanziale, valuta se aggiornare `LAST_UPDATED` (è a mano, non
  automatico).

### 4.3 Metadata, icone e social preview
- **Cosa fa:** title/description, OpenGraph e Twitter card con `/logo.png`,
  favicon (`src/app/icon.png`) e icona iOS (`src/app/apple-icon.png`).
- **Come testare:** la favicon si vede nella scheda del browser; `curl -s
  https://certify.tmslab.it | grep -o '<meta property="og:[^>]*>'` mostra i
  tag.
- **Nota aperta (non correggere senza chiedere):** `metadataBase` in
  `src/app/layout.tsx` punta ancora a `https://certify-red.vercel.app`,
  residuo del deploy Vercel originale. Non impatta il funzionamento del
  sito, ma le URL assolute nelle anteprime social puntano al vecchio
  dominio invece che a `certify.tmslab.it`.

### 4.4 Analytics
- **Cosa fa:** Cloudflare Web Analytics, montato in `src/app/layout.tsx` con
  `next/script` (`beacon.min.js` e `data-cf-beacon` con il token del sito).
  Statistiche aggregate e senza cookie, consultabili nel pannello Cloudflare
  in Web analytics. Sostituisce `@vercel/analytics` dal 04/10/2026.
- **Come testare:** nell'HTML di `/` e di `/legal` deve comparire
  `beacon.min.js`; la pagina `/legal` ha la voce "Visit Statistics".

---

## 5. Registro aggiornamenti e strumenti di sessione

### 5.1 `/changelog`
- **Cosa fa:** pagina pubblica con le patch notes, alimentata da
  `src/lib/changelog-data.ts` (voci più recenti in cima). Livelli PATCH /
  MINOR / MAJOR.
- **Come testare:** `curl -s -o /dev/null -w '%{http_code}'
  http://127.0.0.1:3003/changelog` → 200; la pagina elenca le voci, ognuna
  con versione, livello, data formattata all'italiana e elenco puntato; il
  link "← Certify" torna alla home.

### 5.2 Prompt di ripresa sessione
- **Dove sta:** `PROMPT-RIPRESA.md` nella cartella del progetto sul Pi, fuori
  da git. Fino al 04/10/2026 era un bottone in fondo a `/changelog`, tolto
  perche' mostrava a chiunque l'accesso SSH e i percorsi del Pi.

---

## 6. Infrastruttura (da verificare a ogni deploy)

- `ss -tlnp | grep 3003` → **solo** `127.0.0.1:3003` (regola DO #1 di
  `~/CLAUDE.md`; questo bind sta in `"start": "next start -H 127.0.0.1"` nel
  `package.json`, committato su GitHub dal 04/10/2026).
- `pm2 restart certify && pm2 save` dopo ogni build.
- `curl -I https://certify.tmslab.it` → 200 (passa dal tunnel Cloudflare).
- `pm2 logs certify --lines 30 --nostream --err` → pulito.
