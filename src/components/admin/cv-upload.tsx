"use client";

import { useRef, useState } from "react";
import { FileText, X, Loader2, UploadCloud } from "lucide-react";
import { uploadImageAction } from "@/lib/actions/upload";
import { toast } from "@/components/ui/toast";

/**
 * CV upload — same `storage.upload()` pipeline as ImageUpload (Cloudinary
 * already allows application/pdf, see storage.ts ALLOWED_MIME), just with a
 * PDF-appropriate preview instead of an <Image> thumbnail.
 */
export function CvUpload({
  value,
  onChange,
  label = "CV / Resume",
  folder = "profile",
}: {
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  label?: string;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 8MB.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    const res = await uploadImageAction(fd);
    setUploading(false);

    if (res.success && res.url) {
      onChange(res.url, res.publicId);
      toast.success("CV uploaded.");
    } else {
      toast.error(res.error ?? "Upload failed. Check Cloudinary credentials in .env.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      {value ? (
        <div className="flex max-w-xs items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-3">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-[var(--gold-deep)]"
          >
            <FileText className="h-4 w-4" /> View current CV
          </a>
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--slate)] hover:bg-[var(--border)]"
            aria-label="Remove CV"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-16 w-full max-w-xs items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] text-sm text-[var(--slate)] transition-colors hover:border-[var(--gold)]"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          {uploading ? "Uploading…" : "Upload PDF"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
