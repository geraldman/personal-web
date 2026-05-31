"use client";

import { useEffect, useRef } from "react";

type OverlayHistoryOptions<T extends { id: string }> = {
  activeItem: T | null;
  setActiveItem: (item: T | null) => void;
  paramName: string;
};

type OverlayHistoryResult = {
  handleCloseOverlay: () => void;
};

export function useOverlayHistory<T extends { id: string }>(
  options: OverlayHistoryOptions<T>,
): OverlayHistoryResult {
  const { activeItem, setActiveItem, paramName } = options;
  const lastItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setActiveItem(null);
      lastItemIdRef.current = null;
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setActiveItem]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!activeItem) {
      lastItemIdRef.current = null;
      return;
    }

    if (lastItemIdRef.current === activeItem.id) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set(paramName, activeItem.id);
    window.history.pushState(
      { overlay: paramName, itemId: activeItem.id },
      "",
      url.toString(),
    );
    lastItemIdRef.current = activeItem.id;
  }, [activeItem, paramName]);

  const handleCloseOverlay = () => {
    if (typeof window === "undefined") {
      setActiveItem(null);
      return;
    }

    const url = new URL(window.location.href);
    const hasParam = url.searchParams.has(paramName);
    const state = window.history.state as { overlay?: string } | null;

    if (state?.overlay === paramName && hasParam) {
      window.history.back();
      return;
    }

    setActiveItem(null);
    lastItemIdRef.current = null;

    if (hasParam) {
      url.searchParams.delete(paramName);
      window.history.replaceState(state, "", url.toString());
    }
  };

  return { handleCloseOverlay };
}
