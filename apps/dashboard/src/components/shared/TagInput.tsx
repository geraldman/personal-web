"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  className?: string;
}

export function TagInput({ tags, onChange, suggestions = [], className }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((existing) => existing !== tag));
  }

  const filteredSuggestions = suggestions.filter(
    (suggestion) => suggestion.startsWith(draft.toLowerCase()) && !tags.includes(suggestion) && draft.length > 0,
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
          >
            {tag} ×
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(draft);
            }
          }}
          placeholder="Add a tag and press Enter"
          className="min-h-[44px] w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
        />
        {filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
            {filteredSuggestions.slice(0, 6).map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="min-h-[44px] w-full px-3 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
