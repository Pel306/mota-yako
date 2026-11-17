"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { GlobalTrackingOverlay } from "./global-tracking-overlay";
import { ThemeProvider, TrackingProvider, LicenseCheckerProvider } from "@/components/providers";
import { LicenseCheckerOverlay } from "@/components/home/license-checker-overlay";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Design preview pages get no layout
  const isDesignPage =
    pathname?.startsWith("/designs/") && pathname !== "/designs";

  // Main page uses marquee on navbar
  const isMainPage = pathname === "/";

  // Article pages hide navbar until scroll
  const isArticlePage =
    pathname?.startsWith("/news/") && pathname !== "/news";

  if (isDesignPage) {
    return (
      <ThemeProvider>
        <TrackingProvider>
          <LicenseCheckerProvider>{children}</LicenseCheckerProvider>
        </TrackingProvider>
      </ThemeProvider>
    );
  }

  // All pages get global navbar and tracking overlay
  return (
    <ThemeProvider>
      <TrackingProvider>
        <LicenseCheckerProvider>
          {/* Global Tracking Overlay - available on all pages */}
          <GlobalTrackingOverlay />

          {/* Global License Checker Overlay - available on all pages */}
          <LicenseCheckerOverlay />

          {/* Global Navbar - showMarquee only on home page, hideUntilScroll on article pages */}
          <Navbar showMarquee={isMainPage} hideUntilScroll={isArticlePage} />

          {/* Page content */}
          <main className="flex-1">{children}</main>

          {/* Footer - hidden on main page (it has its own footer) */}
          {!isMainPage && <Footer />}
        </LicenseCheckerProvider>
      </TrackingProvider>
    </ThemeProvider>
  );
}
