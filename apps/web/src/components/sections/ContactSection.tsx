"use client";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { FiExternalLink, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { IconType } from "react-icons";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SOCIAL_LINKS, STATIC_STATS } from "@/lib/constants";
import sendEmail from "@/lib/resend";
import { ContactVerificationModal } from "@/components/ui/ContactVerificationModal";
import { Button } from "@/components/ui/Button";

const SOCIAL_ICONS: Record<string, IconType> = {
  GitHub: FiGithub,
  LinkedIn: FiLinkedin,
  Email: FiMail,
};

const SOCIAL_DESCRIPTIONS: Record<string, string> = {
  GitHub: "Code & open-source work",
  LinkedIn: "Professional network",
  Email: "Fastest for project inquiries",
};

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
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

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

  const isFormValid = Object.keys(validate(values)).length === 0;

  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.type]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsVerificationOpen(true);
  };

  const handleVerifiedSend = async (turnstileToken: string) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("email", values.email);
      formData.set("subject", values.subject);
      formData.set("message", values.message);
      formData.set("website", values.website);
      formData.set("cf-turnstile-response", turnstileToken);

      const response = await sendEmail(formData);

      if (response?.success) {
        setIsVerificationOpen(false);
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
            title="Establish a reliable connection"
          description="Secure communications start here. Reach out to discuss system architecture, security audits, or full-stack engineering—wired directly to my inbox."
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

            <Button type="submit" variant="primary" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>

        <aside className="glass flex h-full flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-3.5 sm:px-6">
            <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" />
          </div>

          <div className="px-5 py-5 font-mono text-sm leading-relaxed text-[var(--color-text-secondary)] sm:px-6">
            <p className="m-0">
              <span className="text-[var(--color-success)]">$</span> whoami --contact
            </p>
            <p className="m-0 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-success)]" />
              <span className="text-[var(--color-text-primary)]">available · replies ~24h</span>
            </p>
            <p className="m-0">focus: currently building Assetra</p>
          </div>

          <div className="grid grid-cols-2 gap-4 px-5 pb-5 sm:px-6">
            <div>
              <p className="m-0 font-mono text-lg uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
                {STATIC_STATS.projects}
              </p>
              <p className="m-0 text-sm text-[var(--color-text-secondary)]">projects</p>
            </div>
            <div>
              <p className="m-0 font-mono text-lg uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
                {STATIC_STATS.years}+
              </p>
              <p className="m-0 text-sm text-[var(--color-text-secondary)]">years</p>
            </div>
          </div>

          <p className="m-0 border-t border-[var(--color-border)] px-5 pb-2 pt-4 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)] sm:px-6">
            {"// reach me"}
          </p>

          <div className="flex flex-1 flex-col">
            {SOCIAL_LINKS.map((link) => {
              const Icon = SOCIAL_ICONS[link.label];

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex min-h-[56px] flex-1 items-center gap-4 border-t border-[var(--color-border)] px-5 py-4 transition-colors duration-150 hover:bg-[var(--color-surface-hover)] sm:px-6"
                >
                  {Icon ? (
                    <Icon size={20} className="shrink-0 text-[var(--color-text-primary)]" />
                  ) : null}
                  <span className="flex-1">
                    <span className="block font-mono text-sm uppercase tracking-[0.14em] text-[var(--color-text-primary)]">
                      {link.label}
                    </span>
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {SOCIAL_DESCRIPTIONS[link.label]}
                    </span>
                  </span>
                  <FiExternalLink
                    size={18}
                    className="shrink-0 text-[var(--color-text-muted)] transition-colors duration-150 group-hover:text-[var(--color-accent)]"
                  />
                </a>
              );
            })}
          </div>
        </aside>
      </div>

      <ContactVerificationModal
        open={isVerificationOpen}
        siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ""}
        onClose={() => setIsVerificationOpen(false)}
        onConfirm={handleVerifiedSend}
      />
    </AnimatedSection>
  );
}
