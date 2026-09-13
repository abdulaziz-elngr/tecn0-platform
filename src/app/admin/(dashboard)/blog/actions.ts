"use server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-admin";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/blog";
import { logActivity } from "@/lib/services/activity-log";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/validations/project";

interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] = issue.message;
  return out;
}

async function resolveCategoryId(name?: string | null) {
  if (!name?.trim()) return null;
  const slug = slugify(name);
  const category = await prisma.blogCategory.upsert({
    where: { slug },
    update: {},
    create: { name: name.trim(), slug },
  });
  return category.id;
}

async function resolveTagIds(names: string[]) {
  const ids: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name);
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function createBlogPost(input: BlogPostInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, fieldErrors: { slug: "A post with this slug already exists." } };

  const categoryId = await resolveCategoryId(parsed.data.categoryName);
  const tagIds = await resolveTagIds(parsed.data.tagNames);

  const post = await prisma.blogPost.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImage: parsed.data.coverImage || null,
      categoryId,
      authorId: user.id!,
      readingTimeMins: parsed.data.readingTimeMins,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
      status: parsed.data.status,
      featured: parsed.data.featured,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  await logActivity({ userId: user.id!, action: "CREATE", entityType: "BlogPost", entityId: post.id, metadata: { title: post.title } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<ActionResult> {
  const user = await requireStaff();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flatten(parsed.error) };

  const conflict = await prisma.blogPost.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (conflict) return { success: false, fieldErrors: { slug: "A post with this slug already exists." } };

  const existingPost = await prisma.blogPost.findUnique({ where: { id } });
  const categoryId = await resolveCategoryId(parsed.data.categoryName);
  const tagIds = await resolveTagIds(parsed.data.tagNames);

  await prisma.$transaction([
    prisma.blogPostTag.deleteMany({ where: { postId: id } }),
    prisma.blogPost.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        coverImage: parsed.data.coverImage || null,
        categoryId,
        readingTimeMins: parsed.data.readingTimeMins,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
        status: parsed.data.status,
        featured: parsed.data.featured,
        publishedAt:
          parsed.data.status === "PUBLISHED"
            ? existingPost?.publishedAt ?? new Date()
            : null,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    }),
  ]);

  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "BlogPost", entityId: id });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Post not found." };

  await prisma.blogPost.delete({ where: { id } });
  await logActivity({ userId: user.id!, action: "DELETE", entityType: "BlogPost", entityId: id, metadata: { title: post.title } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function toggleBlogPostStatus(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Post not found." };

  const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.blogPost.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt: nextStatus === "PUBLISHED" ? post.publishedAt ?? new Date() : post.publishedAt,
    },
  });
  await logActivity({
    userId: user.id!,
    action: nextStatus === "PUBLISHED" ? "PUBLISH" : "UNPUBLISH",
    entityType: "BlogPost",
    entityId: id,
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function toggleBlogPostFeatured(id: string): Promise<ActionResult> {
  const user = await requireStaff();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Post not found." };

  await prisma.blogPost.update({ where: { id }, data: { featured: !post.featured } });
  await logActivity({ userId: user.id!, action: "UPDATE", entityType: "BlogPost", entityId: id, metadata: { featured: !post.featured } });
  revalidatePath("/admin/blog");
  return { success: true };
}
