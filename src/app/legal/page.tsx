import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Terms — Certify",
  description:
    "Legal notice, privacy policy, and cookie policy for Certify.",
  openGraph: {
    title: "Privacy & Terms — Certify",
    description:
      "Legal notice, privacy policy, and cookie policy for Certify.",
  },
};

export default function LegalPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-20 sm:py-28">
      <main className="flex flex-1 flex-col">
        <header className="border-b border-border pb-10">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.32em] text-muted transition-colors hover:text-foreground"
          >
            ← Certify
          </Link>
          <h1 className="mt-8 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Privacy &amp; Terms
          </h1>
          <p className="mt-4 text-sm text-muted">
            Legal notice, privacy policy, and cookie policy.
          </p>
        </header>

        <div className="mt-12 space-y-12">
          {/* 1. Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              1. Disclaimer Legale e Termini di Utilizzo
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/80">
              Certify è uno strumento di utilità indipendente sviluppato a scopo
              puramente estetico. Non è in alcun modo affiliato, associato,
              autorizzato, approvato da, o collegato ufficialmente ad Anthropic.
              Il documento HTML generato tramite questo servizio non ha alcun
              valore legale o certificativo. L&rsquo;unica prova ufficiale e
              verificabile della certificazione rimane l&rsquo;URL originale
              ospitato sulla piattaforma Skilljar. L&rsquo;autore non si assume
              alcuna responsabilità per l&rsquo;alterazione, l&rsquo;uso
              improprio, fraudolento o illecito dei file generati dagli utenti
              tramite questa piattaforma. Utilizzando il servizio,
              l&rsquo;utente accetta queste condizioni.
            </p>
          </section>

          {/* 2. Privacy Policy */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              2. Informativa sulla Privacy (Privacy Policy)
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/80">
              Ai sensi del GDPR, si informa che l&rsquo;utilizzo di Certify non
              comporta la conservazione permanente dei dati personali.
            </p>
            <ul className="mt-5 space-y-4">
              <li className="text-base leading-relaxed text-foreground/80">
                <span className="font-medium text-foreground">
                  Titolare del Trattamento:
                </span>{" "}
                Tomas Guardati.
              </li>
              <li className="text-base leading-relaxed text-foreground/80">
                <span className="font-medium text-foreground">
                  Dati elaborati:
                </span>{" "}
                L&rsquo;URL di Skilljar fornito dall&rsquo;utente viene
                processato temporaneamente in memoria al solo scopo di estrarre
                i dati necessari alla generazione della grafica. Nessun URL o
                dato personale estratto viene salvato in un database o
                conservato dopo la chiusura della sessione.
              </li>
              <li className="text-base leading-relaxed text-foreground/80">
                <span className="font-medium text-foreground">
                  Dati di Navigazione:
                </span>{" "}
                L&rsquo;infrastruttura di hosting (Vercel) raccoglie
                automaticamente e temporaneamente log di connessione standard
                (es. indirizzi IP, user agent). Questi dati sono necessari per
                garantire il corretto instradamento del traffico, la sicurezza e
                il funzionamento tecnico del servizio.
              </li>
              <li className="text-base leading-relaxed text-foreground/80">
                <span className="font-medium text-foreground">
                  Condivisione:
                </span>{" "}
                Nessun dato viene ceduto, venduto o condiviso con terze parti
                per finalità di marketing o profilazione.
              </li>
            </ul>
          </section>

          {/* 3. Cookie Policy */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              3. Cookie Policy
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/80">
              Questo sito è progettato per rispettare la privacy. Non utilizziamo
              cookie di profilazione, tracker o strumenti di analisi di terze
              parti (es. Google Analytics). Vengono utilizzati esclusivamente
              cookie tecnici o tecnologie simili forniti dall&rsquo;infrastruttura
              di hosting, strettamente necessari per la sicurezza e
              l&rsquo;erogazione del servizio. Per questo motivo, non è richiesto
              un banner di consenso preventivo.
            </p>
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t border-border pt-6">
        <Link
          href="/"
          className="text-xs text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          ← Back to Certify
        </Link>
      </footer>
    </div>
  );
}
