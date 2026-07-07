"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { Turnstile } from "@/components/ui/Turnstile";

type ModalStatus = "verifying" | "verified" | "sending" | "error";

interface ContactVerificationModalProps {
  open: boolean;
  siteKey: string;
  onClose: () => void;
  onConfirm: (token: string) => Promise<void>;
}

export function ContactVerificationModal({
  open,
  siteKey,
  onClose,
  onConfirm,
}: ContactVerificationModalProps) {
  const [status, setStatus] = useState<ModalStatus>("verifying");
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  useEffect(() => {
    if (open) {
      setStatus("verifying");
      setToken(null);
      setErrorMessage(null);
      setWidgetKey((current) => current + 1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleVerify = useCallback((nextToken: string) => {
    setToken(nextToken);
    setStatus("verified");
    setErrorMessage(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setToken(null);
    setStatus("error");
    setErrorMessage("Security verification failed. Please try again.");
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setToken(null);
    setStatus("error");
    setErrorMessage("Security verification expired. Please try again.");
  }, []);

  const handleRetry = () => {
    setStatus("verifying");
    setErrorMessage(null);
    setWidgetKey((current) => current + 1);
  };

  const handleConfirm = async () => {
    if (!token) {
      return;
    }

    setStatus("sending");
    setErrorMessage(null);

    try {
      await onConfirm(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      setStatus("error");
      setErrorMessage(message);
    }
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(5,5,8,0.78)] px-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Verify you're human"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="glass w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                Security check
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-accent)]"
                aria-label="Close verification"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="px-5 py-5 justify-items-center">
              <p className="mb-4 text-sm text-[var(--color-text-secondary)] text-center">
                {status === "verified"
                  ? "You're verified. Send your message when you're ready."
                  : "Confirm you're human before your message is sent."}
              </p>

              {status !== "error" ? (
                <Turnstile
                  key={widgetKey}
                  siteKey={siteKey}
                  onVerify={handleVerify}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                />
              ) : null}

              {status === "sending" ? (
                <div className="my-4 flex items-center gap-2 font-mono text-sm text-[var(--color-text-secondary)]">
                  Sending your message...
                </div>
              ) : null}

              {errorMessage ? (
                <p className="mb-4 font-mono text-xs text-[var(--color-danger)]">{errorMessage}</p>
              ) : null}

              {status === "error" ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[var(--color-border-hover)] px-5 font-semibold text-[var(--color-text-primary)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Retry
                </button>
              ) : null}

              {status === "verified" ? (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)] px-5 font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:border-[var(--color-accent)]"
                >
                  Send Message
                </button>
              ) : null}

              {status === "sending" ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)] px-5 font-semibold text-[var(--color-accent)] opacity-50"
                >
                  Sending...
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
