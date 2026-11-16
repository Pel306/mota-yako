"use client";

import { RefObject } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Truck,
} from "lucide-react";
import { TrackingResult } from "@/lib/types/tracking";

interface TrackingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToSearch: () => void;
  overlayRef: RefObject<HTMLDivElement | null>;
  animOrigin: { x: number; y: number };
  trackingResult: TrackingResult | null;
  trackingLoading: boolean;
  trackingError: string | null;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  trackingInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
}

export function TrackingOverlay({
  isOpen,
  onClose,
  onBackToSearch,
  overlayRef,
  animOrigin,
  trackingResult,
  trackingLoading,
  trackingError,
  trackingNumber,
  setTrackingNumber,
  trackingInputRef,
  onSubmit,
}: TrackingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 max-w-screen z-[100] bg-[#312783]"
      style={{
        clipPath: `circle(0% at ${animOrigin.x}px ${animOrigin.y}px)`,
      }}
    >
      {/* Header - Back & Close buttons */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-8">
        {/* Back Button - Only shows when viewing results */}
        {trackingResult && !trackingLoading ? (
          <button
            type="button"
            onClick={onBackToSearch}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">
              New search
            </span>
          </button>
        ) : (
          <div />
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Tracking Content - Clean & Minimal */}
      <div className="tracking-content relative z-10 h-full flex flex-col items-center px-4 sm:px-6 overflow-y-auto pt-16 pb-8 sm:py-24">
        <div
          className={`w-full ${trackingResult ? "max-w-2xl" : "max-w-xl"} ${!trackingResult && !trackingLoading ? "sm:my-auto" : ""}`}
        >
          <AnimatePresence mode="wait">
            {/* Search View */}
            {!trackingResult && !trackingLoading && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Clean Title */}
                <h2
                  className="text-[clamp(1.5rem,5vw,3.5rem)] font-medium leading-[1.15] mb-6 sm:mb-12"
                  style={{ color: "#ffffff" }}
                >
                  Enter your
                  <br />
                  tracking number
                </h2>

                {/* Input */}
                <form onSubmit={onSubmit} className="tracking-input-wrapper">
                  <div className="relative group">
                    <input
                      ref={trackingInputRef}
                      type="text"
                      value={trackingNumber}
                      onChange={(e) =>
                        setTrackingNumber(e.target.value.toUpperCase())
                      }
                      placeholder="ZP123456789ZW"
                      className="w-full h-12 sm:h-16 lg:h-20 bg-transparent border-b border-white/25 focus:border-violet-300/60 px-0 pr-20 sm:pr-14 text-lg sm:text-2xl lg:text-3xl text-white placeholder:text-white/20 outline-none transition-colors font-mono tracking-wider"
                    />
                    {/* Mobile: Track button, Desktop: Arrow */}
                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <span className="sm:hidden px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white">
                        Track
                      </span>
                      <ArrowRight className="hidden sm:block w-5 h-5 lg:w-6 lg:h-6 text-white/40 hover:text-violet-300" />
                    </button>
                  </div>
                </form>

                {/* Error Message */}
                {trackingError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 sm:mt-6 flex items-start gap-2 text-white/60"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{trackingError}</span>
                  </motion.div>
                )}

                {/* Quick Access - Minimal */}
                <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-none">
                  <p className="text-[10px] sm:text-[11px] text-white/35 uppercase tracking-[0.2em] mb-3 sm:mb-4">
                    Try an example
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["ZPPTDZ4Y", "CY584755815DE"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTrackingNumber(item)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/50 hover:text-white border border-white/15 hover:border-white/30 rounded-full transition-colors font-mono"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading View */}
            {trackingLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 sm:py-20 sm:my-auto"
              >
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white/70 animate-spin mb-4 sm:mb-6" />
                <p className="text-white/50 text-sm sm:text-base font-mono tracking-wide">
                  {trackingNumber}
                </p>
              </motion.div>
            )}

            {/* Results View - Clean & Responsive */}
            {trackingResult && !trackingLoading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl mx-auto"
              >
                {/* Header Row */}
                <div className="flex items-center justify-end mb-6 sm:mb-10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trackingResult.status === "delivered" ||
                        trackingResult.status === "EMF"
                          ? "bg-emerald-400"
                          : "bg-violet-400 animate-pulse"
                      }`}
                    />
                    <p className="font-mono text-white text-sm sm:text-base tracking-wide">
                      {trackingResult.trackingNumber}
                    </p>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="mb-8 sm:mb-12">
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Status Icon with color coding */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        trackingResult.status === "delivered" ||
                        trackingResult.status === "EMF"
                          ? "bg-emerald-500/20"
                          : trackingResult.status === "in_transit" ||
                              trackingResult.status.includes("transit")
                            ? "bg-sky-500/20"
                            : "bg-white/10"
                      }`}
                    >
                      {trackingResult.status === "delivered" ||
                      trackingResult.status === "EMF" ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                      ) : trackingResult.status === "in_transit" ||
                        trackingResult.status.includes("transit") ? (
                        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                      ) : (
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white leading-snug">
                        {trackingResult.statusDescription}
                      </p>
                      {/* Route - stacked on mobile, inline on desktop */}
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-white/50">
                        <span className="truncate">{trackingResult.origin}</span>
                        <ArrowRight className="w-3 h-3 hidden sm:block flex-shrink-0 text-violet-300/50" />
                        <span className="text-violet-300/40 sm:hidden">↓</span>
                        <span className="truncate">
                          {trackingResult.destination}
                        </span>
                      </div>
                      {trackingResult.weight && (
                        <p className="text-xs text-white/40 mt-2">
                          {trackingResult.weight} kg
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {trackingResult.events.length > 0 && (
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-white/40 uppercase tracking-[0.2em] mb-4 sm:mb-6">
                      History
                    </p>
                    <div className="relative">
                      {/* Timeline line with gradient */}
                      <div className="absolute left-[5px] sm:left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-400/30 via-white/10 to-transparent" />

                      <div className="space-y-5 sm:space-y-6">
                        {trackingResult.events.map((event: { type: string; description: string; location: string; date: string; time: string }, index: number) => {
                          const isDelivered =
                            event.type === "delivered" || event.type === "EMF";
                          const isInTransit =
                            event.type.includes("transit") ||
                            event.type === "in_transit";
                          const isCustoms = event.type.includes("customs");

                          return (
                            <div
                              key={index}
                              className="relative flex gap-4 sm:gap-5"
                            >
                              {/* Dot with subtle color */}
                              <div
                                className={`relative z-10 w-[11px] h-[11px] sm:w-[15px] sm:h-[15px] rounded-full flex-shrink-0 mt-1 ${
                                  index === 0
                                    ? isDelivered
                                      ? "bg-emerald-400"
                                      : isInTransit
                                        ? "bg-sky-400"
                                        : "bg-violet-400"
                                    : "bg-white/15 border border-white/20"
                                }`}
                              />

                              {/* Content */}
                              <div className="flex-1 min-w-0 pb-1">
                                <p
                                  className={`text-sm sm:text-base leading-relaxed ${
                                    index === 0 ? "text-white" : "text-white/60"
                                  }`}
                                >
                                  {event.description}
                                </p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                                  <span
                                    className={
                                      index === 0 && isCustoms
                                        ? "text-amber-300/60"
                                        : ""
                                    }
                                  >
                                    {event.location}
                                  </span>
                                  <span className="text-white/20">•</span>
                                  <span>
                                    {event.date}, {event.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={onBackToSearch}
                      className="px-4 py-2 text-xs sm:text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all"
                    >
                      Track another
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs sm:text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle Brand Mark - Bottom Left (hidden on mobile) */}
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-10 hidden sm:block">
        <Image
          src="/images/full-logo-white.svg"
          alt="Zimpost"
          width={100}
          height={32}
          className="h-6 w-auto opacity-20"
        />
      </div>

      {/* Keyboard Hint - Bottom Right (desktop only) */}
      <div className="absolute bottom-8 right-8 z-10 hidden lg:flex items-center gap-2 text-[11px] text-white/40">
        <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono text-white/60">
          ESC
        </kbd>
        <span>to close</span>
      </div>
    </div>
  );
}
