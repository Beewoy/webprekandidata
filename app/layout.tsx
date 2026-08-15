import "@fontsource-variable/inter";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FirebaseAnalytics } from "@/components/analytics/firebase-analytics";
import { PLATFORM_OPEN_GRAPH_IMAGE } from "@/lib/marketing/metadata";

const description = "Jednoduchý editor profesionálnych webov pre kandidátov.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "WebPreKandidata.sk", template: "%s | WebPreKandidata.sk" },
  description,
  openGraph: {
    title: "WebPreKandidata.sk",
    description,
    siteName: "WebPreKandidata.sk",
    locale: "sk_SK",
    type: "website",
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
  robots: { index: false, follow: false },
  twitter: {
    card: "summary_large_image",
    title: "WebPreKandidata.sk",
    description,
    images: [PLATFORM_OPEN_GRAPH_IMAGE],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="sk" data-scroll-behavior="smooth">
      <body>
        {children}
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
