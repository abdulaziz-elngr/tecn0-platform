import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "@/lib/services/analytics";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, tags: { include: { tag: true } }, author: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return { title: "Article not found — Tecno Team" };

  return {
    title: post.seoTitle || `${post.title} — Tecno Team`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  await trackEvent({ type: "BLOG_VIEW", path: `/blog/${slug}`, blogPostId: post.id });

  const related = await prisma.blogPost
    .findMany({
      where: {
        status: "PUBLISHED",
        id: { not: post.id },
        categoryId: post.categoryId ?? undefined,
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    })
    .catch(() => []);

  return (
    <article className="mx-auto max-w-2xl px-6 py-24">
      {post.category && (
        <p className="text-sm font-medium text-[var(--gold-deep)]">{post.category.name}</p>
      )}
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-[var(--slate)] font-data">
        {post.publishedAt?.toLocaleDateString()} · {post.readingTimeMins} min read ·{" "}
        {post.author.name}
      </p>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--border)]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            unoptimized
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-wrap text-[var(--ink)]">
        {post.content}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-[var(--border)] pt-6">
          {post.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-full bg-[var(--border)] px-3 py-1 text-xs text-[var(--slate)]"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-lg font-semibold">Related articles</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blog/${r.slug}`} className="text-sm hover:text-[var(--gold-deep)]">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
