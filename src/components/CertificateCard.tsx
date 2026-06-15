"use client";

import { useEffect, useRef, useState } from "react";
import { Certificate, type CertificateProps } from "./Certificate";

type CertFormat = "standard" | "wide";

interface FormatSpec {
  id: CertFormat;
  label: string;
  width: number;
  /** Fixed canvas height, or null for content-driven (the original look). */
  height: number | null;
}

// Each format is a full-bleed canvas the certificate fills. Standard is the
// content-driven portrait look; 16:9 scales its type and spacing up to fill the
// wider landscape canvas (see Certificate's landscape mode).
const FORMATS: FormatSpec[] = [
  { id: "standard", label: "Standard", width: 1000, height: null },
  { id: "wide", label: "16:9", width: 1280, height: 720 },
];

/** Filesystem-safe slug for the downloaded file name. */
function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "certificate"
  );
}

/**
 * Wraps the certificate in a responsive, scaled preview and provides
 * "Download as PDF". The certificate node keeps its intrinsic 1000px width, so
 * the snapshot captures it at full resolution; only the outer wrapper is scaled
 * for on-screen fit. Height is content-driven and measured at runtime.
 */
export function CertificateCard({
  name,
  courseTitle,
  verifyId,
  issuedOn,
}: Pick<
  CertificateProps,
  "name" | "courseTitle" | "verifyId" | "issuedOn"
>) {
  const certRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [certHeight, setCertHeight] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const [format, setFormat] = useState<CertFormat>("standard");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = FORMATS.find((f) => f.id === format) ?? FORMATS[0];

  // Generate the verification QR locally as a data URL. Doing this client-side
  // (rather than an external image) keeps html2canvas from tainting the canvas.
  useEffect(() => {
    let active = true;
    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(`https://verify.skilljar.com/c/${verifyId}`, {
        margin: 1,
        width: 160,
      })
        .then((dataUrl) => {
          if (active) setQrDataUrl(dataUrl);
        })
        .catch((err) => console.error("QR generation failed:", err));
    });
    return () => {
      active = false;
    };
  }, [verifyId]);

  // Scale to fit the preview column, and track the certificate's rendered
  // height so the preview box matches its content exactly (avoids clipping the
  // footer). Re-measures on resize, after web fonts load, and once the QR is in
  // — all of which can change the rendered height.
  useEffect(() => {
    const previewEl = previewRef.current;
    const certEl = certRef.current;
    if (!previewEl || !certEl) return;

    const update = () => {
      setScale(previewEl.clientWidth / fmt.width);
      setCertHeight(certEl.offsetHeight);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(previewEl);
    observer.observe(certEl);

    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!cancelled) update();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [qrDataUrl, fmt.width]);

  async function handleDownload() {
    const node = certRef.current;
    if (!node) return;

    setDownloading(true);
    setError(null);
    try {
      // Make sure web fonts are in before snapshotting.
      await (document.fonts?.ready ?? Promise.resolve());

      // html-to-image renders the node via an SVG <foreignObject>, so the
      // browser itself lays out the text — spacing, kerning, and letter-spacing
      // come out pixel-identical to the live preview. This sidesteps the
      // html2canvas text engine entirely (the "TomasGuardati" space-collapse).
      // Dynamically imported: both libs touch `window`.
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      const width = node.offsetWidth;
      const height = node.offsetHeight;

      const imgData = await toPng(node, {
        pixelRatio: 2, // 2× for crisp, print-quality output
        backgroundColor: "#Fdfbf7",
        width,
        height,
        // The wrapper is visually scaled for preview; force the snapshot to the
        // certificate's intrinsic, unscaled size.
        style: { transform: "none", margin: "0" },
      });

      const pdf = new jsPDF({
        orientation: width >= height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`anthropic-${slugify(courseTitle)}-${fmt.id}-certificate.pdf`);
    } catch (err) {
      console.error("Certificate PDF export failed:", err);
      setError("Something went wrong generating the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Aspect-ratio selector */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFormat(f.id)}
            aria-pressed={format === f.id}
            className={`border px-4 py-2 text-sm transition-colors ${
              format === f.id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:border-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Responsive scaled preview. The inner certificate keeps its intrinsic
          width (so the snapshot captures it at full resolution); the wrapper is
          scaled to fit the column width. */}
      <div
        ref={previewRef}
        className="w-full overflow-hidden"
        style={{ height: certHeight ? certHeight * scale : undefined }}
      >
        <div
          style={{
            width: fmt.width,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <Certificate
            ref={certRef}
            name={name}
            courseTitle={courseTitle}
            verifyId={verifyId}
            qrDataUrl={qrDataUrl}
            issuedOn={issuedOn}
            width={fmt.width}
            height={fmt.height}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading
            ? "Generating PDF…"
            : `Download ${fmt.label} as PDF`}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
