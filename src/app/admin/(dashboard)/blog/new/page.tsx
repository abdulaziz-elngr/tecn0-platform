import { AdminTopbar } from "@/components/admin/topbar";
import { BlogPostForm } from "../blog-form";

export const metadata = { title: "New Article — Tecno Team Admin" };

export default function NewBlogPostPage() {
  return (
    <>
      <AdminTopbar title="Write Article" breadcrumb="Blog" />
      <main className="flex-1 overflow-y-auto p-6">
        <BlogPostForm mode="create" />
      </main>
    </>
  );
}
