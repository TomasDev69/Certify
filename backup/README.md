# Backup — versioni precedenti del certificato

Questa cartella conserva le versioni **vecchie** del design del certificato,
salvate prima di adottare il wordmark ufficiale **`ANTHROP\C`** (solo testo,
senza il simbolo ∧).

## Contenuto

- **`Certificate.tsx`** — versione precedente del componente
  (`src/components/Certificate.tsx`). Header con il **simbolo ∧ + "Anthropic"**
  in Playfair. Tutto il resto (layout Standard + 16:9, firma "Anthropic
  Academy") è identico alla versione attuale.
- **`test-certificates/`** — anteprime HTML autonome usate per scegliere il
  wordmark (apribili con doppio clic, nessun server necessario):
  - `anthropic-cert-test.html` — wordmark `ANTHROP\C` solo testo (versione
    scelta, ora attiva nell'app).
  - `anthropic-cert-test-2.html` — variante con il simbolo ∧ davanti.

## Differenza con la versione attuale

| | Vecchia (questo backup) | Attuale (in `src/`) |
|---|---|---|
| Header in alto a sinistra | ∧ (SVG) + `Anthropic` (Playfair) | `ANTHROP\C` (Inter bold, no ∧) |
| Firma footer | Anthropic Academy | Anthropic Academy (invariata) |

## Come ripristinare la versione vecchia

Copia il file sopra la versione attuale:

```bash
cp backup/Certificate.tsx src/components/Certificate.tsx
```

Oppure recupera la versione committata da git (commit `589c86d`):

```bash
git checkout 589c86d -- src/components/Certificate.tsx
```
