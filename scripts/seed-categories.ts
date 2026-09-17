import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedCategories } from "../prisma/categories";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const before = await prisma.category.findMany({ select: { id: true, _count: { select: { businesses: true } } } });
  await seedCategories(prisma);
  const after = await prisma.category.findMany({
    select: { id: true, name: true, _count: { select: { businesses: true } } }, orderBy: { name: "asc" },
  });
  for (const category of before) {
    const updated = after.find((item) => item.id === category.id);
    if (!updated || updated._count.businesses !== category._count.businesses) {
      throw new Error("Category relationships changed unexpectedly.");
    }
  }
  console.log("Category names updated. Existing IDs and business relationships preserved.");
  console.table(after.map(({ name, _count }) => ({ name, businesses: _count.businesses })));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
