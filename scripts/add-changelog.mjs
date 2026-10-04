#!/usr/bin/env node
/**
 * Aggiunge UNA voce in cima al changelog di questo progetto e manda la
 * notifica ntfy "patch note pubblicata" secondo la convenzione di
 * ~/NOTIFICHE.md (topic letto da ~/.ntfy-topic, mai hardcodato; titolo
 * prefissato [Certify]; priorita' default; tag "package").
 *
 * Uso:
 *   node scripts/add-changelog.mjs
 *       -> mostra le ultime versioni e non modifica niente
 *   node scripts/add-changelog.mjs <versione> <PATCH|MINOR|MAJOR> "<titolo>" "<voce 1>" "<voce 2>" ...
 *       -> aggiunge la voce (data = oggi) e notifica
 *
 * Livelli (nel dubbio e' sempre PATCH):
 *   PATCH  ultimo numero (0.1.0 -> 0.1.1). La stragrande maggioranza dei
 *          rilasci: fix, miglioramenti a qualcosa che gia' esisteva.
 *   MINOR  numero centrale (0.1.1 -> 0.2.0). Solo una capacita' che prima
 *          non esisteva affatto.
 *   MAJOR  primo numero (0.x.x -> 1.0.0). Praticamente mai.
 *
 * NOTA: questo script sta fuori dal bundle di Next (cartella scripts/), non
 * viene mai eseguito a runtime dal sito. La "pubblicazione" di una patch
 * note qui e' un'azione manuale (modifica del file + build + restart PM2),
 * non un evento runtime: questo script e' il punto naturale a cui agganciare
 * la notifica.
 *
 * Dopo averlo eseguito, SEMPRE:
 *   npm run build && pm2 restart certify && pm2 save
 *   curl -I https://certify.tmslab.it
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Etichetta usata nel titolo della notifica ntfy: "[Certify] ...". */
const PROJECT_LABEL = "Certify";
/** Changelog di questo progetto. */
const CHANGELOG_FILE = join(HERE, "..", "src", "lib", "changelog-data.ts");
/** URL pubblica della pagina changelog, citata nella notifica. */
const CHANGELOG_URL = "https://certify.tmslab.it/changelog";

const KINDS = ["PATCH", "MINOR", "MAJOR"];
const ANCHOR = "export const changelog: ChangelogEntry[] = [";

const USAGE =
  'Uso: node scripts/add-changelog.mjs <versione> <PATCH|MINOR|MAJOR> "<titolo>" "<voce 1>" "<voce 2>" ...';

/** Elenca le versioni gia' presenti, dalla piu' recente. */
function listVersions(source) {
  const out = [];
  const re = /version:\s*"([^"]+)",\s*\n\s*kind:\s*"([^"]+)",\s*\n\s*title:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    out.push({ version: m[1], kind: m[2], title: m[3] });
  }
  return out;
}

/** Notifica ntfy secondo ~/NOTIFICHE.md. Non solleva mai: e' accessoria. */
async function notify(version, kind, title) {
  let topic;
  try {
    topic = (await readFile(join(homedir(), ".ntfy-topic"), "utf8")).trim();
  } catch {
    console.warn(
      "! Topic ntfy non leggibile da ~/.ntfy-topic: notifica saltata (il changelog e' comunque stato aggiornato).",
    );
    return;
  }
  if (!topic) {
    console.warn("! Topic ntfy vuoto: notifica saltata.");
    return;
  }

  try {
    const res = await fetch("https://ntfy.sh/" + encodeURIComponent(topic), {
      method: "POST",
      headers: {
        Title: "[" + PROJECT_LABEL + "] Patch note pubblicata",
        Priority: "default",
        Tags: "package",
      },
      body:
        "v" + version + " (" + kind + ") - " + title + "\n" + CHANGELOG_URL,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn("! ntfy ha risposto " + res.status + ": notifica non inviata.");
      return;
    }
    console.log("Notifica ntfy inviata.");
  } catch (err) {
    console.warn("! Invio notifica ntfy fallito: " + err.message);
  }
}

async function main() {
  const [version, kind, title, ...items] = process.argv.slice(2);
  const source = await readFile(CHANGELOG_FILE, "utf8");

  if (!version) {
    const recent = listVersions(source).slice(0, 5);
    if (recent.length === 0) {
      console.log("Nessuna voce presente.");
    } else {
      console.log("Ultime versioni:");
      for (const r of recent) console.log("  v" + r.version + " (" + r.kind + ") - " + r.title);
    }
    console.log("\n" + USAGE);
    process.exit(0);
  }

  if (!KINDS.includes(kind) || !title || items.length === 0) {
    console.error(USAGE);
    console.error(
      "Il livello deve essere PATCH, MINOR o MAJOR; servono un titolo e almeno una voce.",
    );
    process.exit(1);
  }

  if (listVersions(source).some((r) => r.version === version)) {
    console.error("La versione " + version + " esiste gia' nel changelog.");
    process.exit(1);
  }

  const at = source.indexOf(ANCHOR);
  if (at === -1) {
    console.error(
      "Non trovo la riga '" + ANCHOR + "' in " + CHANGELOG_FILE + ".\n" +
        "Il file e' stato ristrutturato: aggiungi la voce a mano oppure aggiorna questo script.",
    );
    process.exit(1);
  }

  const releasedAt = new Date().toISOString().slice(0, 10);
  const entry =
    "\n  {\n" +
    "    version: " + JSON.stringify(version) + ",\n" +
    "    kind: " + JSON.stringify(kind) + ",\n" +
    "    title: " + JSON.stringify(title) + ",\n" +
    "    items: [\n" +
    items.map((i) => "      " + JSON.stringify(i) + ",\n").join("") +
    "    ],\n" +
    "    releasedAt: " + JSON.stringify(releasedAt) + ",\n" +
    "  },";

  const cut = at + ANCHOR.length;
  await writeFile(CHANGELOG_FILE, source.slice(0, cut) + entry + source.slice(cut), "utf8");

  console.log("Aggiunta voce v" + version + " (" + kind + "): " + title);
  await notify(version, kind, title);
  console.log("\nOra: npm run build && pm2 restart certify && pm2 save");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
