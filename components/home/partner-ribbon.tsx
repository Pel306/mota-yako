"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

interface PartnerRibbonProps {
  isDarkMode: boolean;
}

// Zimpost partners with available logos
const partners = [
  { name: "POTRAZ", logo: "/images/partners/potraz.png" },
  { name: "POSB", logo: "/images/partners/posb.png" },
  { name: "NMB Bank", logo: "/images/partners/nmb.png" },
  { name: "Access Forex", logo: "/images/partners/access-forex.png" },
  { name: "ZINARA", logo: "/images/partners/zinara.png" },
  { name: "FBC Bank", logo: "/images/partners/fbc.png" },
  { name: "CABS", logo: "/images/partners/cabs.png" },
  { name: "IceCash", logo: "/images/partners/ICEcash.png" },
  { name: "MasterCard", logo: "/images/partners/mastercard.png" },
];

export function PartnerRibbon({ isDarkMode }: PartnerRibbonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!trackRef.current || prefersReducedMotion) return;

    const track = trackRef.current;
    const totalWidth = track.scrollWidth / 2;

    tweenRef.current = gsap.to(track, {
      x: -totalWidth,
      duration: 20,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [prefersReducedMotion]);

  const handleMouseEnter = () => {
    if (tweenRef.current && !prefersReducedMotion) {
      tweenRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current && !prefersReducedMotion) {
      tweenRef.current.resume();
    }
  };

  const PartnerLogo = ({
    partner,
    keyPrefix,
  }: {
    partner: (typeof partners)[0];
    keyPrefix: string;
  }) => {
    const [hasError, setHasError] = useState(false);

    return (
      <div
        key={`${partner.name}-${keyPrefix}`}
        className="group flex-shrink-0 px-6 md:px-10"
      >
        <div className="relative h-10 w-24 md:w-28 flex items-center justify-center">
          {!hasError ? (
            <Image
              src={partner.logo}
              alt={partner.name}
              width={100}
              height={40}
               className={`object-contain max-h-8 md:max-h-10 transition-all duration-300`}
              // className={`object-contain max-h-8 md:max-h-10 transition-all duration-300
              //    ${
              //   isDarkMode
              //     ? "brightness-0 invert opacity-50 group-hover:opacity-90"
              //     : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
              // }
              // `}
              onError={() => setHasError(true)}
            />
          ) : (
            <span
              className={`text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
                isDarkMode
                  ? "text-white/30 group-hover:text-white/60"
                  : "text-gray-300 group-hover:text-gray-500"
              }`}
            >
              {partner.name}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      className={`relative pt-8  overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-[#0a0a0a]" : "bg-[#fafafa]"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="text-center mb-5">
        <p
          className={`text-[10px] uppercase tracking-[0.3em] font-medium ${
            isDarkMode ? "text-white/50" : "text-gray-700"
          }`}
        >
          Our Partners
        </p>
      </div>

      {/* Gradient fade masks */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none ${
          isDarkMode
            ? "bg-gradient-to-r from-[#0a0a0a] to-transparent"
            : "bg-gradient-to-r from-[#fafafa] to-transparent"
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 md:w-24 z-10 pointer-events-none ${
          isDarkMode
            ? "bg-gradient-to-l from-[#0a0a0a] to-transparent"
            : "bg-gradient-to-l from-[#fafafa] to-transparent"
        }`}
      />

      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className={`flex items-center whitespace-nowrap ${
            prefersReducedMotion ? "justify-center flex-wrap gap-6 px-6" : ""
          }`}
        >
          {partners.map((partner, index) => (
            <PartnerLogo
              key={`1-${index}`}
              partner={partner}
              keyPrefix={`1-${index}`}
            />
          ))}

          {!prefersReducedMotion &&
            partners.map((partner, index) => (
              <PartnerLogo
                key={`2-${index}`}
                partner={partner}
                keyPrefix={`2-${index}`}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
