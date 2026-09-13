import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile — Tecno Team Admin" };

export default async function AdminProfilePage() {
  const session = await auth();
  const profile = session?.user?.id
    ? await prisma.profile.findUnique({ where: { userId: session.user.id } }).catch(() => null)
    : null;

  return (
    <>
      <AdminTopbar title="Profile" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-2xl p-6">
          <ProfileForm
            initial={{
              fullName: profile?.fullName ?? "Abdulaziz El-Nagar",
              professionalTitle: profile?.professionalTitle ?? "IoT Engineer & Computer Science Student",
              heroHeadline:
                profile?.heroHeadline ?? "Building smart solutions where IoT, software, and AI meet.",
              heroDescription: profile?.heroDescription ?? "",
              aboutText: profile?.aboutText ?? "",
              shortIntro: profile?.shortIntro ?? "",
              profileImage: profile?.profileImage ?? "",
              profileImagePublicId: profile?.profileImagePublicId ?? "",
              cvUrl: profile?.cvUrl ?? "",
              cvPublicId: profile?.cvPublicId ?? "",
              email: profile?.email ?? "",
              phone: profile?.phone ?? "",
              location: profile?.location ?? "",
              availability: profile?.availability ?? "Open to opportunities",
              currentFocus: profile?.currentFocus ?? "",
              futureGoals: profile?.futureGoals ?? "",
            }}
          />
        </Card>
      </main>
    </>
  );
}
