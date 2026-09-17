import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";
import { getBlogPost, getBlogPosts } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

async function loadPostModule(slug: string) {
  return import(
    /* webpackInclude: /\.md$/ */
    `@/content/blog/${slug}.md`
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  let Content: ComponentType;

  try {
    ({ default: Content } = await loadPostModule(slug));
  } catch {
    notFound();
  }

  const hasToc = Boolean(post.toc && post.toc.length > 0);

  return (
    <>
      <PageHeader label="writeup" title={post.title} description={post.excerpt} />
      <section className="section-padding pt-0">
        <div className="container-width">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
              {post.category}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              {post.date}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              {post.readTime}
            </span>
          </div>

          {post.tags && post.tags.length > 0 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div
            className={cn(
              "grid gap-6",
              hasToc && "lg:grid-cols-[minmax(0,1fr)_240px]",
            )}
          >
            <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="space-y-6">
                <Content />
              </div>
            </article>

            {hasToc ? (
              <aside className="hidden lg:block lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    {"// contents"}
                  </p>
                  <nav className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-text-secondary)]">
                    {post.toc?.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="transition-colors duration-150 hover:text-[var(--color-accent)]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
