import { prisma } from "@/lib/prisma";
import type { ActivityAction } from "@prisma/client";

interface LogActivityInput {
  userId: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Central activity logger. Called from every server action that mutates
 * data or touches auth, per spec §28. Never pass passwords, tokens, or
 * other secrets in `metadata` — this table is readable from /admin/activity-logs.
 */
export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
}: LogActivityInput) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata as never,
        ipAddress: ipAddress ?? undefined,
      },
    });
  } catch (err) {
    // Logging must never block or crash the primary operation it's
    // observing — a failed audit write is reported, not thrown.
    console.error("[activity-log] failed to write log entry", err);
  }
}
