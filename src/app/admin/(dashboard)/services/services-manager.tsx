"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { OwnerSelect } from "@/components/admin/owner-select";
import { CONTENT_OWNER_LABELS, type ContentOwnerValue } from "@/lib/validations/content-owner";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { createService, updateService, deleteService, toggleServicePublished } from "./actions";

interface ServiceRow {
  id: string;
  title: string;
  description: string;
  features: string[];
  published: boolean;
  displayOrder: number;
  owner?: ContentOwnerValue | null;
}

const emptyDraft = { title: "", description: "", features: "", owner: null as ContentOwnerValue | null };

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function refresh() {
    router.refresh();
  }

  function startEdit(service: ServiceRow) {
    setEditingId(service.id);
    setDraft({
      title: service.title,
      description: service.description,
      features: service.features.join(", "),
      owner: service.owner ?? null,
    });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const payload = {
      title: draft.title,
      description: draft.description,
      features: draft.features.split(",").map((f) => f.trim()).filter(Boolean),
      owner: draft.owner,
      published: true,
      displayOrder: editingId
        ? services.find((s) => s.id === editingId)?.displayOrder ?? 0
        : services.length,
    };
    const res = editingId ? await updateService(editingId, payload) : await createService(payload);
    setPending(false);

    if (res.success) {
      toast.success(editingId ? "Service updated." : "Service added.");
      resetForm();
      refresh();
    } else {
      toast.error(Object.values(res.fieldErrors ?? {})[0] ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="svc-title"
          label="Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
        <Textarea
          id="svc-description"
          label="Description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          required
        />
        <Input
          id="svc-features"
          label="Features (comma-separated)"
          value={draft.features}
          onChange={(e) => setDraft({ ...draft, features: e.target.value })}
        />
        <OwnerSelect value={draft.owner} onChange={(v) => setDraft({ ...draft, owner: v })} />
        <div className="flex gap-3">
          <Button type="submit" loading={pending}>
            {editingId ? "Save changes" : "Add service"}
            {!editingId && <Plus className="h-4 w-4" />}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <div className="mb-2 flex items-start justify-between">
              <p className="font-medium">{s.title}</p>
              <div className="flex gap-1">
                {!s.published && <Badge>Hidden</Badge>}
                {s.owner && <Badge>{CONTENT_OWNER_LABELS[s.owner]}</Badge>}
              </div>
            </div>
            <p className="mb-3 text-sm text-[var(--slate)]">{s.description}</p>
            <div className="flex items-center justify-end gap-1 border-t border-[var(--border)] pt-3">
              <Button size="sm" variant="ghost" onClick={() => startEdit(s)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await toggleServicePublished(s.id);
                  refresh();
                }}
              >
                {s.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <ConfirmDialog
                title={`Delete "${s.title}"?`}
                description="This removes it from the public Services section."
                confirmLabel="Delete"
                onConfirm={async () => {
                  const res = await deleteService(s.id);
                  if (res.success) {
                    toast.success("Service deleted.");
                    refresh();
                  }
                }}
                trigger={
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                  </Button>
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
