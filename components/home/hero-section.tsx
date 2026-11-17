"use client";

import { RefObject } from "react";
import Image from "next/image";
import { motion, MotionValue } from "framer-motion";
import {
  Package,
  ArrowRight,
  Navigation,
  MapPin,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { TextReveal, LineReveal } from "@/components/animations";
import { QuickActions } from "./quick-actions";

interface HeroSectionProps {
  heroRef: RefObject<HTMLElement | null>;
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
  heroY: MotionValue<number>;
  pickupInputRef: RefObject<HTMLDivElement | null>;
  dropoffInputRef: RefObject<HTMLDivElement | null>;
  pickupLocation: string;
  dropoffLocation: string;
  isGettingQuote: boolean;
  quoteReady: boolean;
  onPostBikeSheetOpen: () => void;
  onOpenMapPicker: (type: "pickup" | "dropoff") => void;
  onGetQuote: (e: React.FormEvent) => void;
}

export function HeroSection({
  heroRef,
  heroOpacity,
  heroScale,
  heroY,
  pickupInputRef,
  dropoffInputRef,
  pickupLocation,
  dropoffLocation,
  isGettingQuote,
  quoteReady,
  onPostBikeSheetOpen,
  onOpenMapPicker,
  onGetQuote,
}: HeroSectionProps) {
  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: heroOpacity }}
      className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Full Background Image with Parallax Zoom */}
      <motion.div
        style={{ scale: heroScale, y: heroY }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="/images/bg-landscape.webp"
          alt="Zimpost Services"
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
          unoptimized
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/20" />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-4 sm:px-6 lg:px-12">
        {/* Main Hero Text */}
        <div className="text-center max-w-4xl mx-auto">
          <LineReveal
            delay={0.08}
            className="text-xs sm:text-sm text-white mb-4 sm:mb-6 tracking-[0.2em] uppercase"
          >
           Zimbabwe&apos;s designated Postal Service Provider
          </LineReveal>

          <h1 className="text-[clamp(2.5rem,10vw,6rem)] font-medium leading-[0.95] tracking-tight text-white mb-6">
            <TextReveal text="Delivering" delay={0.18} staggerDelay={0.022} />
            <br />
            <span className="text-white/50">
              <TextReveal text="possibilities" delay={0.32} staggerDelay={0.02} />
            </span>
          </h1>

          <div className="text-base sm:text-lg text-white max-w-lg mx-auto leading-relaxed space-y-1">
            <LineReveal delay={0.5}>
              Connecting every corner of Zimbabwe through 230+ locations.
            </LineReveal>
            <LineReveal delay={0.6}>
              Fast, reliable, trusted since 1890.
            </LineReveal>
          </div>

          {/* Mobile PostBike Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={onPostBikeSheetOpen}
            className="sm:hidden mt-8 w-full max-w-sm mx-auto py-4 px-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#312783] rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Send a Package</p>
                <p className="text-xs text-white/60">PostBike • Instant quote</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/60" />
          </motion.button>

          {/* Quick Actions — sits under Send a Package on mobile, floats on sm+ */}
          <QuickActions />
        </div>

        {/* Floating PostBike Card - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 24, x: 12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-8 right-4 sm:bottom-12 sm:right-8 lg:bottom-16 lg:right-12 hidden sm:block"
        >
          <form onSubmit={onGetQuote}>
            <div className="relative backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl w-[320px] lg:w-[360px] bg-white/[0.08] border border-white/20 shadow-black/50">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
              <div className="relative p-5">
                <div className="mb-5">
                  <p className="text-lg font-bold drop-shadow-sm text-white">PostBike</p>
                  <p className="text-xs mt-1 text-white/80">
                    Last mile delivery — get an instant quote
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block uppercase tracking-wide text-white/70">
                      Pickup
                    </label>
                    <div
                      ref={pickupInputRef}
                      onClick={() => onOpenMapPicker("pickup")}
                      className="relative w-full h-12 rounded-xl pl-4 pr-10 flex items-center cursor-pointer transition-all bg-transparent border border-white/30 hover:border-white/50 active:border-white/60"
                    >
                      <span className={`text-sm font-medium ${pickupLocation ? "text-white" : "text-white/50"}`}>
                        {pickupLocation || "Enter pickup address"}
                      </span>
                      <Navigation className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 block uppercase tracking-wide text-white/70">
                      Dropoff
                    </label>
                    <div
                      ref={dropoffInputRef}
                      onClick={() => onOpenMapPicker("dropoff")}
                      className="relative w-full h-12 rounded-xl pl-4 pr-10 flex items-center cursor-pointer transition-all bg-transparent border border-white/30 hover:border-white/50 active:border-white/60"
                    >
                      <span className={`text-sm font-medium ${dropoffLocation ? "text-white" : "text-white/50"}`}>
                        {dropoffLocation || "Enter delivery address"}
                      </span>
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={!pickupLocation || !dropoffLocation || isGettingQuote}
                  whileHover={{ scale: pickupLocation && dropoffLocation ? 1.02 : 1 }}
                  whileTap={{ scale: pickupLocation && dropoffLocation ? 0.98 : 1 }}
                  className={`relative w-full h-12 mt-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    pickupLocation && dropoffLocation
                      ? "bg-[#312783] text-white hover:bg-[#3d2f9e] shadow-[#312783]/30"
                      : "bg-white/10 text-white/50 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isGettingQuote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calculating...</span>
                    </>
                  ) : quoteReady ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>View quote — $3.00</span>
                    </>
                  ) : (
                    <>
                      <span>Get estimate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.3 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-xs text-white/50 uppercase tracking-wider">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5 text-white/50" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
