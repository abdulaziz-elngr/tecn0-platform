"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { OwnerSelect } from "@/components/admin/owner-select";
import type { ContentOwnerValue } from "@/lib/validations/content-owner";
import { CONTENT_OWNER_LABELS } from "@/lib/validations/content-owner";
import { EXPERIENCE_TYPES } from "@/lib/validations/experience";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  togglePublishedExperience,
} from "./actions";

interface ExperienceRow {
  id: string;
  year: string;
  title: string;
  description: string;
  category: string | null;
  published: boolean;
  displayOrder: number;
  owner?: ContentOwnerValue | null;
  entryType?: (typeof EXPERIENCE_TYPES)[number] | null;
  organization?: string | null;
  current?: boolean;
}

const ENTRY_TYPE_LABELS: Record<(typeof EXPERIENCE_TYPES)[number], string> = {
  PERSONAL: "Personal milestone",
  EDUCATION: "Education",
  WORK: "Work / Team",
  EVENT: "Event",
  OTHER: "Other",
};

const emptyDraft = {
  year: "",
  title: "",
  description: "",
  category: "",
  organization: "",
  owner: null as ContentOwnerValue | null,
  entryType: "OTHER" as (typeof EXPERIENCE_TYPES)[number],
  current: false,
};

export function ExperienceManager({ entries }: { entries: ExperienceRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function refresh() {
    router.refresh();
  }

  function startEdit(entry: ExperienceRow) {
    setEditingId(entry.id);
    setDraft({
      year: entry.year,
      title: entry.title,
      description: entry.description,
      category: entry.category ?? "",
      organization: entry.organization ?? "",
      owner: entry.owner ?? null,
      entryType: entry.entryType ?? "OTHER",
      current: entry.current ?? false,
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
        ? entries.find((e) => e.id === editingId)?.displayOrder ?? 0
        : entries.length,
    };
    const res = editingId
      ? await updateExperience(editingId, payload)
      : await createExperience(payload);
    setPending(false);

    if (res.success) {
      toast.success(editingId ? "Entry updated." : "Entry added.");
      resetForm();
      refresh();
    } else {
      toast.error(Object.values(res.fieldErrors ?? {})[0] ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
        <Input
          id="year"
          label="Year"
          placeholder="2026"
          value={draft.year}
          onChange={(e) => setDraft({ ...draft, year: e.target.value })}
          required
        />
        <Input
          id="exp-title"
          label="Title"
          placeholder="AI + IoT"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
        <div className="sm:col-span-2">
          <Textarea
            id="exp-description"
            label="Description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            required
          />
        </div>
        <Input
          id="exp-organization"
          label="Organization (optional)"
          placeholder="Tecno Team, Innovation University, ..."
          value={draft.organization}
          onChange={(e) => setDraft({ ...draft, organization: e.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exp-type" className="text-sm font-medium">
            Type
          </label>
          <select
            id="exp-type"
            value={draft.entryType}
            onChange={(e) =>
              setDraft({ ...draft, entryType: e.target.value as (typeof EXPERIENCE_TYPES)[number] })
            }
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
          >
            {EXPERIENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTRY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <OwnerSelect value={draft.owner} onChange={(v) => setDraft({ ...draft, owner: v })} />
        </div>
        <div className="sm:col-span-2 flex gap-3">
          <Button type="submit" loading={pending}>
            {editingId ? "Save changes" : "Add entry"}
            {!editingId && <Plus className="h-4 w-4" />}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <ol className="relative flex flex-col gap-5 border-l border-[var(--border)] pl-6">
        {entries.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-data text-xs text-[var(--gold-deep)]">{entry.year}</p>
                <p className="font-medium">{entry.title}</p>
                <p className="mt-1 text-sm text-[var(--slate)]">{entry.description}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {!entry.published && <Badge>Hidden</Badge>}
                  {entry.organization && <Badge>{entry.organization}</Badge>}
                  {entry.owner && <Badge>{CONTENT_OWNER_LABELS[entry.owner]}</Badge>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await togglePublishedExperience(entry.id);
                    refresh();
                  }}
                >
                  {entry.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <ConfirmDialog
                  title={`Delete "${entry.title}"?`}
                  description="This removes it from the public timeline."
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    const res = await deleteExperience(entry.id);
                    if (res.success) {
                      toast.success("Entry deleted.");
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
          </li>
        ))}
      </ol>
    </div>
  );
}
