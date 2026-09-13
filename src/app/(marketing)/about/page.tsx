import { prisma } from "@/lib/prisma";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Tecno Team",
  description: "About Abdulaziz El-Nagar — IoT Engineer & Computer Science Student.",
};

export default async function AboutPage() {
  const [profile, timeline, skillCategories] = await Promise.all([
    prisma.profile.findFirst().catch(() => null),
    prisma.experience
      .findMany({ where: { published: true }, orderBy: { displayOrder: "asc" } })
      .catch(() => []),
    prisma.skillCategory
      .findMany({
        orderBy: { displayOrder: "asc" },
        include: { skills: { where: { published: true }, orderBy: { displayOrder: "asc" } } },
      })
      .catch(() => []),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm font-medium text-[var(--gold-deep)]">About</p>
      <div className="mt-2 flex items-center gap-4">
        {profile?.profileImage && (
          <Image
            src={profile.profileImage}
            alt={profile.fullName}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {profile?.fullName ?? "Abdulaziz El-Nagar"}
          </h1>
          <p className="mt-1 text-[var(--slate)]">
            {profile?.professionalTitle ?? "IoT Engineer & Computer Science Student"}
          </p>
        </div>
      </div>
      {profile?.shortIntro && (
        <p className="mt-6 text-lg text-[var(--slate)]">{profile.shortIntro}</p>
      )}

      {profile?.aboutText && (
        <p className="mt-8 whitespace-pre-wrap leading-relaxed text-[var(--ink)]">
          {profile.aboutText}
        </p>
      )}

      {(profile?.currentFocus || profile?.futureGoals) && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {profile?.currentFocus && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
              <p className="text-xs font-medium text-[var(--gold-deep)]">Current focus</p>
              <p className="mt-1 text-sm text-[var(--slate)]">{profile.currentFocus}</p>
            </div>
          )}
          {profile?.futureGoals && (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
              <p className="text-xs font-medium text-[var(--gold-deep)]">Future goals</p>
              <p className="mt-1 text-sm text-[var(--slate)]">{profile.futureGoals}</p>
            </div>
          )}
        </div>
      )}

      {timeline.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold">Journey</h2>
          <ol className="relative mt-6 flex flex-col gap-6 border-l border-[var(--border)] pl-6">
            {timeline.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--gold)]" />
                <p className="font-data text-xs text-[var(--gold-deep)]">{entry.year}</p>
                <p className="font-medium">
                  {entry.title}
                  {entry.organization && (
                    <span className="font-normal text-[var(--slate)]"> — {entry.organization}</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-[var(--slate)]">{entry.description}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {skillCategories.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold">Skills</h2>
          <div className="mt-6 flex flex-col gap-8">
            {skillCategories
              .filter((c) => c.skills.length > 0)
              .map((cat) => (
                <div key={cat.id}>
                  <p className="text-sm font-medium text-[var(--slate)]">{cat.name}</p>
                  <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {cat.skills.map((skill) => (
                      <div key={skill.id}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>{skill.name}</span>
                          <span className="text-[var(--slate)]">{skill.proficiency}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                          <div
                            className="h-full rounded-full bg-[var(--gold)]"
                            style={{ width: `${Math.min(100, Math.max(0, skill.proficiency))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}
