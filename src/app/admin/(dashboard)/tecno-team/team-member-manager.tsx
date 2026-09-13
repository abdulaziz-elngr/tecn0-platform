"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberPublished,
} from "./actions";

interface MemberRow {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoPublicId: string | null;
  websiteUrl: string | null;
  published: boolean;
  displayOrder: number;
}

const emptyDraft = {
  name: "",
  role: "",
  bio: "",
  photoUrl: "",
  photoPublicId: "",
  websiteUrl: "",
};

export function TeamMemberManager({ members }: { members: MemberRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function refresh() {
    router.refresh();
  }

  function startEdit(m: MemberRow) {
    setEditingId(m.id);
    setDraft({
      name: m.name,
      role: m.role ?? "",
      bio: m.bio ?? "",
      photoUrl: m.photoUrl ?? "",
      photoPublicId: m.photoPublicId ?? "",
      websiteUrl: m.websiteUrl ?? "",
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
      ...draft,
      published: true,
      displayOrder: editingId
        ? members.find((m) => m.id === editingId)?.displayOrder ?? 0
        : members.length,
    };
    const res = editingId ? await updateTeamMember(editingId, payload) : await createTeamMember(payload);
    setPending(false);

    if (res.success) {
      toast.success(editingId ? "Team member updated." : "Team member added.");
      resetForm();
      refresh();
    } else {
      toast.error(Object.values(res.fieldErrors ?? {})[0] ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="member-name"
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
          />
          <Input
            id="member-role"
            label="Role"
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          />
        </div>
        <Textarea
          id="member-bio"
          label="Bio"
          value={draft.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
        />
        <Input
          id="member-website"
          label="Website / profile URL (optional)"
          value={draft.websiteUrl}
          onChange={(e) => setDraft({ ...draft, websiteUrl: e.target.value })}
        />
        <ImageUpload
          label="Photo"
          value={draft.photoUrl}
          onChange={(url, publicId) => setDraft({ ...draft, photoUrl: url, photoPublicId: publicId ?? "" })}
          folder="team"
        />
        <div className="flex gap-3">
          <Button type="submit" loading={pending}>
            {editingId ? "Save changes" : "Add team member"}
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
        {members.map((m) => (
          <div key={m.id} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-medium">{m.name}</p>
                {m.role && <p className="text-xs text-[var(--slate)]">{m.role}</p>}
              </div>
              {!m.published && <Badge>Hidden</Badge>}
            </div>
            {m.bio && <p className="mb-3 text-sm text-[var(--slate)]">{m.bio}</p>}
            <div className="flex items-center justify-end gap-1 border-t border-[var(--border)] pt-3">
              <Button size="sm" variant="ghost" onClick={() => startEdit(m)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await toggleTeamMemberPublished(m.id);
                  refresh();
                }}
              >
                {m.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <ConfirmDialog
                title={`Remove "${m.name}"?`}
                description="This removes them from the public Tecno Team page."
                confirmLabel="Remove"
                onConfirm={async () => {
                  const res = await deleteTeamMember(m.id);
                  if (res.success) {
                    toast.success("Team member removed.");
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
