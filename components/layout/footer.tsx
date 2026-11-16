"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Mail, MapPin } from "lucide-react";
import { useTracking, useLicenseChecker } from "@/components/providers";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const footerLinks = {
  services: [
    { label: "All Services", href: "/services" },
    { label: "Mail & Logistics", href: "/services/mail-logistics" },
    { label: "Express & Courier", href: "/services/express-courier" },
    { label: "Financial Services", href: "/services/financial-services" },
    { label: "Government Services", href: "/services/government-services" },
    { label: "E-Commerce", href: "/services/ecommerce" },
    { label: "Retail & Other", href: "/services/retail" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Locations", href: "/locations" },
    { label: "Careers", href: "/careers" },
    { label: "Tenders", href: "/tenders" },
    { label: "News", href: "/news" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
  ],
};

export function Footer() {
  const currentYear = 2025;
  const { openTracking } = useTracking();
  const { openLicenseChecker } = useLicenseChecker();
  const footerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([logoRef.current, contactRef.current, bottomRef.current], {
        opacity: 0,
        y: 20
      });

      if (linksRef.current) {
        gsap.set(linksRef.current.querySelectorAll(".footer-column"), {
          opacity: 0,
          y: 20
        });
      }

      // Single ScrollTrigger for all animations
      ScrollTrigger.create({
        trigger: footerRef.current,
        start: "top 90%",
        once: true,
        onEnter: () => {
          // Animate logo
          gsap.to(logoRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });

          // Animate link columns with stagger
          if (linksRef.current) {
            gsap.to(linksRef.current.querySelectorAll(".footer-column"), {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: "power2.out",
              delay: 0.1,
            });
          }

          // Animate contact
          gsap.to(contactRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.2,
          });

          // Animate bottom bar
          gsap.to(bottomRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            delay: 0.3,
          });
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/footer-bg-red.jpg"
          alt="Zimpost delivery network"
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div ref={logoRef} className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/full-logo-white.svg"
                alt="Zimpost"
                width={160}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-white/80 mb-6 max-w-sm text-sm leading-relaxed">
              Zimbabwe&apos;s leading postal and courier service provider.
              Connecting communities nationwide through 230+ locations.
            </p>

            {/* Contact Info */}
            <div ref={contactRef} className="space-y-3 text-sm">
              <a
                href="tel:+263242783583"
                className="flex items-center gap-3 text-white hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+263 242 783 583</span>
              </a>
              <a
                href="mailto:info@zimpost.co.zw"
                className="flex items-center gap-3 text-white hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>info@zimpost.co.zw</span>
              </a>
              <div className="flex items-start gap-3 text-white">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>P.O. Box 100, Harare, Zimbabwe</span>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div ref={linksRef} className="lg:col-span-3 grid grid-cols-3 gap-8">
            {/* Services Column */}
            <div className="footer-column">
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-4">Services</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={openTracking}
                    className="footer-link text-sm text-white hover:text-white transition-colors inline-block cursor-pointer"
                  >
                    Track Parcel
                  </button>
                </li>
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    {"overlay" in link && link.overlay === "license" ? (
                      <button
                        onClick={openLicenseChecker}
                        className="footer-link text-sm text-white hover:text-white transition-colors inline-block cursor-pointer"
                      >
                        {link.label}
                      </button>
                    ) : "external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link text-sm text-white hover:text-white transition-colors inline-block"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="footer-link text-sm text-white hover:text-white transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="footer-column">
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="footer-link text-sm text-white hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className="footer-column">
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="footer-link text-sm text-white hover:text-white transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div ref={bottomRef} className="relative z-10 border-t border-white/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white">
            <p>© {currentYear} Zimbabwe Posts (Pvt) Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="hidden sm:inline text-white">•</span>
              <span className="hidden sm:inline">Government of Zimbabwe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
