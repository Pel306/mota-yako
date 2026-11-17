"use client";

import { useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description/subtitle */
  description?: string;
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional icon to display next to title */
  icon?: ReactNode;
  /** Text alignment - default left */
  align?: "left" | "center";
  /** Additional content below description (e.g., search bar) */
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  icon,
  align = "left",
  children,
}: PageHeaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content fade-in animation
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.querySelectorAll(".header-animate"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const alignmentClasses = align === "center"
    ? "text-center mx-auto"
    : "text-left";

  return (
    <header className="pt-25 lg:pt-25 pb-4 lg:pb-6 border-b border-[var(--foreground)]/10">
      <div
        ref={contentRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={`header-animate flex items-center gap-1.5 text-[13px] text-[var(--foreground)] mb-2 flex-wrap ${align === "center" ? "justify-center" : ""}`}>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--foreground)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className={`${alignmentClasses}`}>

          {/* Title with optional icon */}
          <div className={`header-animate flex items-center gap-2 mb-1 ${align === "center" ? "justify-center" : ""}`}>
            {icon && (
              <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-md flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <span className="text-xl md:text-2xl font-semibold">
              {title}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p className={`header-animate text-[13px] text-[var(--foreground)]/60 ${align === "center" ? "max-w-lg mx-auto" : "max-w-xl"}`}>
              {description}
            </p>
          )}

          {/* Additional Content (search bar, CTAs, etc.) */}
          {children && (
            <div className="header-animate mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
