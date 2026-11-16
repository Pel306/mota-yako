export const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const menuItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.12, ease: "easeIn" as const },
  },
};

export const menuContentVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};
