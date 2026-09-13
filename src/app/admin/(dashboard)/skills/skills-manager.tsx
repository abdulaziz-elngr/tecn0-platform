"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { slugify } from "@/lib/validations/project";
import { Plus, Trash2, Eye, EyeOff, Pencil, X } from "lucide-react";
import {
  createSkillCategory,
  deleteSkillCategory,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillPublished,
} from "./actions";

interface SkillRow {
  id: string;
  name: string;
  proficiency: number;
  published: boolean;
  categoryId: string;
  displayOrder: number;
}
interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  skills: SkillRow[];
}

export function SkillsManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [newCategory, setNewCategory] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [editing, setEditing] = useState<SkillRow | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const res = await createSkillCategory({
      name: newCategory.trim(),
      slug: slugify(newCategory),
      displayOrder: categories.length,
    });
    if (res.success) {
      toast.success("Category added.");
      setNewCategory("");
      refresh();
    } else {
      toast.error(Object.values(res.fieldErrors ?? {})[0] ?? "Could not add category.");
    }
  }

  async function handleDeleteCategory(id: string) {
    const res = await deleteSkillCategory(id);
    if (res.success) {
      toast.success("Category deleted.");
      refresh();
    } else {
      toast.error(res.error ?? "Could not delete category.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleAddCategory} className="flex items-end gap-2">
        <Input
          id="new-category"
          label="New skill category"
          placeholder="e.g. AI / Data"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button type="submit" size="md">
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </form>

      <div className="flex flex-col gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">{cat.name}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setAddingTo(cat.id)}>
                  <Plus className="h-4 w-4" /> Skill
                </Button>
                <ConfirmDialog
                  title={`Delete "${cat.name}"?`}
                  description="This only works if the category has no skills left in it."
                  confirmLabel="Delete category"
                  onConfirm={() => handleDeleteCategory(cat.id)}
                  trigger={
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                    </Button>
                  }
                />
              </div>
            </div>

            {cat.skills.length === 0 && addingTo !== cat.id ? (
              <p className="py-4 text-center text-sm text-[var(--slate)]">No skills yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {cat.skills.map((skill) =>
                  editing?.id === skill.id ? (
                    <SkillEditRow
                      key={skill.id}
                      skill={editing}
                      onChange={setEditing}
                      onCancel={() => setEditing(null)}
                      onSave={async () => {
                        const res = await updateSkill(skill.id, editing);
                        if (res.success) {
                          toast.success("Skill updated.");
                          setEditing(null);
                          refresh();
                        } else {
                          toast.error("Could not update skill.");
                        }
                      }}
                    />
                  ) : (
                    <li
                      key={skill.id}
                      className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{skill.name}</span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]">
                          <div
                            className="h-full bg-[var(--gold)]"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                        {!skill.published && <Badge>Hidden</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(skill)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            startTransition(async () => {
                              await toggleSkillPublished(skill.id);
                              refresh();
                            })
                          }
                        >
                          {skill.published ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <ConfirmDialog
                          title={`Delete "${skill.name}"?`}
                          description="This removes it from the public skills section."
                          confirmLabel="Delete"
                          onConfirm={async () => {
                            const res = await deleteSkill(skill.id);
                            if (res.success) {
                              toast.success("Skill deleted.");
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
                    </li>
                  )
                )}
              </ul>
            )}

            {addingTo === cat.id && (
              <AddSkillRow
                categoryId={cat.id}
                order={cat.skills.length}
                onCancel={() => setAddingTo(null)}
                onAdded={() => {
                  setAddingTo(null);
                  refresh();
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddSkillRow({
  categoryId,
  order,
  onCancel,
  onAdded,
}: {
  categoryId: string;
  order: number;
  onCancel: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState(60);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    const res = await createSkill({
      name: name.trim(),
      categoryId,
      proficiency,
      published: true,
      displayOrder: order,
    });
    setPending(false);
    if (res.success) {
      toast.success("Skill added.");
      onAdded();
    } else {
      toast.error("Could not add skill.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
      <Input
        id="skill-name"
        placeholder="Skill name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <input
        type="range"
        min={0}
        max={100}
        value={proficiency}
        onChange={(e) => setProficiency(Number(e.target.value))}
        className="w-28"
      />
      <span className="w-10 text-right text-xs font-data text-[var(--slate)]">
        {proficiency}%
      </span>
      <Button type="submit" size="sm" loading={pending}>
        Add
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}

function SkillEditRow({
  skill,
  onChange,
  onCancel,
  onSave,
}: {
  skill: SkillRow;
  onChange: (s: SkillRow) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <li className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--gold)] px-3 py-2 text-sm">
      <input
        value={skill.name}
        onChange={(e) => onChange({ ...skill, name: e.target.value })}
        className="h-8 flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
      />
      <input
        type="range"
        min={0}
        max={100}
        value={skill.proficiency}
        onChange={(e) => onChange({ ...skill, proficiency: Number(e.target.value) })}
        className="w-28"
      />
      <span className="w-10 text-right text-xs font-data text-[var(--slate)]">
        {skill.proficiency}%
      </span>
      <Button size="sm" onClick={onSave}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}
