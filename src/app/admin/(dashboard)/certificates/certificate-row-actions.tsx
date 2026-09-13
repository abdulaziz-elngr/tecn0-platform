"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { deleteCertificate, toggleCertificatePublished, toggleCertificateFeatured } from "./actions";

export function CertificateRowActions({
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

  return (
    <div className="flex items-center justify-end gap-1 border-t border-[var(--border)] pt-3">
      <Link href={`/admin/certificates/${id}/edit`}>
        <Button variant="ghost" size="sm" aria-label="Edit certificate">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle publish"
        onClick={async () => {
          await toggleCertificatePublished(id);
          router.refresh();
        }}
      >
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Toggle featured"
        onClick={async () => {
          await toggleCertificateFeatured(id);
          router.refresh();
        }}
      >
        {featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
      </Button>
      <ConfirmDialog
        title="Delete this certificate permanently?"
        description={`"${title}" will be removed from the public gallery. This can't be undone.`}
        confirmLabel="Delete Certificate"
        onConfirm={async () => {
          const res = await deleteCertificate(id);
          if (res.success) {
            toast.success("Certificate deleted.");
            router.refresh();
          } else {
            toast.error(res.error ?? "Could not delete certificate.");
          }
        }}
        trigger={
          <Button variant="ghost" size="sm" aria-label="Delete certificate">
            <Trash2 className="h-4 w-4 text-[var(--danger)]" />
          </Button>
        }
      />
    </div>
  );
}
