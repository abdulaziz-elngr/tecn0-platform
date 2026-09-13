import { prisma } from "@/lib/prisma";

/** TecnoTeamProfile is a single-row table, same pattern as SiteSetting. */
export async function getOrCreateTecnoTeamProfile() {
  const existing = await prisma.tecnoTeamProfile.findFirst();
  if (existing) return existing;
  return prisma.tecnoTeamProfile.create({ data: {} });
}
