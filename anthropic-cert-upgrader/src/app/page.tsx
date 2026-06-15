"use client";

import { useState, type FormEvent } from "react";
import { CertificateCard } from "@/components/CertificateCard";

interface VerifyResult {
  name: string;
  courseTitle: string;
  verifyId: string;
  completionDate: string;
}

type Status = "idle" | "loading" | "error" | "success";

// --- Project credits (footer) ---
const AUTHOR = "Tomas Guardati";
const LAST_UPDATED = "June 15, 2026";
// TODO: set this to your portfolio URL once it's live, e.g. "https://tomasguardati.com".
// While empty, the footer shows "Portfolio — coming soon" instead of a link.
const PORTFOLIO_URL: string = "";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim() || status === "loading") return;

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Validation failed. Please try again.");
        setStatus("error");
        return;
      }

      setResult(data as VerifyResult);
      setStatus("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setError(null);
    setResult(null);
    setUrl("");
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-6 py-20 sm:py-28">
      <main className="flex flex-1 flex-col">
      <header className="flex flex-col items-start">
        <span className="text-xs font-medium uppercase tracking-[0.32em] text-muted">
          Certify
        </span>
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
          Your AI skills deserve better design.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Paste your official Anthropic Skilljar certificate URL. We&rsquo;ll
          validate the credential, then generate a redesigned, download-ready
          version — yours to keep.
        </p>
      </header>

      {status !== "success" && (
        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-3">
          <label htmlFor="cert-url" className="sr-only">
            Skilljar certificate URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="cert-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://verify.skilljar.com/c/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status === "loading"}
              className="flex-1 border border-border bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-muted focus:border-foreground focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading" || !url.trim()}
              className="bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Validating…" : "Redesign"}
            </button>
          </div>

          {status === "loading" && (
            <p className="text-sm text-muted">
              Validating credentials via Skilljar…
            </p>
          )}
          {status === "error" && error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </form>
      )}

      {status === "success" && result && (
        <section className="mt-12 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div>
              <p className="text-sm text-muted">Credential validated</p>
              <p className="mt-1 text-base text-foreground">
                {result.name} — {result.courseTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Verify another
            </button>
          </div>
          <CertificateCard
            name={result.name}
            courseTitle={result.courseTitle}
            verifyId={result.verifyId}
            issuedOn={result.completionDate || undefined}
          />
        </section>
      )}
      </main>

      <footer className="mt-20 flex flex-col items-end gap-1 border-t border-border pt-6 text-right text-xs text-muted">
        <p>
          Built by <span className="text-foreground">{AUTHOR}</span>
        </p>
        <p className="flex items-center gap-2">
          <span>Last updated {LAST_UPDATED}</span>
          <span aria-hidden="true">·</span>
          {PORTFOLIO_URL ? (
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Portfolio
            </a>
          ) : (
            <span className="italic">Portfolio — coming soon</span>
          )}
        </p>
      </footer>
    </div>
  );
}
