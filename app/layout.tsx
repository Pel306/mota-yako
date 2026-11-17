import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import "./marketplace-reference.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Mota Yako — Verified Cars in Zimbabwe",
    template: "%s | Mota Yako",
  },
  description:
    "Find used cars in Zimbabwe from private sellers and dealers. Compare clear USD prices and contact sellers directly.",
  metadataBase: new URL("https://www.motayako.co.zw"),
  openGraph: {
    title: "Mota Yako — Verified Cars in Zimbabwe",
    description:
      "Find your next car with confidence. Browse listings from private sellers and dealers across Zimbabwe.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Suspense fallback={null}>
          <SiteHeader />
        </Suspense>
        <div>{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
