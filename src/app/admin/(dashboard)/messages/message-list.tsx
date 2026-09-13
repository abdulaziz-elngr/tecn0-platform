"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { setMessageStatus, deleteMessage } from "./actions";

interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: Date;
}

const STATUS_TONE = {
  UNREAD: "gold",
  READ: "default",
  REPLIED: "success",
  ARCHIVED: "default",
} as const;

export function MessageList({ messages }: { messages: MessageRow[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleExpand(msg: MessageRow) {
    const opening = expanded !== msg.id;
    setExpanded(opening ? msg.id : null);
    if (opening && msg.status === "UNREAD") {
      await setMessageStatus(msg.id, "READ");
      router.refresh();
    }
  }

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id} className="border-b border-[var(--border)] last:border-0">
          <button
            onClick={() => handleExpand(msg)}
            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Badge tone={STATUS_TONE[msg.status]}>{msg.status}</Badge>
              <span className="truncate font-medium">{msg.subject}</span>
              <span className="hidden shrink-0 text-xs text-[var(--slate)] sm:inline">
                {msg.name} · {msg.email}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-[var(--slate)] font-data">
                {msg.createdAt.toLocaleDateString()}
              </span>
              {expanded === msg.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>

          {expanded === msg.id && (
            <div className="px-4 pb-4">
              <p className="mb-4 whitespace-pre-wrap rounded-[var(--radius-sm)] bg-[var(--paper)] p-3 text-sm">
                {msg.message}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await setMessageStatus(msg.id, "REPLIED");
                    toast.success("Marked as replied.");
                    router.refresh();
                  }}
                >
                  Mark replied
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    await setMessageStatus(msg.id, "ARCHIVED");
                    toast.success("Archived.");
                    router.refresh();
                  }}
                >
                  Archive
                </Button>
                <a href={`mailto:${msg.email}`}>
                  <Button size="sm" variant="secondary">
                    Reply by email
                  </Button>
                </a>
                <ConfirmDialog
                  title="Delete this message?"
                  description="This can't be undone."
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    const res = await deleteMessage(msg.id);
                    if (res.success) {
                      toast.success("Message deleted.");
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
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
