import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Tecno Team",
  description: "Notes on IoT, software engineering, and AI from Abdulaziz El-Nagar.",
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;

  const posts = await prisma.blogPost
    .findMany({
      where: {
        status: "PUBLISHED",
        AND: [
          category ? { category: { slug: category } } : {},
          tag ? { tags: { some: { tag: { slug: tag } } } } : {},
        ],
      },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { publishedAt: "desc" },
    })
    .catch(() => []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">Blog</p>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Notes & write-ups</h1>

      {posts.length === 0 ? (
        <div className="mt-12">
          <EmptyState title="No articles published yet." description="Check back soon." />
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] transition-colors hover:border-[var(--gold)]"
            >
              {post.coverImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--border)]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                {post.category && (
                  <p className="text-xs font-medium text-[var(--gold-deep)]">{post.category.name}</p>
                )}
                <h2 className="mt-1 font-display text-lg font-semibold group-hover:text-[var(--gold-deep)]">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--slate)]">{post.excerpt}</p>
                <p className="mt-4 text-xs text-[var(--slate)] font-data">
                  {post.publishedAt?.toLocaleDateString()} · {post.readingTimeMins} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
