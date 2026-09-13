import { prisma } from "@/lib/prisma";
import { AdminTopbar } from "@/components/admin/topbar";
import { CertificateForm } from "../../certificate-form";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Certificate — Tecno Team Admin" };

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({ where: { id } });
  if (!certificate) notFound();

  return (
    <>
      <AdminTopbar title={`Edit — ${certificate.title}`} breadcrumb="Certificates" />
      <main className="flex-1 overflow-y-auto p-6">
        <CertificateForm
          mode="edit"
          certificateId={certificate.id}
          initial={{
            ...certificate,
            credentialId: certificate.credentialId ?? "",
            credentialUrl: certificate.credentialUrl ?? "",
            image: certificate.image ?? "",
            description: certificate.description ?? "",
          }}
        />
      </main>
    </>
  );
}
