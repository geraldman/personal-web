import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { SOCIAL_LINKS } from "@/lib/constants";

export function ContactSection() {
  return (
    <AnimatedSection id="contact" className="bg-[var(--color-bg-secondary)]">
      <div className="container-width grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeader
            label="contact"
            title="Let us build something resilient"
            description="Send your details and message below. The full secure RPC workflow will be wired to Resend next."
          />

          <form className="glass relative space-y-4 rounded-2xl p-6" noValidate>
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
                className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="Your name"
              />
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
                className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="you@example.com"
              />
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
                className="min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="What can I help with?"
              />
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
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-border-hover)]"
                placeholder="Tell me about your project, timeline, and goals."
              />
              <p className="mt-2 text-right font-mono text-xs text-[var(--color-text-muted)]">0 / 2000</p>
            </div>

            <div className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--color-border-hover)] bg-[var(--color-accent-dim)] px-5 py-3 font-semibold text-[var(--color-accent)] transition-colors duration-200 hover:border-[var(--color-accent)]"
            >
              Send Message
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
