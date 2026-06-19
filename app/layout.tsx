import type { Metadata } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces-var",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope-var",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono-var",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "flexify ai — Picture yourself anywhere. Generated in seconds.",
  description:
    "Upload a selfie and get back an ultra-realistic 4K photo of yourself in front of landmarks, supercars, yachts, and private jets. No travel required.",
  keywords: [
    "AI image generation",
    "photo manipulation",
    "lifestyle photos",
    "AI selfie",
    "virtual travel",
    "4K photos",
  ],
  openGraph: {
    title: "flexify ai — Picture yourself anywhere.",
    description:
      "Ultra-realistic AI-generated lifestyle photos in 4K. Private jets, landmarks, supercars — your face, any backdrop.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "flexify ai — Picture yourself anywhere.",
    description:
      "Ultra-realistic AI-generated lifestyle photos in 4K. Your face, any backdrop.",
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
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
