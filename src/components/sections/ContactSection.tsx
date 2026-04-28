"use client";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SOCIAL_LINKS } from "@/lib/constants";
import sendEmail from "@/lib/resend";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

type NotificationType = "success" | "error" | null;

type Notification = {
  type: NotificationType;
  message: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactSection() {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [notification, setNotification] = useState<Notification>({
    type: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name as keyof ContactFormValues]) {
        return current;
      }

      const next = { ...current };
      delete next[name as keyof ContactFormValues];
      return next;
    });
  };

  const validate = (formValues: ContactFormValues): ContactFormErrors => {
    const nextErrors: ContactFormErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (formValues.name.trim().length > 80) {
      nextErrors.name = "Name must be 80 characters or less.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (formValues.email.trim().length > 120) {
      nextErrors.email = "Email must be 120 characters or less.";
    } else if (!EMAIL_REGEX.test(formValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formValues.subject.trim().length > 120) {
      nextErrors.subject = "Subject must be 120 characters or less.";
    }

    if (!formValues.message.trim()) {
      nextErrors.message = "Message is required.";
    } else if (formValues.message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    } else if (formValues.message.length > 2000) {
      nextErrors.message = "Message must be 2000 characters or less.";
    }

    return nextErrors;
  };

  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.type]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const response = await sendEmail(formData);
      
      if (response?.success) {
        setNotification({
          type: "success",
          message: "Message sent! I'll get back to you soon.",
        });
        setValues({
          name: "",
          email: "",
          subject: "",
          message: "",
          website: "",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message. Please try again.";
      setNotification({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection id="contact" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeader
            label="contact"
            title="Let us build something resilient"
            description="Send your details and message below. The full secure RPC workflow will be wired to Resend next."
          />

          {notification.type && (
            <div
              className={`mb-4 rounded-xl border px-4 py-3 font-mono text-sm ${
                notification.type === "success"
                  ? "border-[var(--color-success)] bg-[rgba(0,229,160,0.08)] text-[var(--color-success)]"
                  : "border-[var(--color-danger)] bg-[rgba(255,77,106,0.08)] text-[var(--color-danger)]"
              }`}
            >
              {notification.message}
            </div>
          )}

          <form
            className="glass relative space-y-4 rounded-2xl p-6"
            noValidate
            onSubmit={handleSubmit}
          >
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              {"// contact form base template"}
            </p>

            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
              >
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                maxLength={80}
                required
                value={values.name}
                onChange={handleChange}
                aria-invalid={Boolean(errors.name)}
                className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="Your name"
              />
              {errors.name ? (
                <p className="mt-2 font-mono text-xs text-[var(--color-danger)]">{errors.name}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
              >
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                maxLength={120}
                required
                value={values.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="you@example.com"
              />
              {errors.email ? (
                <p className="mt-2 font-mono text-xs text-[var(--color-danger)]">{errors.email}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                maxLength={120}
                value={values.subject}
                onChange={handleChange}
                aria-invalid={Boolean(errors.subject)}
                className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="What can I help with?"
              />
              {errors.subject ? (
                <p className="mt-2 font-mono text-xs text-[var(--color-danger)]">{errors.subject}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                minLength={10}
                maxLength={2000}
                required
                rows={6}
                value={values.message}
                onChange={handleChange}
                aria-invalid={Boolean(errors.message)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="Tell me about your project, timeline, and goals."
              />
              <p className="mt-2 text-right font-mono text-xs text-[var(--color-text-muted)]">
                {values.message.length} / 2000
              </p>
              {errors.message ? (
                <p className="mt-2 font-mono text-xs text-[var(--color-danger)]">{errors.message}</p>
              ) : null}
            </div>

            <div className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)] px-5 py-3 font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:border-[var(--color-accent)] disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <aside className="glass rounded-2xl p-6">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {"// socials"}
          </p>
          <ul className="space-y-3">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="text-sm text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AnimatedSection>
  );
}
