"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { OwnerSelect } from "@/components/admin/owner-select";
import { CONTENT_OWNER_LABELS, type ContentOwnerValue } from "@/lib/validations/content-owner";
import { SOCIAL_PLATFORMS } from "@/lib/validations/social-link";
import { createSocialLink, updateSocialLink, deleteSocialLink, toggleSocialLinkEnabled } from "./actions";

interface LinkRow {
  id: string;
  platform: (typeof SOCIAL_PLATFORMS)[number];
  label: string;
  url: string;
  enabled: boolean;
  displayOrder: number;
  owner?: ContentOwnerValue | null;
}

export function SocialLinksManager({ links }: { links: LinkRow[] }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<LinkRow["platform"]>("GITHUB");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [owner, setOwner] = useState<ContentOwnerValue | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await createSocialLink({
      platform,
      label,
      url,
      enabled: true,
      displayOrder: links.length,
      owner,
    });
    setPending(false);
    if (res.success) {
      toast.success("Social link added.");
      setLabel("");
      setUrl("");
      setOwner(null);
      router.refresh();
    } else {
      toast.error(Object.values(res.fieldErrors ?? {})[0] ?? "Could not add link.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_1fr_auto]">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as LinkRow["platform"])}
          className="h-10 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm"
        >
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <Input
          id="social-label"
          placeholder="Label (e.g. GitHub)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <Input
          id="social-url"
          placeholder="https://github.com/username"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" loading={pending}>
          <Plus className="h-4 w-4" /> Add
        </Button>
        <div className="sm:col-span-4">
          <OwnerSelect value={owner} onChange={setOwner} />
        </div>
      </form>

      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <Badge tone="gold">{link.platform}</Badge>
              <span className="font-medium">{link.label}</span>
              <span className="truncate text-xs text-[var(--slate)]">{link.url}</span>
              {link.owner && <Badge>{CONTENT_OWNER_LABELS[link.owner]}</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <select
                aria-label={`Change owner for ${link.label}`}
                value={link.owner ?? ""}
                onChange={async (e) => {
                  const nextOwner = e.target.value ? (e.target.value as ContentOwnerValue) : null;
                  await updateSocialLink(link.id, {
                    platform: link.platform,
                    label: link.label,
                    url: link.url,
                    enabled: link.enabled,
                    displayOrder: link.displayOrder,
                    owner: nextOwner,
                  });
                  router.refresh();
                }}
                className="h-8 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-xs"
              >
                <option value="">Unclassified</option>
                {Object.entries(CONTENT_OWNER_LABELS).map(([val, text]) => (
                  <option key={val} value={val}>
                    {text}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await toggleSocialLinkEnabled(link.id);
                  router.refresh();
                }}
              >
                {link.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <ConfirmDialog
                title={`Remove "${link.label}"?`}
                description="This removes it from the navbar, footer, and contact section."
                confirmLabel="Remove"
                onConfirm={async () => {
                  const res = await deleteSocialLink(link.id);
                  if (res.success) {
                    toast.success("Link removed.");
                    router.refresh();
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
        ))}
      </ul>
    </div>
  );
}
