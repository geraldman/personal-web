"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

// Live preview for any markdown-bearing field (RECORD-MODEL.md §5 `type: "markdown"`, or `body`
// on a kind with the `body:markdown` capability). Deliberately generic -- it does not know
// whether it is rendering a blog post, a checkpoint's security notes, or a retrospective.
//
// react-markdown never uses dangerouslySetInnerHTML: it walks the parsed AST and renders React
// elements directly, and raw HTML in the source is escaped as text rather than executed. That is
// what keeps this safe to render without a separate sanitizer.

const CONTROL =
  "rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm " +
  "text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-strong)]";

const MARKDOWN_COMPONENTS = {
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-lg font-semibold text-[var(--color-text-primary)]" {...props} />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-base font-semibold text-[var(--color-text-primary)]" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]" {...props} />
  ),
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-sm text-[var(--color-text-secondary)]" {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => (
    <a className="text-[var(--color-text-primary)] underline" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-5 text-sm text-[var(--color-text-secondary)]" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-5 text-sm text-[var(--color-text-secondary)]" {...props} />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-2 border-[var(--color-border-strong)] pl-3 text-[var(--color-text-tertiary)]"
      {...props}
    />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-[var(--color-border)] px-1 py-0.5 font-[family-name:var(--font-mono)] text-xs"
      {...props}
    />
  ),
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

export function MarkdownEditor({ value, onChange, disabled, rows = 8 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 md:hidden">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs capitalize",
              tab === t
                ? "border-[var(--color-border-strong)] text-[var(--color-text-primary)]"
                : "border-[var(--color-border)] text-[var(--color-text-tertiary)]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3">
        <textarea
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(CONTROL, "font-[family-name:var(--font-mono)] text-xs", tab === "preview" && "hidden md:block")}
        />
        <div
          className={cn(
            CONTROL,
            "overflow-y-auto whitespace-normal [&>*+*]:mt-2",
            tab === "write" && "hidden md:block"
          )}
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {value.trim() ? (
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>{value}</ReactMarkdown>
          ) : (
            <span className="text-xs text-[var(--color-text-tertiary)]">Nothing to preview yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
