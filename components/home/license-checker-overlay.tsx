"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Hash,
  FileText,
  Info,
  Truck,
} from "lucide-react";
import { useLicenseChecker, LicenseResult } from "@/components/providers/license-checker-provider";

export function LicenseCheckerOverlay() {
  const {
    isOpen,
    nationalId,
    setNationalId,
    results,
    loading,
    error,
    overlayRef,
    inputRef,
    animOrigin,
    closeLicenseChecker,
    backToSearch,
    handleSubmit,
    cleanNationalId,
  } = useLicenseChecker();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNationalId(cleanNationalId(e.target.value));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 max-w-screen z-[100] bg-[#170E5E]"
      style={{
        clipPath: `circle(0% at ${animOrigin.x}px ${animOrigin.y}px)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-8">
        {results && results.length > 0 && !loading ? (
          <button
            type="button"
            onClick={backToSearch}
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

        <button
          type="button"
          onClick={closeLicenseChecker}
          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="license-content relative z-10 h-full flex flex-col items-center px-4 sm:px-6 overflow-y-auto pt-16 pb-8 sm:py-24">
        <div
          className={`w-full ${results && results.length > 0 ? "max-w-2xl" : "max-w-xl"} ${!results && !loading ? "sm:my-auto" : ""}`}
        >
          <AnimatePresence mode="wait">
            {(!results || results.length === 0) && !loading && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  className="text-[clamp(1.5rem,5vw,3.5rem)] font-medium leading-[1.15] mb-6 sm:mb-12"
                  style={{ color: "#ffffff" }}
                >
                  Check your
                  <br />
                  driver&apos;s license
                </h2>

                <form onSubmit={handleSubmit} className="license-input-wrapper">
                  <div className="relative group">
                    <input
                      ref={inputRef}
                      type="text"
                      value={nationalId}
                      onChange={handleInputChange}
                      placeholder="29195314L18"
                      maxLength={12}
                      inputMode="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full h-12 sm:h-16 lg:h-20 bg-transparent border-b border-white/25 focus:border-emerald-300/60 px-0 pr-20 sm:pr-14 text-lg sm:text-2xl lg:text-3xl text-white placeholder:text-white/20 outline-none transition-colors font-mono tracking-wider uppercase"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <span className="sm:hidden px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white">
                        Check
                      </span>
                      <ArrowRight className="hidden sm:block w-5 h-5 lg:w-6 lg:h-6 text-white/40 hover:text-emerald-300" />
                    </button>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-white/40">
                    Type your National ID — no spaces or dashes — 11 or 12 characters.
                  </p>
                </form>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 sm:mt-6 flex items-start gap-2 text-white/60"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {results && results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-white/50 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-1">No License Found</p>
                        <p className="text-sm text-white/50">
                          We couldn&apos;t find a driver&apos;s license associated with
                          this National ID. Please double-check and try again.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-none">
                  <p className="text-[10px] sm:text-[11px] text-white/35 uppercase tracking-[0.2em] mb-3 sm:mb-4">
                    Try an example
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["63123456A45"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setNationalId(item)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/50 hover:text-white border border-white/15 hover:border-white/30 rounded-full transition-colors font-mono"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 sm:py-20 sm:my-auto"
              >
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white/70 animate-spin mb-4 sm:mb-6" />
                <p className="text-white/50 text-sm sm:text-base font-mono tracking-wide">
                  {nationalId}
                </p>
              </motion.div>
            )}

            {results && results.length > 0 && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl mx-auto"
              >
                {results.map((result: LicenseResult, index: number) => {
                  const isCollected = result.collectedAt !== null;
                  const inTransit = result.transfer !== null;
                  const bannerTone = isCollected
                    ? "bg-blue-500/20"
                    : inTransit
                    ? "bg-yellow-500/20"
                    : "bg-emerald-500/20";
                  const bannerIcon = isCollected
                    ? "text-blue-300"
                    : inTransit
                    ? "text-yellow-300"
                    : "text-emerald-400";

                  return (
                    <div key={`${result.licenseNumber}-${index}`}>
                      <div className="flex items-center gap-3 mb-6 sm:mb-10">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bannerTone}`}
                        >
                          {inTransit ? (
                            <Truck className={`w-5 h-5 sm:w-6 sm:h-6 ${bannerIcon}`} />
                          ) : (
                            <CheckCircle2 className={`w-5 h-5 sm:w-6 sm:h-6 ${bannerIcon}`} />
                          )}
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white leading-snug">
                            {result.status}
                          </p>
                          <p className="text-sm text-white/50 font-mono">
                            Licence {result.licenseNumber}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                        {result.fullName && (
                          <DetailItem
                            icon={User}
                            label="Full Name"
                            value={result.fullName.trim()}
                          />
                        )}
                        <DetailItem
                          icon={Hash}
                          label="National ID"
                          value={result.nationalId}
                          mono
                        />
                        <DetailItem
                          icon={MapPin}
                          label="Current Location"
                          value={
                            result.currentOffice.region
                              ? `${result.currentOffice.name} Post Office · ${result.currentOffice.region}`
                              : result.currentOffice.name 
                          }
                        />
                        <DetailItem
                          icon={FileText}
                          label="Licence Class"
                          value={result.licenseType}
                        />
                        {isCollected && (
                          <DetailItem
                            icon={Calendar}
                            label="Collected On"
                            value={formatDate(result.collectedAt)}
                          />
                        )}
                      </div>

                      {inTransit && result.transfer && (
                        <div className="p-4 sm:p-5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <div className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-200 mb-1">
                                Transfer {result.transfer.status.toLowerCase()}
                              </p>
                              <p className="text-sm text-white/60">
                                Heading to{" "}
                                <strong className="text-white/80">
                                  {result.transfer.destinationOffice.name}
                                </strong>
                                {result.transfer.destinationOffice.region
                                  ? ` (${result.transfer.destinationOffice.region})`
                                  : ""}
                                {result.transfer.dispatchedAt
                                  ? ` · dispatched ${formatDate(result.transfer.dispatchedAt)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isCollected && !inTransit && (
                        <div className="p-4 sm:p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-emerald-300 mb-1">
                                Ready for Collection
                              </p>
                              <p className="text-sm text-white/60">
                                Visit{" "}
                                <strong className="text-white/80">
                                  {result.currentOffice.name} Post Office
                                </strong>{" "}
                                with your original National ID to collect your licence.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={backToSearch}
                      className="px-4 py-2 text-xs sm:text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all"
                    >
                      Check another
                    </button>
                    <button
                      type="button"
                      onClick={closeLicenseChecker}
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

      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-10 hidden sm:block">
        <Image
          src="/images/full-logo-white.svg"
          alt="Zimpost"
          width={100}
          height={32}
          className="h-6 w-auto opacity-20"
        />
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden lg:flex items-center gap-2 text-[11px] text-white/40">
        <kbd className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono text-white/60">
          ESC
        </kbd>
        <span>to close</span>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs sm:text-sm text-white/40">{label}</p>
        <p className={`text-white ${mono ? "font-mono" : ""} ${highlight ? "text-emerald-300" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
