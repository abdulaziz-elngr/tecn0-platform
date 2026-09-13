"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "@/components/ui/toast";
import type { SeoSettingInput } from "@/lib/validations/settings";
import { updateSeoSettings } from "../settings/actions";

export function SeoForm({ initial }: { initial: SeoSettingInput }) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);

  function update<K extends keyof SeoSettingInput>(key: K, value: SeoSettingInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await updateSeoSettings(values);
    setPending(false);
    if (res.success) toast.success("SEO settings saved.");
    else toast.error("Could not save SEO settings.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="metaTitle"
        label="Site meta title"
        value={values.metaTitle ?? ""}
        onChange={(e) => update("metaTitle", e.target.value)}
      />
      <Textarea
        id="metaDescription"
        label="Meta description"
        value={values.metaDescription ?? ""}
        onChange={(e) => update("metaDescription", e.target.value)}
      />
      <Input
        id="metaKeywords"
        label="Keywords (comma-separated)"
        value={values.metaKeywords.join(", ")}
        onChange={(e) =>
          update(
            "metaKeywords",
            e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
          )
        }
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
        <p className="mb-3 text-sm font-medium">Open Graph</p>
        <div className="flex flex-col gap-4">
          <Input
            id="ogTitle"
            label="OG title"
            value={values.ogTitle ?? ""}
            onChange={(e) => update("ogTitle", e.target.value)}
          />
          <Textarea
            id="ogDescription"
            label="OG description"
            value={values.ogDescription ?? ""}
            onChange={(e) => update("ogDescription", e.target.value)}
          />
          <ImageUpload
            label="OG image"
            value={values.ogImage}
            onChange={(url) => update("ogImage", url)}
            folder="tecno-platform/seo"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="twitterCard"
          label="Twitter card type"
          value={values.twitterCard ?? ""}
          onChange={(e) => update("twitterCard", e.target.value)}
        />
        <Input
          id="canonicalUrl"
          label="Canonical URL"
          value={values.canonicalUrl ?? ""}
          onChange={(e) => update("canonicalUrl", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.robotsIndex}
          onChange={(e) => update("robotsIndex", e.target.checked)}
        />
        Allow search engines to index this site
      </label>

      <Button type="submit" loading={pending} className="self-start">
        Save SEO settings
      </Button>
    </form>
  );
}
