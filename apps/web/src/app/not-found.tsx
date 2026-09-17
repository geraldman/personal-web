import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="section-padding min-h-[calc(100vh-var(--nav-height))] pt-[calc(var(--nav-height)+4rem)]">
      <div className="container-width">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 md:px-10">
          <div className="relative z-10 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
              {"// route not found"}
            </p>
            <h1 className="mt-4 text-5xl font-semibold text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl">
              404
            </h1>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)] lg:text-base">
              The path you tried does not exist or has moved. Choose a safe
              vector below.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/" variant="primary" size="lg">
                Back home
              </Button>
              <Button href="/projects" variant="outlined" size="lg">
                View projects
              </Button>
              <Button href="/#contact" variant="ghost" size="lg">
                Contact
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="glass rounded-2xl p-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Suggested paths
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <li>Home - /</li>
                  <li>Projects - /projects</li>
                  <li>Blog - /blog</li>
                </ul>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Status
                </p>
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  No matching route. The system returned a not found state to
                  protect the surface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
