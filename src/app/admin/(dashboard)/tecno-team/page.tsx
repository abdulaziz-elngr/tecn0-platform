import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { getOrCreateTecnoTeamProfile } from "@/lib/services/tecno-team";
import { TecnoTeamProfileForm } from "./tecno-team-profile-form";
import { TeamMemberManager } from "./team-member-manager";

export const metadata = { title: "Tecno Team — Tecno Team Admin" };

export default async function AdminTecnoTeamPage() {
  const [profile, members] = await Promise.all([
    getOrCreateTecnoTeamProfile(),
    prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } }).catch(() => []),
  ]);

  return (
    <>
      <AdminTopbar title="Tecno Team" breadcrumb="Brand" />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <Card className="max-w-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Team profile</h2>
          <p className="mb-5 text-sm text-[var(--slate)]">
            Shown on the public Tecno Team page, alongside the logo from Admin → Settings → Branding.
          </p>
          <TecnoTeamProfileForm
            initial={{
              description: profile.description ?? "",
              mission: profile.mission ?? "",
              vision: profile.vision ?? "",
              contactEmail: profile.contactEmail ?? "",
            }}
          />
        </Card>

        <Card className="max-w-3xl p-6">
          <h2 className="mb-1 font-display text-lg font-semibold">Team members</h2>
          <p className="mb-5 text-sm text-[var(--slate)]">
            Projects, services, and social links tagged &quot;Tecno Team&quot; or &quot;Both&quot; also
            appear on this page automatically — no need to duplicate them here.
          </p>
          <TeamMemberManager members={members} />
        </Card>
      </main>
    </>
  );
}
