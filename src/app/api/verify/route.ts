import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Route is fully dynamic: every request scrapes a live external page.
export const dynamic = "force-dynamic";

export interface VerifyResult {
  name: string;
  courseTitle: string;
  verifyId: string;
  /** Completion date, formatted dd/mm/yyyy. Empty if not present. */
  completionDate: string;
}

interface VerifyError {
  error: string;
}

/**
 * Only Skilljar's public credential host is allowed. Locking the hostname and
 * path shape prevents this endpoint from being abused as an SSRF proxy to fetch
 * arbitrary internal/external URLs.
 */
const SKILLJAR_HOST = "verify.skilljar.com";
const VERIFY_PATH = /^\/c\/([A-Za-z0-9]+)\/?$/;

/**
 * Parses and validates a user-supplied Skilljar URL.
 * Returns the canonical URL + verify id, or null if it isn't a valid target.
 */
function parseSkilljarUrl(
  raw: string,
): { url: string; verifyId: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (parsed.hostname.toLowerCase() !== SKILLJAR_HOST) return null;

  const match = parsed.pathname.match(VERIFY_PATH);
  if (!match) return null;

  const verifyId = match[1];
  // Rebuild from trusted parts only — discard any query/fragment/credentials.
  return {
    url: `https://${SKILLJAR_HOST}/c/${verifyId}`,
    verifyId,
  };
}

/** Collapses whitespace and trims. */
function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Confirms the page is genuinely an Anthropic Skilljar certificate. We only
 * want to redesign real, earned credentials, so we require both the Skilljar
 * validation table and an Anthropic issuing reference.
 */
function looksLikeAnthropicSkilljar($: cheerio.CheerioAPI): boolean {
  const hasCertTable =
    $(".certificate-table").length > 0 ||
    $("#certificate_table_student_row").length > 0;

  const anthropicRef = [
    $('meta[property="og:site_name"]').attr("content") ?? "",
    $("#certificate_table_issuing_organization_row td").text(),
    $('meta[name="description"]').attr("content") ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes("anthropic");

  return hasCertTable && anthropicRef;
}

/**
 * Reformats Skilljar's "June 13, 2026" completion date as dd/mm/yyyy to match
 * the certificate design. Falls back to the raw string if it can't be parsed.
 */
function formatCompletionDate(raw: string): string {
  const text = clean(raw);
  if (!text) return "";
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(parsed.getDate())}/${pad(
    parsed.getMonth() + 1,
  )}/${parsed.getFullYear()}`;
}

/**
 * Extracts student name, course title, and completion date from a Skilljar
 * credential page. The primary source is Skilljar's validation table (stable
 * row IDs); we fall back to the page's meta description if a row is missing.
 */
function extractCertificate($: cheerio.CheerioAPI): {
  name: string;
  courseTitle: string;
  completionDate: string;
} | null {
  // Primary: Skilljar's "Validation Information" table.
  let name = clean($("#certificate_table_student_row td").text());
  let courseTitle = clean(
    $("#certificate_table_course_completed_row td").text(),
  );
  const completionDate = formatCompletionDate(
    $("#certificate_table_completion_date_row td").text(),
  );

  // Fallback: the meta description reads
  // "This certificate verifies that <Name> completed <Course>".
  if (!name || !courseTitle) {
    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      "";
    const m = /verifies that\s+(.+?)\s+completed\s+(.+?)\s*$/i.exec(
      clean(description),
    );
    if (m) {
      if (!name) name = clean(m[1]);
      if (!courseTitle) courseTitle = clean(m[2]);
    }
  }

  if (!name || !courseTitle) return null;
  return { name, courseTitle, completionDate };
}

async function handleVerify(
  rawUrl: string | null,
): Promise<NextResponse<VerifyResult | VerifyError>> {
  if (!rawUrl) {
    return NextResponse.json(
      { error: "A Skilljar certificate URL is required." },
      { status: 400 },
    );
  }

  const target = parseSkilljarUrl(rawUrl);
  if (!target) {
    return NextResponse.json(
      {
        error:
          "That doesn't look like a Skilljar credential URL. Expected https://verify.skilljar.com/c/<id>.",
      },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(target.url, {
      headers: {
        // Some hosts reject requests without a browser-like UA.
        "User-Agent":
          "Mozilla/5.0 (compatible; CertifyBot/1.0; +credential-redesign)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach Skilljar to validate the certificate." },
      { status: 502 },
    );
  }

  if (res.status === 404) {
    return NextResponse.json(
      { error: "No certificate exists at that URL. It may be invalid." },
      { status: 404 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Skilljar returned an unexpected status (${res.status}).` },
      { status: 502 },
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  if (!looksLikeAnthropicSkilljar($)) {
    return NextResponse.json(
      {
        error:
          "This page is not a recognized Anthropic certificate. We only redesign real, earned Anthropic credentials.",
      },
      { status: 422 },
    );
  }

  const extracted = extractCertificate($);
  if (!extracted) {
    return NextResponse.json(
      {
        error:
          "Couldn't read the name and course from this certificate. The page format may have changed.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    name: extracted.name,
    courseTitle: extracted.courseTitle,
    verifyId: target.verifyId,
    completionDate: extracted.completionDate,
  });
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  return handleVerify(body.url ?? null);
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  return handleVerify(url);
}
