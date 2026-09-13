import { prisma } from "@/lib/prisma";
import { CircuitVisual } from "@/components/public/circuit-visual";
import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";

const FALLBACK = {
  fullName: "Abdulaziz El-Nagar",
  professionalTitle: "IoT Engineer & Computer Science Student",
  heroHeadline: "Building smart solutions where IoT, software, and AI meet.",
  availability: "Open to opportunities",
};

export default async function HomePage() {
  const profile = await prisma.profile.findFirst().catch(() => null);

  const name = profile?.fullName ?? FALLBACK.fullName;
  const title = profile?.professionalTitle ?? FALLBACK.professionalTitle;
  const headline = profile?.heroHeadline ?? FALLBACK.heroHeadline;
  const description = profile?.heroDescription;
  const availability = profile?.availability ?? FALLBACK.availability;
  const photo = profile?.profileImage;
  const cvUrl = profile?.cvUrl;

  return (
    <main>
      <section className="circuit-grid relative overflow-hidden px-6 py-28 sm:py-36">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--slate)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              {availability}
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-6xl">
              Hi, I&apos;m {name.split(" ")[0]}.
              <br />
              <span className="text-[var(--gold-deep)]">{title}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-[var(--slate)]">
              {description || headline}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex h-12 items-center rounded-[var(--radius-sm)] bg-[var(--gold)] px-6 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--gold-deep)]"
              >
                View my projects
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-6 text-sm font-medium transition-colors hover:border-[var(--gold)]"
              >
                Contact me
              </Link>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-6 text-sm font-medium transition-colors hover:border-[var(--gold)]"
                >
                  <Download className="h-4 w-4" /> Download CV
                </a>
              )}
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 opacity-70">
              <CircuitVisual />
            </div>
            {photo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={photo}
                  alt={name}
                  width={280}
                  height={280}
                  unoptimized
                  className="h-56 w-56 rounded-full border-4 border-[var(--panel)] object-cover shadow-[var(--shadow-lift)] sm:h-64 sm:w-64"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
