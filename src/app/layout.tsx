import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://lscr.xyz";
const siteName = "{lscr}";
const defaultTitle = "{lscr} — Browse the web without ads, popups & paywalls";
const defaultDescription =
  "{lscr} (LibreScroll) is a free, open-source web proxy that strips ads, popups, banners and paywalls from any site. Just add lscr.xyz/ before any URL to browse distraction-free.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      alternateName: "LibreScroll",
      url: siteUrl,
      logo: `${siteUrl}/images/lscr-logo-without-tag.svg`,
      email: "mailto:hola@lscr.xyz",
      sameAs: [
        "https://github.com/alvaroadlf/lscr",
        "https://www.producthunt.com/products/lscr",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: "LibreScroll",
      url: siteUrl,
      description: defaultDescription,
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: siteName,
      alternateName: "LibreScroll",
      applicationCategory: "BrowserApplication",
      applicationSubCategory: "Web Proxy",
      operatingSystem: "Any (Web, iOS, macOS)",
      url: siteUrl,
      description: defaultDescription,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Removes ads, popups, banners and cookie notices",
        "Bypasses JavaScript-based distractions and overlays",
        "Works by prepending lscr.xyz/ to any URL",
        "iOS & macOS Shortcut for cleaning pages from the share menu",
        "100% open source (MIT License)",
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "lscr",
    "LibreScroll",
    "browse without ads",
    "remove popups from webpage",
    "paywall remover",
    "12ft alternative",
    "remove ads from website",
    "browse without javascript",
    "clean webpage",
    "distraction free browsing",
    "open source web proxy",
  ],
  applicationName: siteName,
  authors: [{ name: "Álvaro", url: "https://github.com/alvaroadlf" }],
  creator: siteName,
  publisher: siteName,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/web/favicon.ico", sizes: "any" },
      { url: "/icons/web/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/web/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/icons/web/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "{lscr} — Browsing Freedom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6ee7b7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
