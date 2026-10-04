import type { Metadata } from "next";
import Link from "next/link";
import { changelog, type ChangelogKind } from "@/lib/changelog-data";

export const metadata: Metadata = {
  title: "Changelog — Certify",
  description: "Every change made to Certify, newest first.",
  openGraph: {
    title: "Changelog — Certify",
    description: "Every change made to Certify, newest first.",
  },
};

function kindLabel(kind: ChangelogKind): string {
  switch (kind) {
    case "MAJOR":
      return "Major update";
    case "MINOR":
      return "Update";
    default:
      return "Patch";
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function ChangelogPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-20 sm:py-28">
      <main className="flex flex-1 flex-col">
        <header className="border-b border-border pb-10">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.32em] text-muted transition-colors hover:text-foreground"
          >
            &larr; Certify
          </Link>
          <h1 className="mt-8 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Changelog
          </h1>
          <p className="mt-4 text-sm text-muted">
            Every change made to Certify, newest first.
          </p>
        </header>

        <ol className="mt-12 flex flex-col gap-8 border-l border-border pl-6">
          {changelog.map((e) => (
            <li key={e.version} className="relative">
              <span
                aria-hidden="true"
                className="absolute top-2 -left-[29px] size-2.5 rounded-full bg-[#d97757] ring-4 ring-background"
              />
              <article className="border border-border bg-surface p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="border border-border px-2 py-0.5 font-mono text-xs text-foreground">
                    v{e.version}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                    {kindLabel(e.kind)}
                  </span>
                  <time
                    dateTime={e.releasedAt}
                    className="ml-auto shrink-0 font-mono text-xs text-muted"
                  >
                    {formatDate(e.releasedAt)}
                  </time>
                </div>
                <h2 className="text-lg font-medium tracking-tight text-foreground">
                  {e.title}
                </h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                  {e.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </main>

      <footer className="mt-20 flex items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted">
        <span>Certify</span>
      </footer>
    </div>
  );
}
