"use client";

import Link from "next/link";
import { Pencil, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { deleteProject, togglePublish, toggleFeatured } from "./actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ProjectRowActions({
  id,
  title,
  published,
  featured,
}: {
  id: string;
  title: string;
  published: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handlePublishToggle() {
    startTransition(async () => {
      const res = await togglePublish(id);
      if (res.success) {
        toast.success(published ? "Project unpublished." : "Project published.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not update project.");
      }
    });
  }

  function handleFeaturedToggle() {
    startTransition(async () => {
      const res = await toggleFeatured(id);
      if (res.success) {
        toast.success(featured ? "Removed from featured." : "Marked as featured.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not update project.");
      }
    });
  }

  async function handleDelete() {
    const res = await deleteProject(id);
    if (res.success) {
      toast.success("Project deleted.");
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not delete project.");
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/projects/${id}/edit`}>
        <Button variant="ghost" size="sm" aria-label="Edit project">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handlePublishToggle} aria-label="Toggle publish">
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleFeaturedToggle} aria-label="Toggle featured">
        {featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
      </Button>
      <ConfirmDialog
        title="Delete this project permanently?"
        description={`"${title}" and all of its images will be removed. This can't be undone.`}
        confirmLabel="Delete Project"
        onConfirm={handleDelete}
        trigger={
          <Button variant="ghost" size="sm" aria-label="Delete project">
            <Trash2 className="h-4 w-4 text-[var(--danger)]" />
          </Button>
        }
      />
    </div>
  );
}
