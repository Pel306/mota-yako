"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  IdCard,
  ClipboardList,
  LucideIcon,
} from "lucide-react";
import { useLicenseChecker } from "@/components/providers";

interface QuickAction {
  icon: LucideIcon;
  label: string;
  href: string;
  external?: boolean;
  overlay?: "license";
}

const quickActions: QuickAction[] = [
  {
    icon: ShoppingBag,
    label: "Zimbabwe Mall",
    href: "https://zimbabwemall.post/",
    external: true,
  },
  {
    icon: IdCard,
    label: "Driver's License",
    href: "#",
    overlay: "license",
  },
  {
    icon: ClipboardList,
    label: "Customs",
    href: "https://cds.zimpost.co.zw/CDS.Web/operational/andeclaration.aspx?op=%5bOperatorCode%5d&usegoogleapi=y",
    external: true,
  },
  {
    icon: Package,
    label: "Postage Calculator",
    href: "/rates",
  },
];

export function QuickActions() {
  const { openLicenseChecker } = useLicenseChecker();

  const renderAction = (action: QuickAction, className: string) => {
    const Icon = action.icon;
    const inner = (
      <>
        <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors shrink-0" />
        <span className="text-sm text-white/80 group-hover:text-white transition-colors whitespace-nowrap truncate">
          {action.label}
        </span>
      </>
    );

    if (action.overlay === "license") {
      return (
        <button
          key={action.label}
          type="button"
          onClick={openLicenseChecker}
          className={className}
        >
          {inner}
        </button>
      );
    }
    if (action.external) {
      return (
        <a
          key={action.label}
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link key={action.label} href={action.href} className={className}>
        {inner}
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.82, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm mx-auto mt-4 sm:w-auto sm:max-w-none sm:mx-0 sm:mt-0 sm:absolute sm:bottom-12 sm:left-8 lg:bottom-16 lg:left-12"
    >
      {/* Mobile: 2x2 grid of glass cards */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {quickActions.map((action) =>
          renderAction(
            action,
            "group flex items-center gap-2.5 px-4 py-3 min-h-[48px] backdrop-blur-md bg-white/[0.1] border border-white/[0.15] rounded-xl hover:bg-white/[0.15] active:bg-white/[0.18] transition-colors cursor-pointer"
          )
        )}
      </div>

      {/* sm+: single horizontal glass bar */}
      <div className="hidden sm:flex items-center backdrop-blur-md bg-white/[0.08] border border-white/[0.1] rounded-2xl overflow-hidden">
        {quickActions.map((action, i) =>
          renderAction(
            action,
            `group flex items-center gap-2.5 px-5 py-3 hover:bg-white/[0.08] transition-colors cursor-pointer ${
              i > 0 ? "border-l border-white/[0.1]" : ""
            }`
          )
        )}
      </div>
    </motion.div>
  );
}
