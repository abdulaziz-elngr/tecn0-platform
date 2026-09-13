import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageList } from "./message-list";

export const metadata = { title: "Messages — Tecno Team Admin" };

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const messages = await prisma.message
    .findMany({
      where: {
        AND: [
          status ? { status: status.toUpperCase() as never } : {},
          q
            ? {
                OR: [
                  { subject: { contains: q, mode: "insensitive" } },
                  { name: { contains: q, mode: "insensitive" } },
                  { email: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Messages" breadcrumb="Inbox" />
      <main className="flex-1 overflow-y-auto p-6">
        <form className="mb-6 flex flex-wrap gap-2" action="/admin/messages" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search messages…"
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-[var(--gold)]"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--panel)] px-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
          <Button type="submit" variant="secondary" size="sm">
            Filter
          </Button>
        </form>

        {messages.length === 0 ? (
          <EmptyState title="No messages found." description="Contact form submissions will show up here." />
        ) : (
          <Card>
            <MessageList messages={messages} />
          </Card>
        )}
      </main>
    </>
  );
}
