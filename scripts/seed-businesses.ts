import { prisma } from "../lib/prisma";
import { seedDemoBusinesses } from "../prisma/demo-businesses";

async function main() {
  const count = await seedDemoBusinesses(prisma);
  const saved = await prisma.business.findMany({
    where: { id: { startsWith: "seed-home-business-" } },
    select: { id: true, isActive: true, isSuspended: true, _count: { select: { services: true, workingHours: true } } },
  });
  console.log(`Demo businesses seeded: ${count}; saved: ${saved.length}`);
  console.log(`With services and working hours: ${saved.filter((business) => business._count.services > 0 && business._count.workingHours === 7).length}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
