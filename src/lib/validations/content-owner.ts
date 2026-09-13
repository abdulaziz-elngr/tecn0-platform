import { z } from "zod";

/**
 * Shared across Projects, Experience, Social Links, and Services (Phase 8:
 * Content Ownership). Nullable everywhere it's used — an unset owner means
 * "not yet classified," not "Personal" or "Tecno" by default. Existing
 * records created before this feature keep `owner: null` and stay visible
 * under "All" until an admin explicitly classifies them.
 */
export const CONTENT_OWNERS = ["PERSONAL", "TECNO", "BOTH"] as const;
export type ContentOwnerValue = (typeof CONTENT_OWNERS)[number];

export const contentOwnerSchema = z.enum(CONTENT_OWNERS).optional().nullable();

export const CONTENT_OWNER_LABELS: Record<ContentOwnerValue, string> = {
  PERSONAL: "Personal",
  TECNO: "Tecno Team",
  BOTH: "Personal + Tecno Team",
};
