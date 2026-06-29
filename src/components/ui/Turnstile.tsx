"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onBeforeLoad?: () => void;
}

export function Turnstile({ siteKey, onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const turnstile = (window as any).turnstile;
    
    if (turnstile && containerRef.current && !widgetIdRef.current) {
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme: "dark",
      });
    }

    return () => {
      if (turnstile && widgetIdRef.current) {
        turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onError, onExpire]);

  const handleScriptLoad = () => {
    const turnstile = (window as any).turnstile;
    if (turnstile && containerRef.current && !widgetIdRef.current) {
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme: "dark",
      });
    }
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="my-4" />
    </>
  );
}
