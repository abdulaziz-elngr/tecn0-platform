"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { BrandingInput } from "@/lib/validations/settings";
import { updateBranding } from "./actions";

export function BrandingForm({ initial }: { initial: BrandingInput }) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);

  function setAsset(
    urlKey: keyof BrandingInput,
    publicIdKey: keyof BrandingInput,
    url: string,
    publicId?: string
  ) {
    setValues((v) => ({
      ...v,
      [urlKey]: url,
      // Clearing the image (url === "") always clears its publicId too, so
      // a removed logo can't leave a stale Cloudinary id behind.
      [publicIdKey]: url ? publicId ?? v[publicIdKey] : "",
    }));
  }

  async function handleSave() {
    setPending(true);
    const res = await updateBranding(values);
    setPending(false);

    if (res.success) {
      toast.success("Branding saved. The logo now appears across the site.");
    } else {
      toast.error(res.error ?? "Could not save branding.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <ImageUpload
          label="Logo (light mode / default)"
          value={values.logoUrl}
          onChange={(url, publicId) => setAsset("logoUrl", "logoPublicId", url, publicId)}
          folder="branding"
        />
        <ImageUpload
          label="Logo (dark mode) — optional"
          value={values.logoDarkUrl}
          onChange={(url, publicId) => setAsset("logoDarkUrl", "logoDarkPublicId", url, publicId)}
          folder="branding"
        />
        <ImageUpload
          label="Favicon — optional"
          value={values.faviconUrl}
          onChange={(url, publicId) => setAsset("faviconUrl", "faviconPublicId", url, publicId)}
          folder="branding"
        />
      </div>

      <p className="text-xs text-[var(--slate)]">
        PNG, JPEG, WEBP, or GIF, up to 8MB. If no logo is uploaded, the site falls back to the
        original &quot;Tecno Team&quot; text mark — nothing breaks either way.
      </p>

      <Button type="button" onClick={handleSave} loading={pending} className="self-start">
        Save branding
      </Button>
    </div>
  );
}
