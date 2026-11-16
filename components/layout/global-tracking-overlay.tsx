"use client";

import { useTracking } from "@/components/providers";
import { TrackingOverlay } from "@/components/home";

/**
 * Global TrackingOverlay wrapper that uses the TrackingProvider context.
 * Renders the TrackingOverlay component with all necessary props from context.
 */
export function GlobalTrackingOverlay() {
  const {
    isOpen,
    closeTracking,
    backToSearch,
    overlayRef,
    animOrigin,
    trackingResult,
    trackingLoading,
    trackingError,
    trackingNumber,
    setTrackingNumber,
    inputRef,
    handleTrackingSubmit,
  } = useTracking();

  return (
    <TrackingOverlay
      isOpen={isOpen}
      onClose={closeTracking}
      onBackToSearch={backToSearch}
      overlayRef={overlayRef}
      animOrigin={animOrigin}
      trackingResult={trackingResult}
      trackingLoading={trackingLoading}
      trackingError={trackingError}
      trackingNumber={trackingNumber}
      setTrackingNumber={setTrackingNumber}
      trackingInputRef={inputRef}
      onSubmit={handleTrackingSubmit}
    />
  );
}
