"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Package, Calculator, Building2, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  external?: boolean;
}

const actions: QuickAction[] = [
  {
    icon: MapPin,
    label: "Track",
    href: "/track",
    color: "bg-[var(--color-primary)]",
  },
  {
    icon: Package,
    label: "Send",
    href: "/delivery",
    color: "bg-[var(--color-secondary)]",
  },
  {
    icon: Calculator,
    label: "Quote",
    href: "/pricing",
    color: "bg-[var(--color-accent)]",
  },
  {
    icon: Building2,
    label: "Find",
    href: "/locations",
    color: "bg-[var(--color-success)]",
  },
  {
    icon: FileText,
    label: "Customs",
    href: "https://cds.zimpost.co.zw/CDS.Web/operational/andeclaration.aspx?op=%5bOperatorCode%5d&usegoogleapi=y",
    color: "bg-amber-500",
    external: true,
  },
];

export function QuickActions() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      {/* Desktop Version - Fixed Right Side */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2">
        <AnimatePresence>
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {action.external ? (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="group relative flex items-center"
                  >
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: 10, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 10, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[var(--color-dark)] px-3 py-2 text-sm font-medium text-white shadow-lg"
                        >
                          {action.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200",
                        action.color,
                        isHovered && "shadow-xl"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </a>
                ) : (
                  <Link
                    href={action.href}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="group relative flex items-center"
                  >
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: 10, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 10, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[var(--color-dark)] px-3 py-2 text-sm font-medium text-white shadow-lg"
                        >
                          {action.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200",
                        action.color,
                        isHovered && "shadow-xl"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mobile Version - Bottom FAB */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {action.external ? (
                      <a
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center gap-3"
                      >
                        <span className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-md">
                          {action.label}
                        </span>
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg",
                            action.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </a>
                    ) : (
                      <Link
                        href={action.href}
                        onClick={() => setIsExpanded(false)}
                        className="flex items-center gap-3"
                      >
                        <span className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] shadow-md">
                          {action.label}
                        </span>
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg",
                            action.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300",
            isExpanded
              ? "bg-[var(--color-dark)] rotate-45"
              : "bg-[var(--color-primary)]"
          )}
        >
          {isExpanded ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </motion.button>
      </div>
    </>
  );
}
