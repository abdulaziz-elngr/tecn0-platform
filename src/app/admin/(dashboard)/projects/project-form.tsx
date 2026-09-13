"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { OwnerSelect } from "@/components/admin/owner-select";
import { slugify, type ProjectInput } from "@/lib/validations/project";
import { createProject, updateProject } from "./actions";

const CATEGORIES = ["Web", "Mobile", "IoT", "Embedded Systems", "AI + IoT", "Data"];

export function ProjectForm({
  mode,
  projectId,
  initial,
}: {
  mode: "create" | "edit";
  projectId?: string;
  initial?: Partial<ProjectInput>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<ProjectInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    fullDescription: initial?.fullDescription ?? "",
    category: initial?.category ?? CATEGORIES[0],
    technologies: initial?.technologies ?? [],
    role: initial?.role ?? "",
    projectDate: initial?.projectDate ?? undefined,
    problem: initial?.problem ?? "",
    solution: initial?.solution ?? "",
    features: initial?.features ?? [],
    challenges: initial?.challenges ?? "",
    results: initial?.results ?? "",
    githubUrl: initial?.githubUrl ?? "",
    liveUrl: initial?.liveUrl ?? "",
    featuredImage: initial?.featuredImage ?? "",
    published: initial?.published ?? false,
    featured: initial?.featured ?? false,
    displayOrder: initial?.displayOrder ?? 0,
    owner: initial?.owner ?? null,
  });

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const res =
      mode === "create" ? await createProject(values) : await updateProject(projectId!, values);

    setPending(false);

    if (res.success) {
      toast.success(mode === "create" ? "Project created successfully." : "Project updated successfully.");
      router.push("/admin/projects");
      router.refresh();
    } else if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      toast.error("Please fix the highlighted fields.");
    } else {
      toast.error(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-5">
      <Input
        id="title"
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
        id="slug"
        label="Slug"
        required
        value={values.slug}
        onChange={(e) => update("slug", e.target.value)}
        error={errors.slug}
      />
      <Textarea
        id="shortDescription"
        label="Short description"
        required
        value={values.shortDescription}
        onChange={(e) => update("shortDescription", e.target.value)}
        error={errors.shortDescription}
      />
      <Textarea
        id="fullDescription"
        label="Full description"
        value={values.fullDescription ?? ""}
        onChange={(e) => update("fullDescription", e.target.value)}
        className="min-h-40"
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="role"
          label="Role"
          value={values.role ?? ""}
          onChange={(e) => update("role", e.target.value)}
        />
      </div>

      <OwnerSelect value={values.owner} onChange={(v) => update("owner", v)} label="This project belongs to" />

      <Input
        id="technologies"
        label="Technologies (comma-separated)"
        value={values.technologies.join(", ")}
        onChange={(e) =>
          update(
            "technologies",
            e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
          )
        }
      />

      <Textarea
        id="problem"
        label="Problem"
        value={values.problem ?? ""}
        onChange={(e) => update("problem", e.target.value)}
      />
      <Textarea
        id="solution"
        label="Solution"
        value={values.solution ?? ""}
        onChange={(e) => update("solution", e.target.value)}
      />
      <Input
        id="features"
        label="Key features (comma-separated)"
        value={values.features.join(", ")}
        onChange={(e) =>
          update(
            "features",
            e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
          )
        }
      />
      <Textarea
        id="challenges"
        label="Challenges"
        value={values.challenges ?? ""}
        onChange={(e) => update("challenges", e.target.value)}
      />
      <Textarea
        id="results"
        label="Results"
        value={values.results ?? ""}
        onChange={(e) => update("results", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="githubUrl"
          label="GitHub URL"
          value={values.githubUrl ?? ""}
          onChange={(e) => update("githubUrl", e.target.value)}
          error={errors.githubUrl}
        />
        <Input
          id="liveUrl"
          label="Live demo URL"
          value={values.liveUrl ?? ""}
          onChange={(e) => update("liveUrl", e.target.value)}
          error={errors.liveUrl}
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Featured
        </label>
      </div>

      <div className="flex gap-3 border-t border-[var(--border)] pt-4">
        <Button type="submit" loading={pending}>
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
