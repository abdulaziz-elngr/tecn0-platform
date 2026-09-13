import { AdminTopbar } from "@/components/admin/topbar";
import { CertificateForm } from "../certificate-form";

export const metadata = { title: "New Certificate — Tecno Team Admin" };

export default function NewCertificatePage() {
  return (
    <>
      <AdminTopbar title="Add Certificate" breadcrumb="Certificates" />
      <main className="flex-1 overflow-y-auto p-6">
        <CertificateForm mode="create" />
      </main>
    </>
  );
}
