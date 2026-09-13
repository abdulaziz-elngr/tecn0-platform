import { AdminTopbar } from "@/components/admin/topbar";
import { ProjectForm } from "../project-form";

export const metadata = { title: "New Project — Tecno Team Admin" };

export default function NewProjectPage() {
  return (
    <>
      <AdminTopbar title="Add Project" breadcrumb="Projects" />
      <main className="flex-1 overflow-y-auto p-6">
        <ProjectForm mode="create" />
      </main>
    </>
  );
}
