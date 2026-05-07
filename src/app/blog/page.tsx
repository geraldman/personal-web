import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { getBlogPosts } from "@/lib/blog";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHeader
        label="blog"
        title="Blog and Writeups"
        description="Writeups and templates that document security work with proof and fixes."
      />
      <section className="section-padding pt-0">
        <div className="container-width grid gap-4 lg:grid-cols-2 lg:gap-6">
          {posts.map((post) => (
            <article key={post.slug} className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  {post.category}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  {post.date}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold text-[var(--color-text-primary)]">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {post.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  href={`/blog/${post.slug}`}
                  variant="outlined"
                  size="sm"
                  className="font-mono text-xs uppercase tracking-[0.14em]"
                >
                  Read writeup
                </Button>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  {post.readTime}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
