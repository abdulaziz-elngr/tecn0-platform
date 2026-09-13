import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GithubMark } from "@/components/ui/github-mark";
import { LinkedinMark, FacebookMark, InstagramMark } from "@/components/ui/brand-marks";
import { BrandLogo } from "@/components/ui/brand-logo";
import { getOrCreateSiteSettings } from "@/lib/services/site-settings";
import { Mail, MessageCircle, Link2 } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GITHUB: GithubMark,
  LINKEDIN: LinkedinMark,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  FACEBOOK: FacebookMark,
  INSTAGRAM: InstagramMark,
  OTHER: Link2,
};

export async function Footer() {
  const [links, settings] = await Promise.all([
    prisma.socialLink
      .findMany({ where: { enabled: true }, orderBy: { displayOrder: "asc" } })
      .catch(() => []),
    getOrCreateSiteSettings().catch(() => null),
  ]);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--panel)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BrandLogo logoUrl={settings?.logoUrl} imgClassName="h-8 w-auto object-contain" />
          
          <p className="mt-2 max-w-xs text-sm text-[var(--slate)]">
            IoT Engineer & Computer Science Student building smart solutions where IoT, software,
            and AI meet.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm text-[var(--slate)]">
          <Link href="/about" className="hover:text-[var(--ink)]">About</Link>
          <Link href="/projects" className="hover:text-[var(--ink)]">Projects</Link>
          <Link href="/blog" className="hover:text-[var(--ink)]">Blog</Link>
          <Link href="/contact" className="hover:text-[var(--ink)]">Contact</Link>
        </nav>

        {links.length > 0 && (
          <div className="flex gap-3">
            {links.map((link) => {
              const Icon = ICONS[link.platform] ?? Link2;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--slate)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--slate)]">
        © {new Date().getFullYear()} {settings?.brandName ?? "Tecno Team"}. Built by Abdulaziz El-Nagar.
      </div>
    </footer>
  );
}
