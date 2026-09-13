import { prisma } from "@/lib/prisma";
import type { AnalyticsEventType } from "@prisma/client";

interface TrackEventInput {
  type: AnalyticsEventType;
  path: string;
  projectId?: string;
  blogPostId?: string;
  referrer?: string | null;
  userAgent?: string | null;
}

/**
 * Records a real analytics event. Only what's actually tracked is exposed
 * to /admin/analytics — no fabricated "unique visitor" figures beyond what
 * this table can genuinely support (a rough per-day distinct-path count,
 * not device fingerprinting or cross-session identity).
 */
export async function trackEvent(input: TrackEventInput) {
  try {
    await prisma.analyticsEvent.create({ data: input });
  } catch (err) {
    console.error("[analytics] failed to record event", err);
  }
}

export async function getDashboardStats() {
  const [totalViews, projectCount, certificateCount, blogPostCount, unreadMessages] =
    await Promise.all([
      prisma.analyticsEvent.count(),
      prisma.project.count(),
      prisma.certificate.count(),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.message.count({ where: { status: "UNREAD" } }),
    ]);

  return { totalViews, projectCount, certificateCount, blogPostCount, unreadMessages };
}

export async function getViewsByDay(days: 7 | 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const e of events) {
    const key = e.createdAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function getMostViewed(type: "PROJECT_VIEW" | "BLOG_VIEW", limit = 5) {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: type === "PROJECT_VIEW" ? ["projectId"] : ["blogPostId"],
    where: { type },
    _count: true,
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });
  return grouped;
}
