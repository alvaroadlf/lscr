import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "{lscr} — Browsing Freedom",
    short_name: "{lscr}",
    description:
      "Free, open-source web proxy that removes ads, popups, banners and paywalls from any website.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#6ee7b7",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/web/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/web/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/web/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/web/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
