"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme, useTracking, useLicenseChecker } from "@/components/providers";
import {
  menuContainerVariants,
  menuItemVariants,
  menuContentVariants,
} from "@/lib/constants/animation-variants";

// Social media icon components
const FacebookIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface NavbarProps {
  /** Whether to show the marquee ticker (default: false) */
  showMarquee?: boolean;
  /** Whether to hide navbar until user scrolls (default: false) */
  hideUntilScroll?: boolean;
}

const mobileMenuItems = [
  { label: "Find Locations", href: "/locations" },
  { label: "Postage Calculator", href: "/rates" },
  { label: "Driver's License", href: "#", overlay: "license" as const },
  { label: "Tenders & Quotations", href: "/tenders" },
  { label: "Customs Declaration", href: "https://cds.zimpost.co.zw/CDS.Web/operational/andeclaration.aspx?op=%5bOperatorCode%5d&usegoogleapi=y", external: true },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "Philately", href: "/philately" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

const quickLinksMenuItems = [
  { label: "Find Locations", href: "/locations" },
  { label: "Postage Calculator", href: "/rates" },
  { label: "Driver's License", href: "#", overlay: "license" as const },
  { label: "Customs Declaration", href: "https://cds.zimpost.co.zw/CDS.Web/operational/andeclaration.aspx?op=%5bOperatorCode%5d&usegoogleapi=y", external: true },
];

const servicesMenuItems = [
  { label: "All Services", href: "/services" },
  { label: "Mail & Logistics", href: "/services/mail-logistics" },
  { label: "Express & Courier", href: "/services/express-courier" },
  { label: "Financial Services", href: "/services/financial-services" },
  { label: "Government Services", href: "/services/government-services" },
  { label: "E-Commerce", href: "/services/ecommerce" },
  { label: "Retail & Other", href: "/services/retail" },
];

const companyMenuItems = [
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "Philately", href: "/philately" },
  { label: "Tenders", href: "/tenders" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { name: "facebook", url: "https://facebook.com/zimposts", icon: FacebookIcon, color: "#1877F2" },
  { name: "whatsapp", url: "https://wa.me/263710592990", icon: WhatsAppIcon, color: "#25D366" },
  { name: "linkedin", url: "https://linkedin.com/company/zimpost-official", icon: LinkedInIcon, color: "#0A66C2" },
  { name: "instagram", url: "https://instagram.com/zimbabwepost", icon: InstagramIcon, color: "#E4405F" },
  { name: "x", url: "https://x.com/Zimposts", icon: XIcon, color: "#000000" },
];

export function Navbar({ showMarquee = false, hideUntilScroll = false }: NavbarProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { trackBtnRef, openTracking } = useTracking();
  const { openLicenseChecker } = useLicenseChecker();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(!hideUntilScroll);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);

      // Show navbar after scrolling past threshold (for hideUntilScroll mode)
      if (hideUntilScroll) {
        setVisible(scrollY > 100);
      }

      // Close menu on scroll
      if (menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Handle track button click - always opens tracking overlay
  const handleTrackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openTracking();
  };

  return (
    <div
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 max-w-screen transition-all duration-300 ${
        hideUntilScroll && !visible ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
      }`}
    >
      <motion.header
        initial={{ y: hideUntilScroll ? 0 : -32, opacity: hideUntilScroll ? 1 : 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto transition-all duration-300 overflow-hidden ${
          menuOpen
            ? "max-w-6xl bg-[var(--background)] rounded-2xl shadow-xl shadow-black/10"
            : scrolled
              ? "max-w-5xl bg-[var(--background)]/95 backdrop-blur-xl shadow-xl shadow-black/10 rounded-2xl"
              : "max-w-5xl bg-[var(--background)]/90 backdrop-blur-xl shadow-xl shadow-black/5 rounded-2xl"
        }`}
      >
        {/* Navbar Row */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Left - Menu Button + Logo (mobile) */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 transition-colors text-[var(--foreground)] hover:text-[var(--foreground)]/70"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-base font-medium hidden sm:inline">
                Menu
              </span>
            </button>

            {/* Logo - Left on mobile */}
            <Link href="/" className="flex sm:hidden items-center">
              <Image
                src={
                  isDarkMode
                    ? "/images/full-logo-white.svg"
                    : "/images/full-logo.svg"
                }
                alt="Zimpost"
                width={100}
                height={32}
                className="h-6 w-auto"
              />
            </Link>
          </div>

          {/* Center - Logo (tablet/desktop) */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center z-10"
          >
            <Image
              src={
                isDarkMode
                  ? "/images/full-logo-white.svg"
                  : "/images/full-logo.svg"
              }
              alt="Zimpost"
              width={130}
              height={42}
              className="h-8 lg:h-9 w-auto"
            />
          </Link>

          {/* Right Side - Theme Toggle + Login + Track */}
          <div className="flex items-center gap-2 relative z-20">
            {/* Theme Toggle */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-[18px] h-[18px]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-[18px] h-[18px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

{/* Login button hidden for now */}
            <button
              ref={trackBtnRef}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleTrackClick}
              className="relative z-20 flex items-center justify-center h-10 px-5 text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 active:bg-[var(--color-primary)]/80 rounded-xl transition-colors cursor-pointer select-none"
            >
              Track
            </button>
          </div>
        </div>

        {/* Dropdown Menu Content */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              variants={menuContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-2 sm:pt-4">
                {/* Mobile Menu - Single Column List */}
                <motion.div
                  variants={menuContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="md:hidden"
                >
                  <nav className="space-y-0">
                    {mobileMenuItems.map((item) => (
                      <motion.div key={item.label} variants={menuItemVariants}>
                        {"overlay" in item && item.overlay === "license" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              openLicenseChecker();
                            }}
                            className="w-full text-left flex items-center justify-between py-3.5 text-lg font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                          >
                            {item.label}
                          </button>
                        ) : "external" in item && item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center justify-between py-3.5 text-lg font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center justify-between py-3.5 text-lg font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                          >
                            {item.label}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </nav>

                  {/* Social Links - Mobile */}
                  <motion.div
                    variants={menuItemVariants}
                    className="flex items-center gap-3 mt-6"
                  >
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: `${social.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: social.color }} />
                        </a>
                      );
                    })}
                  </motion.div>
                </motion.div>

                {/* Desktop Menu - 3 Column Grid */}
                <motion.div
                  variants={menuContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="hidden md:grid md:grid-cols-3 gap-12"
                >
                  {/* Column 1 - Quick Links */}
                  <div>
                    <motion.p
                      variants={menuItemVariants}
                      className="text-[11px] uppercase tracking-[0.15em] mb-4 text-[var(--foreground)]/40"
                    >
                      Quick Links
                    </motion.p>
                    <nav className="space-y-1">
                      {quickLinksMenuItems.map((item) => (
                        <motion.div
                          key={item.label}
                          variants={menuItemVariants}
                        >
                          {"overlay" in item && item.overlay === "license" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpen(false);
                                openLicenseChecker();
                              }}
                              className="w-full text-left group flex items-center gap-2 py-2.5 text-xl font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                            >
                              {item.label}
                            </button>
                          ) : "external" in item && item.external ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMenuOpen(false)}
                              className="group flex items-center gap-2 py-2.5 text-xl font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                            >
                              {item.label}
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={() => setMenuOpen(false)}
                              className="group flex items-center gap-2 py-2.5 text-xl font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                            >
                              {item.label}
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Column 2 - Company */}
                  <div>
                    <motion.p
                      variants={menuItemVariants}
                      className="text-[11px] uppercase tracking-[0.15em] mb-4 text-[var(--foreground)]/40"
                    >
                      Company
                    </motion.p>
                    <nav className="space-y-1">
                      {companyMenuItems.map((item) => (
                        <motion.div
                          key={item.label}
                          variants={menuItemVariants}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="block py-2.5 text-xl font-medium transition-colors border-b text-[var(--foreground)] hover:text-[var(--foreground)]/70 border-[var(--foreground)]/10"
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    {/* Social Links */}
                    <motion.div
                      variants={menuItemVariants}
                      className="flex items-center gap-3 mt-6"
                    >
                      {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                          <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: `${social.color}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: social.color }} />
                          </a>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Column 3 - Featured */}
                  <div>
                    <motion.div
                      variants={menuItemVariants}
                      className="flex items-center gap-2 mb-4"
                    >
                      <span className="text-[11px] uppercase tracking-[0.15em] text-[var(--foreground)]/40">
                        Featured
                      </span>
                      <span className="text-[10px] bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">
                        New
                      </span>
                    </motion.div>
                    <motion.div
                      variants={menuItemVariants}
                      className="relative rounded-xl overflow-hidden h-56 shadow-lg"
                    >
                      {/* Background Image */}
                      <Image
                        src="/images/zimbabwe-mall.png"
                        alt="Zimbabwe Mall"
                        fill
                        className="object-cover"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                      {/* Glassy Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="backdrop-blur-md bg-white/10 rounded-lg p-3 border border-white/20">
                          <p className="text-lg font-semibold mb-1 text-white">
                            Zimbabwe Mall
                          </p>
                          <p className="text-[11px] mb-2 text-white/80 leading-relaxed">
                            Shop online for phones, stationery, hardware & more from Zimpost.
                          </p>
                          <Link
                            href="https://zimbabwemall.post"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-white text-[var(--color-primary)] hover:bg-white/90"
                          >
                            Shop now
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Scrolling Marquee Ticker - Optional */}
      {showMarquee && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: scrolled || menuOpen ? 0 : 1,
            y: scrolled || menuOpen ? -20 : 0,
            height: scrolled || menuOpen ? 0 : "auto",
          }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto mt-1.5 overflow-hidden pointer-events-none"
        >
          <div className="bg-[#312783] py-1 rounded-full">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-[10px] font-medium tracking-[0.12em] text-white/90 uppercase px-3">
                    Send Packages Nationwide
                  </span>
                  <span className="text-white/40 text-[10px] px-1.5">✦</span>
                  <span className="text-[10px] font-medium tracking-[0.12em] text-white/90 uppercase px-3">
                    Track Your Shipment
                  </span>
                  <span className="text-white/40 text-[10px] px-1.5">✦</span>
                  <span className="text-[10px] font-medium tracking-[0.12em] text-white/90 uppercase px-3">
                    230+ Locations
                  </span>
                  <span className="text-white/40 text-[10px] px-1.5">✦</span>
                  <span className="text-[10px] font-medium tracking-[0.12em] text-white/90 uppercase px-3">
                    Business Solutions
                  </span>
                  <span className="text-white/40 text-[10px] px-1.5">✦</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
