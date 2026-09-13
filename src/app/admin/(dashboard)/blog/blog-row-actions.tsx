"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { deleteBlogPost, toggleBlogPostStatus, toggleBlogPostFeatured } from "./actions";

export function BlogRowActions({
  id,
  status,
  featured,
}: {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/blog/${id}/edit`}>
        <Button variant="ghost" size="sm" aria-label="Edit article">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle publish"
        onClick={async () => {
          const res = await toggleBlogPostStatus(id);
          if (res.success) {
            toast.success(status === "PUBLISHED" ? "Unpublished." : "Published.");
            router.refresh();
          }
        }}
      >
        {status === "PUBLISHED" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle featured"
        onClick={async () => {
          await toggleBlogPostFeatured(id);
          router.refresh();
        }}
      >
        {featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
      </Button>
      <ConfirmDialog
        title="Delete this article permanently?"
        description="This can't be undone."
        confirmLabel="Delete Article"
        onConfirm={async () => {
          const res = await deleteBlogPost(id);
          if (res.success) {
            toast.success("Article deleted.");
            router.refresh();
          } else {
            toast.error(res.error ?? "Could not delete article.");
          }
        }}
        trigger={
          <Button variant="ghost" size="sm" aria-label="Delete article">
            <Trash2 className="h-4 w-4 text-[var(--danger)]" />
          </Button>
        }
      />
    </div>
  );
}
