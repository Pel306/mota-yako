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

export interface LicenseResult {
  licenseNumber: string;
  nationalId: string;
  fullName: string | null;
  licenseType: string;
  status: string;
  currentOffice: { name: string; region: string | null };
  collectedAt: string | null;
  transfer: {
    status: string;
    destinationOffice: { name: string; region: string | null };
    dispatchedAt: string | null;
  } | null;
}

interface LicenseCheckerContextType {
  isOpen: boolean;
  nationalId: string;
  setNationalId: (value: string) => void;
  results: LicenseResult[] | null;
  loading: boolean;
  error: string | null;
  animOrigin: { x: number; y: number };

  triggerRef: RefObject<HTMLButtonElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;

  openLicenseChecker: () => void;
  closeLicenseChecker: () => void;
  backToSearch: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  cleanNationalId: (input: string) => string;
}

const LicenseCheckerContext = createContext<LicenseCheckerContextType | undefined>(
  undefined
);

export function LicenseCheckerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [animOrigin, setAnimOrigin] = useState({ x: 0, y: 0 });
  const [nationalId, setNationalId] = useState("");
  const [results, setResults] = useState<LicenseResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanNationalId = useCallback((input: string): string => {
    return input.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
  }, []);

  const validateNationalId = useCallback((id: string): boolean => {
    return id.length === 11 || id.length === 12;
  }, []);

  const openLicenseChecker = useCallback(() => {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    setAnimOrigin({ x, y });
    setIsOpen(true);
  }, []);

  const closeLicenseChecker = useCallback(() => {
    if (!overlayRef.current) {
      setIsOpen(false);
      setResults(null);
      setError(null);
      setNationalId("");
      document.body.style.overflow = "";
      return;
    }

    gsap.to(overlayRef.current, {
      clipPath: `circle(0% at ${animOrigin.x}px ${animOrigin.y}px)`,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        setIsOpen(false);
        setResults(null);
        setError(null);
        setNationalId("");
        document.body.style.overflow = "";
      },
    });
  }, [animOrigin]);

  const backToSearch = useCallback(() => {
    setResults(null);
    setError(null);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateNationalId(nationalId)) {
        setError("Please enter a valid National ID (11 or 12 characters)");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/license-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationalId }),
        });

        const data = await response.json();

        if (response.ok) {
          setResults(Array.isArray(data?.results) ? data.results : []);
        } else {
          setError(data?.error || "Failed to check license");
        }
      } catch {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [nationalId, validateNationalId]
  );

  useEffect(() => {
    if (isOpen && overlayRef.current) {
      document.body.style.overflow = "hidden";

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
          ".license-content",
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ".license-input-wrapper",
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" },
          "-=0.3"
        );

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeLicenseChecker();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeLicenseChecker]);

  return (
    <LicenseCheckerContext.Provider
      value={{
        isOpen,
        nationalId,
        setNationalId,
        results,
        loading,
        error,
        animOrigin,
        triggerRef,
        overlayRef,
        inputRef,
        openLicenseChecker,
        closeLicenseChecker,
        backToSearch,
        handleSubmit,
        cleanNationalId,
      }}
    >
      {children}
    </LicenseCheckerContext.Provider>
  );
}

export function useLicenseChecker() {
  const context = useContext(LicenseCheckerContext);
  if (context === undefined) {
    throw new Error("useLicenseChecker must be used within a LicenseCheckerProvider");
  }
  return context;
}
