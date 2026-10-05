# Work log — Certify (certify.tmslab.it)

> **Log anti-crash.** Va scritto *mentre* si lavora, non a fine sessione: se
> la sessione Claude muore a metà (crash, contesto pieno, terminale chiuso),
> questo file è l'unica cosa che permette alla sessione successiva di
> riprendere senza rifare la diagnosi da zero.
>
> **Regole:**
> - Sessione più recente **in cima**.
> - Formato fisso: **Richiesta** (cosa ha chiesto Tomas, parole sue) →
>   **Piano** (step numerati, con `[ ]` / `[x]` aggiornati *man mano*, non
>   alla fine) → **Stato** (dove siamo davvero adesso, cosa è in produzione,
>   cosa è rimasto a metà).
> - Se una sessione parallela sta lavorando sullo stesso file, rileggilo
>   subito prima di scrivere e **appendi**, non riscrivere: è già successo su
>   altri progetti del Pi che due sessioni si sovrascrivessero a vicenda.
> - Prima di considerare finito un lavoro: `FEATURE_CHECKLIST.md` **per
>   intero**, `npm run build`, `pm2 restart certify && pm2 save`,
>   `curl -I https://certify.tmslab.it`.

---

## 2026-10-05 — certify.tmslab.it indirizzo ufficiale, link al Changelog

**Richiesta:** «secondo me è figo se il Raspberry Pi 5 diventa l'indirizzo
ufficiale. poi secondo me si può aggiungere un link alla pagina changelog».

**Piano:**
1. [x] `src/app/layout.tsx`: `metadataBase` e `openGraph.url` da
   `certify-red.vercel.app` a `certify.tmslab.it` (anteprime social e URL
   assolute).
2. [x] `src/app/page.tsx`: link «Changelog» nel footer, accanto a
   «Privacy & Terms».
3. [x] `CLAUDE.md`: note aperte aggiornate (resta solo la copia su Vercel).
4. [ ] `npm run build` sul PC, `FEATURE_CHECKLIST.md` per intero.
5. [ ] Commit e push, poi sul Pi pull, build, `pm2 restart certify`, verifiche.

**Stato:** voce di changelog 0.1.1 (PATCH) aggiunta su richiesta di Tomas (notifica ntfy saltata: il topic sta solo sul Pi). Build OK sul PC, commit e push, poi deploy sul Pi.

---

## 2026-10-04 — Cloudflare Web Analytics, prompt di ripresa fuori dal sito, repo allineato

**Richiesta:** contare le visite di certify.tmslab.it con Cloudflare Web
Analytics; portare su GitHub il lavoro rimasto solo sul Pi, senza dati privati
(il repository è pubblico).

**Piano:**
1. [x] `@vercel/analytics` sostituito con `beacon.min.js` di Cloudflare in
   `src/app/layout.tsx`; pagina `/legal` aggiornata ("Visit Statistics").
2. [x] Tolto il bottone "Resume session" da `/changelog`: il prompt conteneva
   l'accesso SSH e i percorsi del Pi ed era leggibile da chiunque nel codice
   della pagina. Il prompt ora sta in `PROMPT-RIPRESA.md`, solo sul Pi, in
   `.gitignore`.
3. [x] `CLAUDE.md`, `FEATURE_CHECKLIST.md`, `WORK_LOG.md`, changelog e
   `-H 127.0.0.1` nello script `start` committati su GitHub.
4. [x] Pi allineato a `origin/main`, build, restart, controlli.

**Stato:** in produzione. Il Pi non ha più modifiche fuori da GitHub, a parte
`PROMPT-RIPRESA.md` e le copie di sicurezza `*.prima-analytics`.

## 2026-08-03 — Fase 3: allineamento agli standard Pi-wide (checklist, work log, changelog, riprendi sessione)

**Richiesta:** portare `~/certify` allo stesso standard degli altri progetti
del Pi (riferimenti: `~/wifi-dashboard` e `~/todolist`), nell'ambito della
"Fase 3" del piano di consolidamento
(`~/.claude/plans/floating-herding-nebula.md`): checklist di verifica da
riconsultare prima di ogni pubblicazione, log anti-crash, patch notes,
prompt di ripresa sessione. Vincoli espliciti: tier **pubblico** (niente
`/admin`, niente tracciamento visitatori nel progetto), non toccare la
logica applicativa esistente, build + verifica `curl` dopo ogni modifica.

