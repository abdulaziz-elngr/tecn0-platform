import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { CustomCursor } from "@/components/public/custom-cursor";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const settings = await getOrCreateSiteSettings().catch(() => null);

  return (
    <>
      <CustomCursor />
      <Navbar logoUrl={settings?.logoUrl} />
      {children}
      <Footer />
    </>
  );
}
