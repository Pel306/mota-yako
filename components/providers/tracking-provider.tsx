"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
  RefObject,
} from "react";
import gsap from "gsap";
import { TrackingResult, TrackingAPIResponse } from "@/lib/types/tracking";

interface TrackingContextType {
  // State
  isOpen: boolean;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  trackingResult: TrackingResult | null;
  trackingLoading: boolean;
  trackingError: string | null;
  animOrigin: { x: number; y: number };

  // Refs
  trackBtnRef: RefObject<HTMLButtonElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;

  // Actions
  openTracking: () => void;
  closeTracking: () => void;
  backToSearch: () => void;
  handleTrackingSubmit: (e: React.FormEvent) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(
  undefined
);

export function TrackingProvider({ children }: { children: ReactNode }) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [animOrigin, setAnimOrigin] = useState({ x: 0, y: 0 });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(
    null
  );
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Refs
  const trackBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open tracking overlay
  const openTracking = useCallback(() => {
    if (trackBtnRef.current) {
      const rect = trackBtnRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setAnimOrigin({ x, y });
    }
    setIsOpen(true);
  }, []);

  // Close tracking overlay with GSAP animation
  const closeTracking = useCallback(() => {
    if (!overlayRef.current) {
      setIsOpen(false);
      setTrackingResult(null);
      setTrackingError(null);
      setTrackingNumber("");
      document.body.style.overflow = "";
      return;
    }

    gsap.to(overlayRef.current, {
      clipPath: `circle(0% at ${animOrigin.x}px ${animOrigin.y}px)`,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        setIsOpen(false);
        setTrackingResult(null);
        setTrackingError(null);
        setTrackingNumber("");
        document.body.style.overflow = "";
      },
    });
  }, [animOrigin]);

  // Go back to search from results
  const backToSearch = useCallback(() => {
    setTrackingResult(null);
    setTrackingError(null);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, []);

  // Handle tracking form submit
  const handleTrackingSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!trackingNumber.trim()) return;

      setTrackingLoading(true);
      setTrackingError(null);

      try {
        const response = await fetch(
          `/api/track?number=${encodeURIComponent(trackingNumber.trim())}`
        );
        const data: TrackingAPIResponse = await response.json();

        if (data.success && data.data) {
          setTrackingResult(data.data);
        } else {
          setTrackingError(data.error || "Tracking number not found");
        }
      } catch {
        setTrackingError(
          "Unable to fetch tracking information. Please try again."
        );
      } finally {
        setTrackingLoading(false);
      }
    },
    [trackingNumber]
  );

  // Run GSAP animation AFTER overlay is rendered
  useEffect(() => {
    if (isOpen && overlayRef.current && animOrigin.x !== 0) {
      document.body.style.overflow = "hidden";

      // GSAP animation timeline
      const tl = gsap.timeline();

      tl.fromTo(
        overlayRef.current,
        {
          clipPath: `circle(0% at ${animOrigin.x}px ${animOrigin.y}px)`,
          opacity: 1,
        },
        {
          clipPath: `circle(150% at ${animOrigin.x}px ${animOrigin.y}px)`,
          opacity: 1,
          duration: 0.6,
          ease: "power3.inOut",
        }
      )
        .fromTo(
          ".tracking-content",
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".tracking-input-wrapper",
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" },
          "-=0.3"
        );

      // Focus input after animation and scroll into view (for mobile keyboards)
      setTimeout(() => {
        inputRef.current?.focus();
        setTimeout(() => {
          inputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }, 500);
    }
  }, [isOpen, animOrigin]);

  // Keep focus on input when tracking overlay is open (only during search, not results)
  useEffect(() => {
    if (isOpen && inputRef.current && !trackingResult && !trackingLoading) {
      const handleFocusOut = () => {
        setTimeout(() => {
          if (isOpen && inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      };

      const input = inputRef.current;
      input.addEventListener("blur", handleFocusOut);

      return () => {
        input.removeEventListener("blur", handleFocusOut);
      };
    }
  }, [isOpen, trackingResult, trackingLoading]);

  // Close tracking on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeTracking();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeTracking]);

  return (
    <TrackingContext.Provider
      value={{
        isOpen,
        trackingNumber,
        setTrackingNumber,
        trackingResult,
        trackingLoading,
        trackingError,
        animOrigin,
        trackBtnRef,
        overlayRef,
        inputRef,
        openTracking,
        closeTracking,
        backToSearch,
        handleTrackingSubmit,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
}
