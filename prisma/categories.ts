import type { PrismaClient } from "@prisma/client";

export const categories = [
  { name: "Hair Salon", previousName: "Frizerski salon", icon: "scissors" },
  { name: "Beauty Salon", previousName: "Kozmetički salon", icon: "sparkles" },
  { name: "Wellness & Spa", previousName: "Wellness i spa", icon: "heart" },
  { name: "Fitness", previousName: "Fitness", icon: "dumbbell" },
  { name: "Medical Clinic", previousName: "Privatna ordinacija", icon: "stethoscope" },
  { name: "Photography", previousName: "Fotografija", icon: "camera" },
  { name: "Education", previousName: "Edukacija", icon: "book" },
  { name: "Other", previousName: "Ostalo", icon: "more" },
];

export async function seedCategories(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    for (const { name, previousName, icon } of categories) {
      const previous = await tx.category.findUnique({ where: { name: previousName } });
      const current = await tx.category.findUnique({ where: { name } });
      if (previous && current && previous.id !== current.id) {
        throw new Error(`Both category names exist: ${previousName} and ${name}. Resolve the duplicate before seeding.`);
      }
      const existing = previous ?? current;
      if (existing) {
        await tx.category.update({ where: { id: existing.id }, data: { name, icon } });
      } else {
        await tx.category.create({ data: { name, icon } });
      }
    }
  });
}
