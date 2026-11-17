"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedSection } from "@/components/animations";
import { useTracking, useLicenseChecker } from "@/components/providers";

gsap.registerPlugin(ScrollTrigger);

interface HomeFooterProps {
  isDarkMode: boolean;
}

const footerLinks = {
  services: [
    { label: "Postage Calculator", href: "/rates" },
    { label: "Driver's License", href: "#", overlay: "license" as const },
    { label: "Customs", href: "https://cds.zimpost.co.zw/CDS.Web/operational/andeclaration.aspx?op=%5bOperatorCode%5d&usegoogleapi=y", external: true },
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

export function HomeFooter({ isDarkMode }: HomeFooterProps) {
  const currentYear = 2025;
  const { openTracking } = useTracking();
  const { openLicenseChecker } = useLicenseChecker();
  const envelopeRef = useRef<HTMLDivElement>(null);
  const envelopeTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!envelopeRef.current || !envelopeTriggerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        envelopeRef.current,
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          y: 0,
        },
        {
          scale: 1,
          rotation: -20,
          opacity: 1,
          y: 100,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: envelopeTriggerRef.current,
            start: "top 95%",
            end: "bottom 60%",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Decorative Banner / Mobile Footer Section */}
      <section
        className={`relative z-10 md:px-6 lg:px-12 transition-[background-color] duration-500 ${
          isDarkMode ? "bg-[#0a0a0a]" : "bg-white"
        }`}
      >
        <div className="max-w-350 mx-auto">
          {/* Desktop: Just decorative banner */}
          <div className="hidden md:block">
            <AnimatedSection>
              <div className="relative rounded-3xl h-72 lg:h-80 overflow-hidden">
                <Image
                  src="/footer-bg-red.jpg"
                  alt="Zimpost delivery network"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
              </div>
            </AnimatedSection>
          </div>

          {/* Mobile: Full Footer with background image */}
          <footer className="md:hidden relative">
            <div className="relative max-w-screen w-full rounded-none overflow-hidden">
              <Image
                src="/footer-bg-red.jpg"
                alt="Zimpost delivery network"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />

              <div className="relative z-10 px-6 py-10">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <Image
                    src="/images/full-logo-white.svg"
                    alt="Zimpost"
                    width={140}
                    height={40}
                    className="h-10 w-auto"
                  />
                </div>

                {/* Footer Links Grid */}
                <div className="grid grid-cols-3 gap-3 text-center mb-8">
                  {/* Services */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2">Services</p>
                    <ul className="space-y-2">
                      <li>
                        <button
                          onClick={openTracking}
                          className="text-xs text-white hover:text-white/80 transition-colors cursor-pointer"
                        >
                          Track
                        </button>
                      </li>
                      {footerLinks.services.map((link) => (
                        <li key={link.label}>
                          {"overlay" in link && link.overlay === "license" ? (
                            <button
                              onClick={openLicenseChecker}
                              className="text-xs text-white hover:text-white/80 transition-colors cursor-pointer"
                            >
                              {link.label}
                            </button>
                          ) : "external" in link && link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white hover:text-white/80 transition-colors"
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-xs text-white hover:text-white/80 transition-colors"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Company */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2">Company</p>
                    <ul className="space-y-2">
                      {footerLinks.company.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-xs text-white hover:text-white/80 transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Support */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/50 mb-2">Support</p>
                    <ul className="space-y-2">
                      {footerLinks.support.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-xs text-white hover:text-white/80 transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="text-center mb-6 pb-6 border-b border-white/30">
                  <p className="text-xs text-white mb-1">P.O. Box 100, Harare</p>
                  <p className="text-xs text-white mb-1">+263 242 783 583-94</p>
                  <p className="text-xs text-white">enquiries@zimpost.co.zw</p>
                </div>

                {/* Copyright */}
                <div className="text-center">
                  <p className="text-xs text-white mb-2">
                    © {currentYear} Zimbabwe Posts (Pvt) Ltd. All
                    rights reserved.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-white">
                    <Link
                      href="/privacy"
                      className="hover:text-white/80 transition-colors"
                    >
                      Privacy
                    </Link>
                    <span>•</span>
                    <Link
                      href="/terms"
                      className="hover:text-white/80 transition-colors"
                    >
                      Terms
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </section>

      {/* Creative Envelope Footer - Hidden on mobile */}
      <footer className="hidden md:block relative overflow-visible bg-transparent z-40">
        <div className="relative px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div
              ref={envelopeTriggerRef}
              className="relative -mt-64 lg:-mt-72 mb-6 z-50"
            >
              <div
                ref={envelopeRef}
                className="relative z-50 cursor-pointer"
                style={{ transformOrigin: "center center" }}
              >
                {/* Envelope Shadow */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black/30 blur-xl rounded-full" />

                {/* Envelope Image with Content */}
                <div className="relative hover:-translate-y-2 transition-transform duration-300">
                  <Image
                    src="/envelope.png"
                    alt="Zimpost Envelope"
                    width={900}
                    height={560}
                    className="w-full h-auto drop-shadow-2xl"
                  />

                  {/* "To:" Statement - ON THE FLAP */}
                  <div
                    className="absolute top-[12%] sm:top-[14%] left-1/2 -translate-x-1/2 text-center z-10"
                    style={{ fontFamily: "var(--font-caveat)" }}
                  >
                    <p className="text-lg sm:text-2xl lg:text-3xl text-[#3d2914] leading-tight">
                      To:
                    </p>
                    <p className="text-lg sm:text-2xl lg:text-3xl text-[#3d2914] font-medium leading-tight">
                      Our Valued Customers
                    </p>
                  </div>

                  {/* Footer Content - ON THE ENVELOPE BODY */}
                  <div className="absolute inset-x-0 bottom-[6%] top-[45%] px-[4%] sm:px-[6%] lg:px-[8%] flex flex-col items-center justify-between">
                    {/* Footer Links Grid */}
                    <div
                      className="w-full grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8"
                      style={{ fontFamily: "var(--font-typewriter)" }}
                    >

                      {/* Support */}
                      <div className="text-center">
                        <h2
                          style={{ fontFamily: "var(--font-typewriter)" }}
                          className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-[#3d2914] mb-1 sm:mb-2 uppercase tracking-wide"
                        >
                          Support
                        </h2>
                        <ul className="space-y-0.5 sm:space-y-1">
                          {footerLinks.support.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                className="text-sm sm:text-base lg:text-lg text-[#3d2914]/80 hover:text-[#1e00ff] transition-colors"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Services */}
                      <div className="text-center">
                        <h2
                          style={{ fontFamily: "var(--font-typewriter)" }}
                          className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-[#3d2914] mb-1 sm:mb-2 uppercase tracking-wide"
                        >
                          Services
                        </h2>
                        <ul className="space-y-0.5 sm:space-y-1">
                          <li>
                            <button
                              onClick={openTracking}
                              className="text-sm sm:text-base lg:text-lg text-[#3d2914]/80 hover:text-[#1e00ff] transition-colors cursor-pointer"
                            >
                              Track Parcel
                            </button>
                          </li>
                          {footerLinks.services.map((link) => (
                            <li key={link.label}>
                              {"overlay" in link && link.overlay === "license" ? (
                                <button
                                  onClick={openLicenseChecker}
                                  className="text-sm sm:text-base lg:text-lg text-[#3d2914]/80 hover:text-[#1e00ff] transition-colors cursor-pointer"
                                >
                                  {link.label}
                                </button>
                              ) : "external" in link && link.external ? (
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm sm:text-base lg:text-lg text-[#3d2914]/80 hover:text-[#1e00ff] transition-colors"
                                >
                                  {link.label}
                                </a>
                              ) : (
                                <Link
                                  href={link.href}
                                  className="text-sm sm:text-base lg:text-lg text-[#3d2914]/80 hover:text-[#1e00ff] transition-colors"
                                >
                                  {link.label}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Company */}
                      <div className="text-center">
                        <h2
                          style={{ fontFamily: "var(--font-typewriter)" }}
                          className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-[#3d2914] mb-1 sm:mb-2 uppercase tracking-wide"
                        >
                          Company
                        </h2>
                        <ul className="space-y-0.5 sm:space-y-1">
                          {footerLinks.company.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                className="text-sm sm:text-base lg:text-lg text-[#3d2914]/80 hover:text-[#1e00ff] transition-colors"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Bottom - Copyright */}
                    <div
                      className="text-end w-full"
                      style={{ fontFamily: "var(--font-typewriter)" }}
                    >
                      <div className="text-sm sm:text-sm lg:text-sm text-[#3d2914]">
                        <p className="text-xs sm:text-sm">
                          © {currentYear} Zimbabwe Posts (Pvt) Ltd.
                          All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm justify-end">
                          <Link href="/privacy" className="transition-colors hover:text-[#1e00ff]">
                            Privacy
                          </Link>
                          <Link href="/terms" className="transition-colors hover:text-[#1e00ff]">
                            Terms
                          </Link>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            Government of Zimbabwe
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
