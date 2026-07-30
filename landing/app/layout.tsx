import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { copy } from "@/lib/copy";

/**
 * Three faces doing three jobs, which is what stops a black and white page
 * reading as an unstyled document.
 *
 * Instrument Serif carries the headings: high contrast, a bit editorial, and it
 * gives the page the one bit of personality it is allowed to have. Instrument
 * Sans is its companion for body text, so the pairing is designed rather than
 * assembled. JetBrains Mono is the wordmark and every shell command, because
 * the thing being sold is a tool you run in a terminal.
 */
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${code.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
