"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { CERTIFICATE_CATEGORIES, type CertificateInput } from "@/lib/validations/certificate";
import { createCertificate, updateCertificate } from "./actions";

export function CertificateForm({
  mode,
  certificateId,
  initial,
}: {
  mode: "create" | "edit";
  certificateId?: string;
  initial?: Partial<CertificateInput>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    title: initial?.title ?? "",
    organization: initial?.organization ?? "",
    issueDate: initial?.issueDate
      ? new Date(initial.issueDate).toISOString().slice(0, 10)
      : "",
    credentialId: initial?.credentialId ?? "",
    credentialUrl: initial?.credentialUrl ?? "",
    image: initial?.image ?? "",
    category: initial?.category ?? CERTIFICATE_CATEGORIES[0],
    description: initial?.description ?? "",
    published: initial?.published ?? true,
    featured: initial?.featured ?? false,
    displayOrder: initial?.displayOrder ?? 0,
  });

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const payload: CertificateInput = { ...values, issueDate: new Date(values.issueDate) };
    const res =
      mode === "create"
        ? await createCertificate(payload)
        : await updateCertificate(certificateId!, payload);

    setPending(false);

    if (res.success) {
      toast.success(mode === "create" ? "Certificate created successfully." : "Certificate updated successfully.");
      router.push("/admin/certificates");
      router.refresh();
    } else if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      toast.error("Please fix the highlighted fields.");
    } else {
      toast.error(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <ImageUpload
        label="Certificate image"
        value={values.image}
        onChange={(url) => update("image", url)}
        folder="tecno-platform/certificates"
      />
      <Input
        id="cert-title"
        label="Title"
        required
        value={values.title}
        onChange={(e) => update("title", e.target.value)}
        error={errors.title}
      />
      <Input
        id="cert-org"
        label="Organization"
        required
        value={values.organization}
        onChange={(e) => update("organization", e.target.value)}
        error={errors.organization}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="cert-date"
          label="Issue date"
          type="date"
          required
          value={values.issueDate}
          onChange={(e) => update("issueDate", e.target.value)}
          error={errors.issueDate}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Category</label>
          <select
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
          >
            {CERTIFICATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="cert-credential-id"
          label="Credential ID"
          value={values.credentialId ?? ""}
          onChange={(e) => update("credentialId", e.target.value)}
        />
        <Input
          id="cert-credential-url"
          label="Credential URL"
          value={values.credentialUrl ?? ""}
          onChange={(e) => update("credentialUrl", e.target.value)}
          error={errors.credentialUrl}
        />
      </div>
      <Textarea
        id="cert-description"
        label="Description"
        value={values.description ?? ""}
        onChange={(e) => update("description", e.target.value)}
      />
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
          {mode === "create" ? "Create certificate" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/certificates")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
