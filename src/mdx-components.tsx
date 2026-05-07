import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

const baseComponents: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "scroll-mt-[calc(var(--nav-height)+2rem)] text-3xl font-semibold text-[var(--color-text-primary)] md:text-4xl",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "scroll-mt-[calc(var(--nav-height)+2rem)] text-2xl font-semibold text-[var(--color-text-primary)] md:text-3xl",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "scroll-mt-[calc(var(--nav-height)+2rem)] text-xl font-semibold text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("text-sm text-[var(--color-text-secondary)]", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "list-disc space-y-2 pl-5 text-sm text-[var(--color-text-secondary)]",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "list-decimal space-y-2 pl-5 text-sm text-[var(--color-text-secondary)]",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("text-sm text-[var(--color-text-secondary)]", className)} {...props} />
  ),
  a: ({ className, href, id, ...props }) => {
    if (!href && id) {
      return (
        <span
          id={id}
          className={cn(
            "block scroll-mt-[calc(var(--nav-height)+2rem)]",
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <a
        href={href}
        className={cn(
          "text-[var(--color-accent)] underline decoration-[var(--color-border-hover)] underline-offset-4",
          className,
        )}
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-l border-[var(--color-border-hover)] pl-4 text-sm text-[var(--color-text-secondary)]",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overlay-scrollbar rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-4 text-xs text-[var(--color-text-secondary)]",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-[var(--color-surface-hover)] px-1 py-0.5 font-mono text-xs",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("border-[var(--color-border)]", className)} {...props} />
  ),
};

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return { ...baseComponents, ...components };
}
