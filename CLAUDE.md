@AGENTS.md

# Certify — regole di progetto (certify.tmslab.it)

Questo progetto gira su un **server di produzione**: il Raspberry Pi 5 di
TMS Lab. Le regole permanenti della macchina stanno in `~/CLAUDE.md` e
valgono sempre, anche quando contraddicono l'abitudine; il registro di cosa
gira dove sta in `~/PROJECTS.md`. Leggili prima di toccare qualunque cosa.

## Cos'e'

Certify prende l'URL pubblico di un certificato Anthropic su Skilljar
(`https://verify.skilljar.com/c/<id>`), lo **valida davvero** andandolo a
leggere, e ne genera una versione ridisegnata scaricabile in PDF (formato
Standard o 16:9, colore accento e blocco competenze in base al corso, QR di
verifica). Non c'e' database, non c'e' login, non c'e' stato lato server.

## Dove sta cosa

| | |
|---|---|
| Percorso | `~/certify` |
| Stack | Next.js 16 App Router, React 19, Tailwind v4, TypeScript |
| Sorgenti | sotto `src/` — alias `@/*` → `./src/*` |
| Servizio | PM2, processo `certify` |
| Porta | `127.0.0.1:3003` |
| Esposizione | Cloudflare Tunnel → https://certify.tmslab.it |
| Tier | **pubblico** |

Documenti di progetto (leggere in quest'ordine a inizio sessione):

- `WORK_LOG.md` — log anti-crash, sessione piu' recente in cima. E' li' che
  si trova lo stato reale del lavoro.
- `FEATURE_CHECKLIST.md` — tutte le funzioni del sito con come provarle.
- `src/lib/changelog-data.ts` → pubblicato su `/changelog`.
- `PROMPT-RIPRESA.md` — il prompt di ripresa sessione. Sta solo sul Pi ed e'
  escluso da git: contiene l'accesso SSH e i percorsi della macchina, che non
  devono finire nel repository pubblico ne' nel sito.

## DO

1. **Rileggere `FEATURE_CHECKLIST.md` per intero** prima di ogni
   pubblicazione, non solo l'area toccata. Qui la catena
   scraping → parsing → render → snapshot PNG → PDF si rompe volentieri a
   distanza.
2. **Ogni modifica al CSS del certificato va riverificata sul PDF
   scaricato**, non solo a schermo. I colori del certificato sono
   esadecimali inline apposta: Tailwind v4 emette `oklch()`, che la catena
   di cattura non sa leggere.
3. **Aggiornare `WORK_LOG.md` mentre si lavora**, spuntando gli step man
   mano — non a fine sessione. Se un'altra sessione potrebbe averlo toccato,
   rileggerlo subito prima di scrivere e appendere in cima, mai riscrivere
   tutto il file.
4. **Ciclo di pubblicazione**, in quest'ordine:
   ```bash
   cd ~/certify
   npm run build
   pm2 restart certify && pm2 save
   curl -I https://certify.tmslab.it          # deve restare 200
   ss -tlnp | grep 3003                       # SOLO 127.0.0.1
   pm2 logs certify --lines 30 --nostream --err   # deve essere pulito
   ```
   PM2 **non** richiede sudo.
5. **Verificare il bind dopo ogni re-clone del repo**: `-H 127.0.0.1` vive
   nello script `start` del `package.json` (committato su GitHub dal
   04/10/2026). Senza,
   Next torna ad ascoltare su `0.0.0.0`, contro la regola DO #1 di
   `~/CLAUDE.md`.

## DON'T

1. **MAI** aggiungere un'area `/admin` a questo progetto: e' tier
   **pubblico**. Se serve un pannello, va in `dashboard.tmslab.it`.
2. **MAI** aggiungere tracciamento di IP o di visitatori nel codice. Le
   statistiche usano solo Cloudflare Web Analytics (script `beacon.min.js` in
   `src/app/layout.tsx`, aggregato e senza cookie), scelto da Tomas il
   04/10/2026 al posto di `@vercel/analytics`. Non aggiungere altri strumenti
   di analisi senza chiedere a Tomas.
3. **MAI** allentare la guardia anti-SSRF in
   `src/app/api/verify/route.ts` (`parseSkilljarUrl`: solo host
   `verify.skilljar.com`, solo https, solo path `/c/<id>`, URL ricostruita
   dalle sole parti fidate). Quella funzione e' l'unica cosa che impedisce
   di usare l'endpoint come proxy per scaricare URL arbitrari.
4. **MAI** scrivere in questo repo un URL/ID di certificato reale, ne'
   credenziali di alcun tipo.
5. **MAI** aggiungere una voce di changelog di iniziativa: si chiede prima a
   Tomas se la vuole, cosa includere e che livello dare (PATCH quasi sempre,
   MINOR solo per una capacita' genuinamente nuova, MAJOR quasi mai). Solo
   dopo la conferma: `node scripts/add-changelog.mjs ...`, poi build e
   restart.
6. **MAI** eseguire `next dev` su questa macchina in produzione (regola
   DON'T #8 di `~/CLAUDE.md`): solo `next build` + `next start`.
7. **MAI** mettere nel sito o nel repository (che e' pubblico) indirizzi,
   utenti SSH, percorsi o regole del Pi.

## Note aperte (segnalate, non corrette)

- `metadataBase` in `src/app/layout.tsx` punta ancora a
  `https://certify-red.vercel.app` (residuo del deploy Vercel originale):
  le URL assolute nelle anteprime social puntano al vecchio dominio invece
  che a `certify.tmslab.it`. Correggibile in una riga, ma va deciso con
  Tomas.
- La pagina `/changelog` non e' linkata da nessuna pagina esistente (il
  vincolo della sessione che l'ha introdotta era di non toccare le pagine
  gia' presenti): ci si arriva solo per URL diretto. Aggiungere un link nel
  footer della home significa modificare `src/app/page.tsx` — chiedere
  prima.
