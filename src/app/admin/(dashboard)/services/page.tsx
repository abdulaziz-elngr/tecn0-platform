import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { Card, EmptyState } from "@/components/ui/card";
import { ServicesManager } from "./services-manager";

export const metadata = { title: "Services — Tecno Team Admin" };

export default async function AdminServicesPage() {
  const services = await prisma.service
    .findMany({ orderBy: { displayOrder: "asc" } })
    .catch(() => []);

  return (
    <>
      <AdminTopbar title="Services" breadcrumb="Content" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="p-5">
          {services.length === 0 && (
            <EmptyState
              title="No services yet."
              description="Add the services you offer — they appear on the public Services section."
            />
          )}
          <ServicesManager services={services} />
        </Card>
      </main>
    </>
  );
}
