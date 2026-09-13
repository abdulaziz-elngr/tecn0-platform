import { AdminTopbar } from "@/components/admin/topbar";
import { Card } from "@/components/ui/card";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";
import { SettingsForm } from "./settings-form";
import { BrandingForm } from "./branding-form";

export const metadata = { title: "Settings — Tecno Team Admin" };

export default async function AdminSettingsPage() {
  const settings = await getOrCreateSiteSettings();

  return (
    <>
      <AdminTopbar title="Settings" breadcrumb="Configuration" />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <Card className="max-w-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Branding</h2>
          <p className="mb-5 text-sm text-[var(--slate)]">
            The Tecno Team logo shown in the navbar, footer, admin sidebar, and admin login.
            Uploading here replaces it everywhere those appear — no code changes needed.
          </p>
          <BrandingForm
            initial={{
              logoUrl: settings.logoUrl ?? "",
              logoPublicId: settings.logoPublicId ?? "",
              logoDarkUrl: settings.logoDarkUrl ?? "",
              logoDarkPublicId: settings.logoDarkPublicId ?? "",
              faviconUrl: settings.faviconUrl ?? "",
              faviconPublicId: settings.faviconPublicId ?? "",
            }}
          />
        </Card>

        <Card className="max-w-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">General</h2>
          <SettingsForm
            initial={{
              siteName: settings.siteName,
              brandName: settings.brandName,
              primaryColor: settings.primaryColor,
              secondaryColor: settings.secondaryColor,
              darkModeDefault: settings.darkModeDefault,
              maintenanceMode: settings.maintenanceMode,
              contactEmail: settings.contactEmail ?? "",
              availabilityStatus: settings.availabilityStatus ?? "",
            }}
          />
        </Card>
      </main>
    </>
  );
}
