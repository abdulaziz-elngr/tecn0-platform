import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, EmptyState } from "@/components/ui/card";
import { getViewsByDay } from "@/lib/services/analytics";

export const metadata = { title: "Analytics — Tecno Team Admin" };

export default async function AdminAnalyticsPage() {
  const [views7d, views30d, totalEvents, projectViews, blogViews] = await Promise.all([
    getViewsByDay(7).catch(() => []),
    getViewsByDay(30).catch(() => []),
    prisma.analyticsEvent.count().catch(() => 0),
    prisma.analyticsEvent.count({ where: { type: "PROJECT_VIEW" } }).catch(() => 0),
    prisma.analyticsEvent.count({ where: { type: "BLOG_VIEW" } }).catch(() => 0),
  ]);

  const topProjectsRaw = await prisma.analyticsEvent
    .groupBy({
      by: ["projectId"],
      where: { type: "PROJECT_VIEW", projectId: { not: null } },
      _count: true,
      orderBy: { _count: { projectId: "desc" } },
      take: 5,
    })
    .catch(() => []);
  const topProjects = await Promise.all(
    topProjectsRaw.map(async (row) => ({
      count: row._count,
      project: await prisma.project.findUnique({ where: { id: row.projectId! } }),
    }))
  );

  const topPostsRaw = await prisma.analyticsEvent
    .groupBy({
      by: ["blogPostId"],
      where: { type: "BLOG_VIEW", blogPostId: { not: null } },
      _count: true,
      orderBy: { _count: { blogPostId: "desc" } },
      take: 5,
    })
    .catch(() => []);
  const topPosts = await Promise.all(
    topPostsRaw.map(async (row) => ({
      count: row._count,
      post: await prisma.blogPost.findUnique({ where: { id: row.blogPostId! } }),
    }))
  );

  return (
    <>
      <AdminTopbar title="Analytics" breadcrumb="Insights" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="font-display text-2xl font-semibold">{totalEvents}</p>
            <p className="text-xs text-[var(--slate)]">Total tracked views</p>
          </Card>
          <Card className="p-4">
            <p className="font-display text-2xl font-semibold">{projectViews}</p>
            <p className="text-xs text-[var(--slate)]">Project views</p>
          </Card>
          <Card className="p-4">
            <p className="font-display text-2xl font-semibold">{blogViews}</p>
            <p className="text-xs text-[var(--slate)]">Blog views</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-sm font-semibold">Last 7 days</h2>
            {views7d.length === 0 ? (
              <EmptyState title="No events yet" description="Views will appear here as visitors browse the site." />
            ) : (
              <Bars data={views7d} />
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 font-display text-sm font-semibold">Last 30 days</h2>
            {views30d.length === 0 ? (
              <EmptyState title="No events yet" description="Views will appear here as visitors browse the site." />
            ) : (
              <Bars data={views30d} compact />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-sm font-semibold">Most viewed projects</h2>
            {topProjects.length === 0 ? (
              <p className="text-sm text-[var(--slate)]">No project views recorded yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {topProjects.map(
                  ({ project, count }) =>
                    project && (
                      <li key={project.id} className="flex justify-between">
                        <span>{project.title}</span>
                        <span className="text-[var(--slate)] font-data">{count}</span>
                      </li>
                    )
                )}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-sm font-semibold">Most viewed articles</h2>
            {topPosts.length === 0 ? (
              <p className="text-sm text-[var(--slate)]">No blog views recorded yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {topPosts.map(
                  ({ post, count }) =>
                    post && (
                      <li key={post.id} className="flex justify-between">
                        <span>{post.title}</span>
                        <span className="text-[var(--slate)] font-data">{count}</span>
                      </li>
                    )
                )}
              </ul>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}

function Bars({ data, compact }: { data: { date: string; count: number }[]; compact?: boolean }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-32 items-end gap-1">
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-[3px] bg-[var(--gold)]"
            style={{ height: `${Math.max(4, (d.count / max) * 100)}px` }}
            title={`${d.date}: ${d.count}`}
          />
          {!compact && (
            <span className="text-[9px] text-[var(--slate)] font-data">{d.date.slice(5)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
