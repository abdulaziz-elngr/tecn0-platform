"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { slugify } from "@/lib/validations/project";
import type { BlogPostInput } from "@/lib/validations/blog";
import { createBlogPost, updateBlogPost } from "./actions";

export function BlogPostForm({
  mode,
  postId,
  initial,
}: {
  mode: "create" | "edit";
  postId?: string;
  initial?: Partial<BlogPostInput>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<BlogPostInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    categoryName: initial?.categoryName ?? "",
    tagNames: initial?.tagNames ?? [],
    readingTimeMins: initial?.readingTimeMins ?? 3,
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    status: initial?.status ?? "DRAFT",
    featured: initial?.featured ?? false,
  });

  function update<K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function savePost(publishNow?: boolean) {
    setPending(true);
    setErrors({});

    const payload = { ...values, status: publishNow ? ("PUBLISHED" as const) : values.status };
    const res = mode === "create" ? await createBlogPost(payload) : await updateBlogPost(postId!, payload);
    setPending(false);

    if (res.success) {
      toast.success(mode === "create" ? "Article created." : "Article updated.");
      router.push("/admin/blog");
      router.refresh();
    } else if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      toast.error("Please fix the highlighted fields.");
    } else {
      toast.error(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        savePost();
      }}
      className="flex max-w-3xl flex-col gap-5"
    >
      <ImageUpload
        label="Cover image"
        value={values.coverImage}
        onChange={(url) => update("coverImage", url)}
        folder="tecno-platform/blog"
      />
      <Input
        id="post-title"
        label="Title"
        required
        value={values.title}
        onChange={(e) => {
          update("title", e.target.value);
          if (mode === "create") update("slug", slugify(e.target.value));
        }}
        error={errors.title}
      />
      <Input
        id="post-slug"
        label="Slug"
        required
        value={values.slug}
        onChange={(e) => update("slug", e.target.value)}
        error={errors.slug}
      />
      <Textarea
        id="post-excerpt"
        label="Excerpt"
        required
        value={values.excerpt}
        onChange={(e) => update("excerpt", e.target.value)}
        error={errors.excerpt}
      />
      <Textarea
        id="post-content"
        label="Content (Markdown)"
        required
        className="min-h-64 font-data"
        value={values.content}
        onChange={(e) => update("content", e.target.value)}
        error={errors.content}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="post-category"
          label="Category"
          value={values.categoryName ?? ""}
          onChange={(e) => update("categoryName", e.target.value)}
        />
        <Input
          id="post-reading-time"
          label="Reading time (mins)"
          type="number"
          min={1}
          value={values.readingTimeMins}
          onChange={(e) => update("readingTimeMins", Number(e.target.value))}
        />
      </div>
      <Input
        id="post-tags"
        label="Tags (comma-separated)"
        value={values.tagNames.join(", ")}
        onChange={(e) =>
          update(
            "tagNames",
            e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
          )
        }
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
        <p className="mb-3 text-sm font-medium">SEO</p>
        <div className="flex flex-col gap-3">
          <Input
            id="post-seo-title"
            label="SEO title"
            value={values.seoTitle ?? ""}
            onChange={(e) => update("seoTitle", e.target.value)}
          />
          <Textarea
            id="post-seo-description"
            label="SEO description"
            value={values.seoDescription ?? ""}
            onChange={(e) => update("seoDescription", e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => update("featured", e.target.checked)}
        />
        Featured
      </label>

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        <Button type="submit" variant="secondary" loading={pending}>
          Save as draft
        </Button>
        <Button type="button" loading={pending} onClick={() => savePost(true)}>
          {values.status === "PUBLISHED" && mode === "edit" ? "Save changes" : "Publish"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
