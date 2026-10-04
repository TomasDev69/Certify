export type ChangelogKind = "PATCH" | "MINOR" | "MAJOR";

export interface ChangelogEntry {
  version: string;
  kind: ChangelogKind;
  title: string;
  items: string[];
  releasedAt: string; // ISO date
}

/**
 * Cronologia di questo progetto (Certify). Nuove voci vanno aggiunte
 * IN CIMA (piu' recenti prima), seguendo lo stesso schema di
 * ~/wifi-dashboard/lib/changelog-data.ts e ~/todolist/scripts/add-changelog.ts:
 * PATCH per la normale amministrazione, MINOR per una capacita' nuova che
 * prima non esisteva affatto, MAJOR quasi mai.
 *
 * Nel dubbio e' sempre PATCH.
 *
 * Il modo consigliato di aggiungere una voce e' `node scripts/add-changelog.mjs`
 * (aggiorna questo file e manda la notifica ntfy secondo ~/NOTIFICHE.md), ma
 * si puo' anche scrivere a mano: e' un normale array TypeScript.
 *
 * Prima di pubblicare una voce: rileggere FEATURE_CHECKLIST.md PER INTERO,
 * poi `npm run build` + `pm2 restart certify && pm2 save`.
 */
export const changelog: ChangelogEntry[] = [
  {
    version: "0.1.0",
    kind: "PATCH",
    title: "Changelog system introduced",
    items: [
      "This page: every future change to Certify is recorded here, newest first",
      "Releases are labelled PATCH, MINOR or MAJOR so the scale of each change is clear at a glance",
      "Behind the scenes: a full feature checklist that gets re-read before every release, plus a work log so nothing is lost between sessions",
      "No change to how the site works: validation, redesign and PDF download are exactly as before",
    ],
    releasedAt: "2026-08-03",
  },
];