**Piano:**
1. [x] Letti `~/CLAUDE.md`, `~/PROJECTS.md`, `~/NOTIFICHE.md`, il piano di
   fase, e i pattern di riferimento in `~/wifi-dashboard`
   (`lib/changelog-data.ts`, `app/changelog/page.tsx`,
   `components/resume-prompt-button.tsx`) e `~/todolist`
   (`FEATURE_CHECKLIST.md`, `WORK_LOG.md`, `VERSIONING.md`).
2. [x] Letto tutto il codice del progetto (`src/app`, `src/components`,
   `src/lib`) per elencare le funzioni **reali**, non presunte.
3. [x] `FEATURE_CHECKLIST.md` — 6 aree, ogni funzione con la sua prova
   manuale. Segnati i punti che richiedono un certificato Skilljar reale
   (**[cert reale]**), che di proposito non è scritto nel repo.
4. [x] `WORK_LOG.md` — questo file.
5. [x] `src/lib/changelog-data.ts` + `src/app/changelog/page.tsx` — stessa
   struttura dati e stessa impaginazione a timeline di wifi-dashboard,
   ridisegnata con i token di questo sito (nero `#08090a`, corallo
   `#d97757`, Inter/Playfair) invece dei colori "gravità". Nessuna
   dipendenza nuova: wifi-dashboard usa shadcn/radix, qui non c'è, quindi il
   badge è markup semplice.
6. [x] `src/components/ResumePromptButton.tsx` — stesso pattern (dialog +
   copia negli appunti), riscritto senza radix: overlay proprio, chiusura
   con Esc / X / click sullo sfondo. Testo del prompt su misura per questo
   progetto (SSH, `~/certify`, `npm run build`,
   `pm2 restart certify && pm2 save`, dove stanno i nuovi documenti).
   Montato in fondo a `/changelog`, che è l'unica pagina nuova: nessuna
   pagina o componente preesistente è stato modificato.
7. [x] `scripts/add-changelog.mjs` — aggiunge una voce in cima al changelog
   e manda la notifica ntfy `[Certify] Patch note pubblicata` secondo
   `~/NOTIFICHE.md` (priorità default, tag `package`, topic letto da
   `~/.ntfy-topic`, mai hardcodato). È fuori dal bundle Next: zero impatto a
   runtime sul sito.
8. [x] `CLAUDE.md` di progetto esteso (prima era il solo `@AGENTS.md`) con
   le regole specifiche di Certify e i puntatori ai nuovi documenti.
9. [x] `npm run build` OK → `pm2 restart certify && pm2 save` →
   `curl -I https://certify.tmslab.it` = 200, `ss -tlnp` conferma
   `127.0.0.1:3003`.

**Stato:** completo e in produzione. Il sito funziona esattamente come
prima; l'unica novità visibile al pubblico è la pagina `/changelog` (non
linkata da nessuna pagina esistente, perché il vincolo era di non toccarle:
ci si arriva solo per URL diretto — se Tomas vuole un link nel footer, va
chiesto prima, perché significa modificare `src/app/page.tsx`).

**Note lasciate aperte di proposito** (segnalate, non corrette):
- `metadataBase` in `src/app/layout.tsx` punta ancora a
  `https://certify-red.vercel.app` (residuo del deploy Vercel originale):
  le URL assolute delle anteprime social puntano al vecchio dominio.
- `@vercel/analytics` è montato nel layout. Fuori da Vercel non ha un
  backend a cui parlare, quindi di fatto non raccoglie nulla, ma
  concettualmente stona con la regola del tier pubblico ("i dati di
  traffico vivono solo in `dashboard.tmslab.it`"). Rimuoverlo è una
  decisione di Tomas.
- Il bind `127.0.0.1` vive nello script `start` del `package.json` e **non
  è committato upstream** (vedi `package.json.bak-2026-08-02`): se si
  ri-clona il repo da GitHub va riapplicato a mano.

---

<!-- Le sessioni successive vanno aggiunte SOPRA questa riga, non in fondo. -->
