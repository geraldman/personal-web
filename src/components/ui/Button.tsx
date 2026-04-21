import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outlined" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  download?: boolean | string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-bg)] hover:glow hover:bg-[var(--color-accent-secondary)]",
  outlined:
    "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  download,
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-[44px] items-center justify-center rounded-full font-semibold tracking-wide transition-all duration-200",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (download) {
    return (
      <a href={href} download={download} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
    >
      {children}
    </Link>
  );
}
