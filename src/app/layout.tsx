import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";
import { prisma } from "@/lib/prisma";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const DEFAULT_TITLE = "Tecno Team — Abdulaziz El-Nagar";
const DEFAULT_DESCRIPTION =
  "IoT Engineer & Computer Science Student building smart solutions where IoT, software, and AI meet.";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// generateMetadata (not a static `metadata` export) so the favicon and OG
// image can come from the database once an admin uploads one in
// Admin -> Settings -> Branding, without ever hardcoding a logo path here.
// Falls back to the original static title/description/icon if the DB is
// unreachable (e.g. at build time with no DATABASE_URL) so this never
// blocks a build.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getOrCreateSiteSettings().catch(() => null);

  return {
    title: settings?.metaTitle || DEFAULT_TITLE,
    description: settings?.metaDescription || DEFAULT_DESCRIPTION,
    keywords: settings?.metaKeywords?.length ? settings.metaKeywords : undefined,
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    alternates: settings?.canonicalUrl ? { canonical: settings.canonicalUrl } : undefined,
    robots: settings ? { index: settings.robotsIndex, follow: settings.robotsIndex } : undefined,
    openGraph: settings?.ogImage
      ? {
          title: settings.ogTitle || settings.metaTitle || DEFAULT_TITLE,
          description: settings.ogDescription || settings.metaDescription || DEFAULT_DESCRIPTION,
          images: [settings.ogImage],
        }
      : undefined,
    twitter: settings?.ogImage
      ? {
          card: (settings.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
          title: settings.ogTitle || settings.metaTitle || DEFAULT_TITLE,
          description: settings.ogDescription || settings.metaDescription || DEFAULT_DESCRIPTION,
          images: [settings.ogImage],
        }
      : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, profile] = await Promise.all([
    getOrCreateSiteSettings().catch(() => null),
    prisma.profile.findFirst().catch(() => null),
  ]);

  // Phase 14: runtime brand colors. Re-validated here (server-side,
  // defense in depth on top of the Zod hex regex already enforced when an
  // admin saves Settings) before ever being interpolated into a <style>
  // tag — an unexpected value is dropped rather than injected as raw CSS.
  const primary = settings?.primaryColor && HEX_COLOR.test(settings.primaryColor) ? settings.primaryColor : null;
  const secondary =
    settings?.secondaryColor && HEX_COLOR.test(settings.secondaryColor) ? settings.secondaryColor : null;

  // Phase 15: Person + Organization + WebSite structured data. Built only
  // from what's actually configured in the CMS (Profile / SiteSetting) —
  // never fabricated credentials or fields nobody entered.
  const siteUrl = settings?.canonicalUrl || undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: profile?.fullName || DEFAULT_TITLE,
        jobTitle: profile?.professionalTitle || undefined,
        description: profile?.shortIntro || undefined,
        email: profile?.email || undefined,
        url: siteUrl,
        image: profile?.profileImage || undefined,
      },
      {
        "@type": "Organization",
        name: settings?.brandName || "Tecno Team",
        logo: settings?.logoUrl || undefined,
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        name: settings?.siteName || "Tecno Team",
        url: siteUrl,
      },
    ],
  };
  // Escape "<" so a value containing "</script>" can never break out of the
  // JSON-LD script tag it's embedded in.
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevents a light/dark flash on load: theme is read before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme', t);}catch(e){}})();`,
          }}
        />
        {(primary || secondary) && (
          <style
            // Rendered after globals.css in the document, so this :root
            // override wins the (tied-specificity) cascade in both light
            // and dark mode without touching --ink/--paper/--border.
            dangerouslySetInnerHTML={{
              __html: `:root{${primary ? `--gold:${primary};` : ""}${secondary ? `--brand-secondary:${secondary};` : ""}}`,
            }}
          />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
      >
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
