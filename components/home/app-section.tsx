"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, MapPin, Car, IdCard } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AppSectionProps {
  isDarkMode: boolean;
}

const appFeatures = [
  { icon: Package, label: "Send Parcels" },
  { icon: MapPin, label: "Track Parcels" },
  { icon: Car, label: "Insurance & Licensing" },
  { icon: IdCard, label: "Licence Checker" },
];

const socialLinks = [
  { name: "Facebook", src: "/logos/facebook.png", href: "https://www.facebook.com/share/1FoYeeB6j7/" },
  { name: "LinkedIn", src: "/logos/linkedin.png", href: "https://www.linkedin.com/company/zimpost/" },
  { name: "Instagram", src: "/logos/instagram.png", href: "https://www.instagram.com/zimpostpvtltd" },
  { name: "Twitter", src: "/logos/twitter.png", href: "https://x.com/Zimposts" },
  { name: "WhatsApp", src: "/logos/whatsapp.png", href: "https://wa.me/263710592990" },
];

export function AppSection({ isDarkMode }: AppSectionProps) {
  const appSectionRef = useRef<HTMLElement>(null);
  const appImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appImageRef.current || !appSectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        appImageRef.current,
        { y: "-25%", scale: 1 },
        {
          y: "35%",
          scale: 2,
          ease: "none",
          scrollTrigger: {
            trigger: appSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* App Parallax Image Section */}
      <section
        ref={appSectionRef}
        className={`relative h-[350px] md:h-[550px] lg:h-[600px] overflow-hidden ${
          isDarkMode
           // ? "bg-gradient-to-br from-[#1a1a2e] via-[#2d2d44] to-[#1a2a1a]"
            //: "bg-gradient-to-br from-[#f8d77f] via-[#e8e8a0] to-[#a8e0a0]"
            ? "bg-white"
            : "bg-white"
        }`}
      >
        <div
          ref={appImageRef}
          className="absolute inset-x-0 -top-[35%] -bottom-[35%] w-full"
        >
          <Image
            src="/images/phone-mockup-transparent.png"
            alt="Zimpost Mobile App"
            fill
            className="object-contain"
            style={{ objectPosition: "center center" }}
            priority
          />
        </div>
      </section>

      {/* App Features Banner */}
      <section
        className={`relative z-20 ${isDarkMode ? "bg-[#111]" : "bg-[#312783]"}`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left - App Title & CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-lg lg:text-xl font-medium text-white mb-1">
                  Get the Zimpost App
                </h3>
                <p className="text-sm text-white/70">Convenience in your pocket</p>
              </div>
              <Link
                href="#"
                className="transition-transform hover:scale-105 shrink-0"
              >
                <Image
                  src="/images/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  width={140}
                  height={42}
                  className="h-11 w-auto"
                />
              </Link>
            </div>

            {/* Right - Feature Tags */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2 lg:gap-3">
              {appFeatures.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm"
                >
                  <feature.icon
                    className="w-4 h-4 text-white/80"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs lg:text-sm text-white/90">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <Image
                  src={link.src}
                  alt={link.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 opacity-80 hover:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
