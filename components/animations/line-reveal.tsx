"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface LineRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function LineReveal({
  children,
  className = "",
  delay = 0,
}: LineRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}
