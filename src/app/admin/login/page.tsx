import { LoginForm } from "./login-form";
import { BrandLogo } from "@/components/ui/brand-logo";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";

export const metadata = { title: "Admin Login — Tecno Team" };

export default async function AdminLoginPage() {
  const settings = await getOrCreateSiteSettings().catch(() => null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-4 circuit-grid">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow-lift)]">
        <div className="mb-8 flex flex-col items-center gap-1 text-center">
          <BrandLogo logoUrl={settings?.logoUrl} textClassName="font-display text-lg font-semibold" imgClassName="h-10 w-auto object-contain" />
          <p className="text-sm text-[var(--slate)]">Sign in to the control center</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
