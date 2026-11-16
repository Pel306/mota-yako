"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Navigation,
  MapPin,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface MobilePostBikeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pickupLocation: string;
  dropoffLocation: string;
  isGettingQuote: boolean;
  quoteReady: boolean;
  onOpenMapPicker: (type: "pickup" | "dropoff") => void;
  onGetQuote: (e: React.FormEvent) => void;
}

export function MobilePostBikeSheet({
  isOpen,
  onClose,
  pickupLocation,
  dropoffLocation,
  isGettingQuote,
  quoteReady,
  onOpenMapPicker,
  onGetQuote,
}: MobilePostBikeSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-[#1a1a1a]">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xl font-bold text-white">PostBike</p>
                  <p className="text-sm text-white/60">
                    Last mile delivery — get an instant quote
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={onGetQuote}>
                <div className="space-y-4">
                  {/* Pickup Input */}
                  <div>
                    <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-white/50">
                      Pickup Location
                    </label>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMapPicker("pickup");
                      }}
                      className="w-full h-14 rounded-xl px-4 flex items-center justify-between cursor-pointer bg-white/10 border border-white/20 hover:border-white/30 transition-colors"
                    >
                      <span
                        className={`text-[15px] ${
                          pickupLocation ? "text-white" : "text-white/40"
                        }`}
                      >
                        {pickupLocation || "Enter pickup address"}
                      </span>
                      <Navigation className="w-5 h-5 text-white/40" />
                    </div>
                  </div>

                  {/* Dropoff Input */}
                  <div>
                    <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-white/50">
                      Dropoff Location
                    </label>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMapPicker("dropoff");
                      }}
                      className="w-full h-14 rounded-xl px-4 flex items-center justify-between cursor-pointer bg-white/10 border border-white/20 hover:border-white/30 transition-colors"
                    >
                      <span
                        className={`text-[15px] ${
                          dropoffLocation ? "text-white" : "text-white/40"
                        }`}
                      >
                        {dropoffLocation || "Enter delivery address"}
                      </span>
                      <MapPin className="w-5 h-5 text-white/40" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!pickupLocation || !dropoffLocation || isGettingQuote}
                  whileTap={{
                    scale: pickupLocation && dropoffLocation ? 0.98 : 1,
                  }}
                  className={`w-full h-14 mt-6 rounded-xl text-[15px] font-semibold transition-all flex items-center justify-center gap-2 ${
                    pickupLocation && dropoffLocation
                      ? "bg-[#312783] text-white"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {isGettingQuote ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Calculating...</span>
                    </>
                  ) : quoteReady ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>View quote — $3.00</span>
                    </>
                  ) : (
                    <>
                      <span>Get instant estimate</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
