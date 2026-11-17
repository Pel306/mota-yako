"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/animations";

interface FeatureSectionProps {
  isDarkMode: boolean;
}

export function FeatureSection({ isDarkMode }: FeatureSectionProps) {
  return (
    <section
      className={`relative py-10 pb-8 mb-8 px-6 lg:px-12 transition-[background-color] duration-500 ${
        isDarkMode ? "bg-[#111]" : "bg-[#f0f0f0]"
      }`}
    >
      {/* Hexagon Pattern Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode ? "opacity-20 invert" : "opacity-70"
        }`}
        style={{
          backgroundImage: "url('/bg-pattern.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <AnimatedSection>
            <p
              className={`text-sm mb-4 uppercase tracking-wide ${
                isDarkMode ? "text-white/50" : "text-[#666]"
              }`}
            >
              Network
            </p>
            <h2
              className={`text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-tight mb-8 ${
                isDarkMode ? "text-white" : ""
              }`}
            >
              From Harare to every village.
              <br />
              <span className={isDarkMode ? "text-white/40" : "text-[#999]"}>
                We reach everywhere.
              </span>
            </h2>
            <p
              className={`leading-relaxed mb-8 max-w-md ${
                isDarkMode ? "text-white/60" : "text-[#666]"
              }`}
            >
              Our network of 230+ post offices and service points ensures that
              no destination is too remote. Whether it&apos;s a bustling city
              center or a rural community, we deliver.
            </p>
            <Link
              href="/locations"
              className={`inline-flex items-center gap-2 font-medium hover:gap-4 transition-all ${
                isDarkMode ? "text-white" : "text-[#1a1a1a]"
              }`}
            >
              Find a location <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="aspect-[4/3] rounded-3xl overflow-hidden relative">
              <Image
                src="/images/zimpost-building.webp"
                alt="Zimpost Building"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-6xl font-light leading-none">230+</p>
                <p className="text-white/80 mt-2">locations nationwide</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
