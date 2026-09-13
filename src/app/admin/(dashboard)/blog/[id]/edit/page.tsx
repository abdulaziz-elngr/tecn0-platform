import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { BlogPostForm } from "../../blog-form";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Article — Tecno Team Admin" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!post) notFound();

  return (
    <>
      <AdminTopbar title={`Edit — ${post.title}`} breadcrumb="Blog" />
      <main className="flex-1 overflow-y-auto p-6">
        <BlogPostForm
          mode="edit"
          postId={post.id}
          initial={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage ?? "",
            categoryName: post.category?.name ?? "",
            tagNames: post.tags.map((t) => t.tag.name),
            readingTimeMins: post.readingTimeMins,
            seoTitle: post.seoTitle ?? "",
            seoDescription: post.seoDescription ?? "",
            status: post.status,
            featured: post.featured,
          }}
        />
      </main>
    </>
  );
}
