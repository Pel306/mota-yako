"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost"
  | "link"
  | "white";

type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";

const buttonVariants = (
  {
    variant = "primary",
    size = "md",
    className,
  }: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
  } = {}
) => {
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]",
    secondary:
      "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] focus-visible:ring-[var(--color-secondary)]",
    accent:
      "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] focus-visible:ring-[var(--color-accent)]",
    outline:
      "border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary)] hover:text-white",
    ghost: "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
    link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
    white: "bg-white text-[var(--color-primary)] hover:bg-gray-100 shadow-md",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-4 text-sm rounded-lg",
    md: "h-11 px-6 text-base rounded-lg",
    lg: "h-13 px-8 text-lg rounded-xl",
    xl: "h-14 px-10 text-lg rounded-xl",
    icon: "h-10 w-10 rounded-lg",
    "icon-sm": "h-8 w-8 rounded-md",
    "icon-lg": "h-12 w-12 rounded-xl",
  };

  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, asChild = false, children, disabled, ...props },
    ref
  ) => {
    if (asChild) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={buttonVariants({ variant, size, className })}
          aria-disabled={disabled || isLoading}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            children
          )}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
