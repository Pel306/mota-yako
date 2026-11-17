"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Find Cars", href: "/cars" },
  { label: "Dealers", href: "/dealers" },
  { label: "Sell Your Car", href: "/cars/sell" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/cars") return pathname === "/cars" || /^\/cars\/[^/]+$/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <strong>Zimbabwe&apos;s verified car marketplace</strong>
          <div className="topbar-links">
            <span>USD pricing</span>
            <span>Zimbabwe</span>
            <a href="https://wa.me/263777183773">WhatsApp: +263 777 183 773</a>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container header-main">
          <Link href="/" aria-label="Mota Yako home" className="logo">
            <span className="logo-mark" aria-hidden="true" />
            <span className="logo-text">
              MOTA <span>YAKO</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Primary navigation">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={isActive(pathname, href) ? "active" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div className="header-actions">
            <Link className="btn btn-outline" href="/cars">
              Browse
            </Link>
            <Link className="btn btn-primary" href="/cars/sell">
              List a car
            </Link>
          </div>
        </div>
      </header>
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="mobile-nav open"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={isActive(pathname, href) ? "active" : undefined}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mobile-nav-actions">
              <Link className="btn btn-outline" href="/cars" onClick={() => setMenuOpen(false)}>
                Browse
              </Link>
              <Link className="btn btn-primary" href="/cars/sell" onClick={() => setMenuOpen(false)}>
                List a car
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
