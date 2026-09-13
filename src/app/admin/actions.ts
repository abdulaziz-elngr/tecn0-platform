"use server";

import { auth, signOut } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";

export async function logoutAction() {
  const session = await auth();
  if (session?.user?.id) {
    await logActivity({
      userId: session.user.id,
      action: "LOGOUT",
      entityType: "User",
      entityId: session.user.id,
    });
  }
  await signOut({ redirectTo: "/admin/login" });
}
