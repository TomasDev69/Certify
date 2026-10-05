import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://certify.tmslab.it"),
  title: "Certify — Redesign Your Anthropic Certificate",
  description:
    "Validate an official Anthropic Skilljar certificate and generate a beautifully redesigned, downloadable version.",
  openGraph: {
    title: "Certify — Redesign Your Anthropic Certificate",
    description:
      "Validate an official Anthropic Skilljar certificate and generate a beautifully redesigned, downloadable version.",
    url: "https://certify.tmslab.it",
    siteName: "Certify",
    images: [
      {
        url: "/logo.png",
        width: 960,
        height: 960,
        alt: "Certify logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Certify — Redesign Your Anthropic Certificate",
    description:
      "Validate an official Anthropic Skilljar certificate and generate a beautifully redesigned, downloadable version.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "2e2473c4002a4ef08ec00b8fe2003946"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
