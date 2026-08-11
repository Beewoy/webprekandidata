import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "WebPreKandidata.sk", template: "%s | WebPreKandidata.sk" },
  description: "Jednoduchý editor profesionálnych webov pre kandidátov.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="sk"><body>{children}</body></html>;
}
