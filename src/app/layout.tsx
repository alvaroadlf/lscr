import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "{lscr} - browsing freedom",
  description: "Remove popups, banners, and intrusive ads with ease.",
  icons: {
    icon: "/icons/web/favicon.ico",
  },
  openGraph: {
    title: "{lscr}} - browsing freedom",
    description: "Remove popups, banners, and intrusive ads with ease.",
    url: "https://lscr.xyz",
    siteName: "&#123;lscr&#125;",
    images: [
      {
        url: "https://lscr.xyz/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "{lscr}} Open Graph Image",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/web/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/web/apple-touch-icon.png" />
        {/* ...other head elements... */}
      </head>
      <body className={`${inter.className} bg-white antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
