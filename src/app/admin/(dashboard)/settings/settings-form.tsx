"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { SiteSettingInput } from "@/lib/validations/settings";
import { updateSiteSettings } from "./actions";

export function SettingsForm({ initial }: { initial: SiteSettingInput }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function update<K extends keyof SiteSettingInput>(key: K, value: SiteSettingInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const res = await updateSiteSettings(values);
    setPending(false);

    if (res.success) {
      toast.success("Settings saved.");
    } else if (res.fieldErrors) {
      setErrors(res.fieldErrors);
      toast.error("Please fix the highlighted fields.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="siteName"
          label="Site name"
          value={values.siteName}
          onChange={(e) => update("siteName", e.target.value)}
          error={errors.siteName}
        />
        <Input
          id="brandName"
          label="Brand name"
          value={values.brandName}
          onChange={(e) => update("brandName", e.target.value)}
          error={errors.brandName}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="primaryColor" className="text-sm font-medium">
            Primary color (gold)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              className="h-10 w-10 rounded-[var(--radius-sm)] border border-[var(--border)]"
            />
            <Input
              id="primaryColor"
              value={values.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              error={errors.primaryColor}
            />
          </div>
          <p className="text-xs text-[var(--slate)]">
            Changing this updates the --gold design token everywhere once wired to a runtime
            theme provider.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="secondaryColor" className="text-sm font-medium">
            Secondary color (ink)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.secondaryColor}
              onChange={(e) => update("secondaryColor", e.target.value)}
              className="h-10 w-10 rounded-[var(--radius-sm)] border border-[var(--border)]"
            />
            <Input
              id="secondaryColor"
              value={values.secondaryColor}
              onChange={(e) => update("secondaryColor", e.target.value)}
              error={errors.secondaryColor}
            />
          </div>
        </div>
      </div>

      <Input
        id="contactEmail"
        label="Contact email"
        type="email"
        value={values.contactEmail ?? ""}
        onChange={(e) => update("contactEmail", e.target.value)}
        error={errors.contactEmail}
      />
      <Input
        id="availabilityStatus"
        label="Availability status"
        value={values.availabilityStatus ?? ""}
        onChange={(e) => update("availabilityStatus", e.target.value)}
        placeholder="Open to opportunities"
      />

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.darkModeDefault}
            onChange={(e) => update("darkModeDefault", e.target.checked)}
          />
          Dark mode by default for new visitors
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.maintenanceMode}
            onChange={(e) => update("maintenanceMode", e.target.checked)}
          />
          Maintenance mode (shows a holding page to visitors)
        </label>
      </div>

      <Button type="submit" loading={pending} className="self-start">
        Save settings
      </Button>
    </form>
  );
}
