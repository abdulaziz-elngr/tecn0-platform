"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { uploadImageAction } from "@/lib/actions/upload";
import { toast } from "@/components/ui/toast";

export function ImageUpload({
  value,
  onChange,
  folder,
  label,
}: {
  value?: string | null;
  onChange: (url: string, publicId?: string) => void;
  folder: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Unsupported file type. Use PNG, JPEG, WEBP, or GIF.");
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
      toast.success("Image uploaded.");
    } else {
      toast.error(res.error ?? "Upload failed. Check Cloudinary credentials in .env.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      {value ? (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
          <Image src={value} alt="" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-40 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] text-sm text-[var(--slate)] transition-colors hover:border-[var(--gold)]"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              Click to upload
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
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
