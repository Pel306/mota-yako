"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Mail } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Track", href: "/track" },
  { name: "Locations", href: "/locations" },
  { name: "Business", href: "/business" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[var(--color-gray-200)] sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[var(--color-primary)] text-white text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-6">
              <a href="tel:+263242250092" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+263 242 250 092</span>
              </a>
              <a href="mailto:info@zimpost.co.zw" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Mail className="w-3.5 h-3.5" />
                <span>info@zimpost.co.zw</span>
              </a>
            </div>
            <div className="text-white/80 text-xs sm:text-sm">
              Mon - Fri: 8:00 AM - 4:30 PM
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="h-9 w-9"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="8" fill="var(--color-primary)" />
                <path
                  d="M10 15L20 10L30 15V25L20 30L10 25V15Z"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M20 10V30M10 15L30 25M30 15L10 25"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              </svg>
              <span className="text-xl font-bold text-[var(--color-primary)]">ZIMPOST</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/track"
              className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              Track Parcel
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-[var(--foreground)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--color-gray-200)]">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-[var(--color-gray-200)]">
              <Link
                href="/track"
                className="block w-full px-4 py-3 text-center font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Track Parcel
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
