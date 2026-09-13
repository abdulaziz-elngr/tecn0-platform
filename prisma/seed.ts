/**
 * Development seed script.
 *
 * Run with: npx prisma db seed
 *
 * Creates the first admin user (credentials from .env — change the password
 * immediately after first login) plus a small set of clearly-labeled demo
 * content so the CMS and public site aren't empty on first run. Delete the
 * demo Project/Skill/Certificate rows from /admin before going live, or run
 * `npx prisma db seed -- --admin-only` to skip demo content entirely.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@tecnoteam.dev";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME ?? "Abdulaziz El-Nagar";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: "Abdulaziz El-Nagar",
      professionalTitle: "IoT Engineer & Computer Science Student",
      heroHeadline: "Building smart solutions where IoT, software, and AI meet.",
      availability: "Open to opportunities",
    },
  });

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Tecno Team",
      brandName: "Tecno Team",
      // Seeds the real Tecno Team logo you provided so the site shows it
      // out of the box, even before Cloudinary is configured. It's a
      // normal DB value from here on — replace or remove it anytime from
      // Admin -> Settings -> Branding, no code changes needed.
      logoUrl: "/brand/tecno-logo.jpg",
    },
  });

  const skipDemo = process.argv.includes("--admin-only");
  if (!skipDemo) {
    const category = await prisma.skillCategory.upsert({
      where: { slug: "iot-embedded" },
      update: {},
      create: { name: "IoT / Embedded", slug: "iot-embedded", displayOrder: 1 },
    });

    await prisma.skill.createMany({
      data: [
        { name: "ESP32", categoryId: category.id, proficiency: 80 },
        { name: "Arduino", categoryId: category.id, proficiency: 85 },
      ],
      skipDuplicates: true,
    });

    await prisma.project.upsert({
      where: { slug: "smart-irrigation-system" },
      update: {},
      create: {
        title: "Smart Irrigation System",
        slug: "smart-irrigation-system",
        shortDescription:
          "An ESP32-based irrigation controller that waters crops based on live soil moisture data.",
        category: "IoT",
        technologies: ["ESP32", "C++", "MQTT", "React"],
        published: true,
        featured: true,
      },
    });
  }

  console.log(`Seed complete. Admin login: ${email} / (see .env for password)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
