/**
 * File storage abstraction (spec §27).
 *
 * All upload call sites (project images, certificate images, blog covers,
 * profile image, CV) go through `storage.upload()` — none of them know or
 * care which backend is behind it. That means switching from Cloudinary to
 * S3, or to local disk in development, is a one-file change here, not a
 * rewrite across every CMS module.
 *
 * Active backend: Cloudinary (unsigned server-side upload via API secret —
 * the secret never reaches the browser; the client only ever gets back a
 * public URL).
 *
 * Required env vars (see .env.example):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes: number;
  format: string;
}

/** Mirrors Cloudinary's resource_type values that this app actually uploads. */
export type StorageResourceType = "image" | "raw";

export interface StorageService {
  upload(file: File, folder: string): Promise<UploadResult>;
  /**
   * resourceType must match what the asset was uploaded as, or Cloudinary's
   * destroy call will silently no-op and the file stays orphaned. The
   * `/auto/upload` endpoint stores images (incl. PDFs it can rasterize) as
   * `image`; anything Cloudinary can't treat as an image/video lands under
   * `raw`. Default to "image" since that covers every current use (logos,
   * favicons, profile photos, certificate images).
   */
  delete(publicId: string, resourceType?: StorageResourceType): Promise<void>;
}

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf", // CV
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/** Throws with a user-safe message; never leaks internal details. */
export function validateUploadedFile(file: File) {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported file type. Allowed: PNG, JPEG, WEBP, GIF, PDF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large. Maximum size is 8MB.");
  }
  // Reject filenames with path traversal / control characters even though
  // Cloudinary derives its own storage key — defense in depth for any
  // logging or local-fallback path that might echo the original filename.
  if (/[/\\\0]/.test(file.name)) {
    throw new Error("Invalid filename.");
  }
}

class CloudinaryStorage implements StorageService {
  private cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  private apiKey = process.env.CLOUDINARY_API_KEY;
  private apiSecret = process.env.CLOUDINARY_API_SECRET;

  async upload(file: File, folder: string): Promise<UploadResult> {
    validateUploadedFile(file);
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env."
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    // Signed upload: we sign server-side with the API secret so the secret
    // never touches the client. This is a real Cloudinary signed upload,
    // not a stub — it requires valid credentials to actually run.
    const crypto = await import("crypto");
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + this.apiSecret)
      .digest("hex");

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", this.apiKey);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);
    body.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`, {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // Log the raw provider response server-side for debugging, but never
      // forward it to the client — it's a third party's raw error text,
      // not something we've vetted as safe to display.
      console.error(`Cloudinary upload failed (${res.status}): ${errText.slice(0, 500)}`);
      throw new Error(`Upload failed (${res.status}). Please try again or contact support.`);
    }

    const data = await res.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      format: data.format,
    };
  }

  async delete(publicId: string, resourceType: StorageResourceType = "image"): Promise<void> {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error("Cloudinary is not configured.");
    }
    const crypto = await import("crypto");
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + this.apiSecret)
      .digest("hex");

    const body = new URLSearchParams({
      public_id: publicId,
      api_key: this.apiKey,
      timestamp: String(timestamp),
      signature,
    });

    // Must hit the same resource_type namespace the file was uploaded under
    // (image vs raw) — destroy against the wrong one returns "not found"
    // and leaves the real asset sitting in Cloudinary storage.
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/destroy`,
      { method: "POST", body }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // Deletion failures shouldn't crash the calling mutation (e.g. a logo
      // replace) — log server-side and let the caller decide whether to
      // surface a warning, per "handle deletion failures safely and log
      // them."
      console.error(`Cloudinary delete failed (${res.status}) for ${publicId}: ${errText.slice(0, 200)}`);
      throw new Error(`Delete failed (${res.status}).`);
    }
  }
}

export const storage: StorageService = new CloudinaryStorage();
