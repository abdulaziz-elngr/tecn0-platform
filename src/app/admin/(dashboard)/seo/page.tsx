import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";
import { SeoForm } from "./seo-form";

export const metadata = { title: "SEO — Tecno Team Admin" };

export default async function AdminSeoPage() {
  const settings = await getOrCreateSiteSettings();

  return (
    <>
      <AdminTopbar title="SEO" breadcrumb="Configuration" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-2xl p-6">
          <SeoForm
            initial={{
              metaTitle: settings.metaTitle ?? "",
              metaDescription: settings.metaDescription ?? "",
              metaKeywords: settings.metaKeywords,
              ogTitle: settings.ogTitle ?? "",
              ogDescription: settings.ogDescription ?? "",
              ogImage: settings.ogImage ?? "",
              twitterCard: settings.twitterCard ?? "summary_large_image",
              canonicalUrl: settings.canonicalUrl ?? "",
              robotsIndex: settings.robotsIndex,
            }}
          />
        </Card>
      </main>
    </>
  );
}
