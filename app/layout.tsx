import "@fontsource-variable/inter";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "WebPreKandidata.sk", template: "%s | WebPreKandidata.sk" },
  description: "Jednoduchý editor profesionálnych webov pre kandidátov.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="sk" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
