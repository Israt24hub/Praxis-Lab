import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "quiet";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-board px-5 py-3 hover:bg-chalk",
  secondary: "border border-line-strong text-chalk px-5 py-3 hover:border-chalk hover:bg-board-raised",
  quiet: "text-chalk underline decoration-line-strong underline-offset-4 hover:decoration-accent px-0 py-1",
};

export function buttonStyles(variant: ButtonVariant = "primary", className?: string) {
  return cx(base, variants[variant], className);
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonStyles(variant, className)} {...props}>
      {children}
    </Link>
  );
}
