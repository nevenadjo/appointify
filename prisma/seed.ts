import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { categories, seedCategories } from "./categories";
import { seedDemoBusinesses } from "./demo-businesses";
import { seedDemoEngagement } from "./demo-engagement";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const cities = [
    "Ada",
    "Aleksandrovac",
    "Aleksinac",
    "Alibunar",
    "Aranđelovac",
    "Arilje",
    "Babušnica",
    "Bajina Bašta",
    "Bač",
    "Bačka Palanka",
    "Bačka Topola",
    "Bački Petrovac",
    "Bela Crkva",
    "Bela Palanka",
    "Beočin",
    "Beograd",
    "Blace",
    "Bogatić",
    "Bojnik",
    "Boljevac",
    "Bor",
    "Bosilegrad",
    "Brus",
    "Bujanovac",
    "Valjevo",
    "Varvarin",
    "Velika Plana",
    "Veliko Gradište",
    "Vladimirci",
    "Vladičin Han",
    "Vlasotince",
    "Vranje",
    "Vrbas",
    "Vrnjačka Banja",
    "Vršac",
    "Zaječar",
    "Zrenjanin",
    "Žabalj",
    "Žabari",
    "Žagubica",
    "Žitište",
    "Ivanjica",
    "Inđija",
    "Irig",
    "Jagodina",
    "Kanjiža",
    "Kikinda",
    "Kladovo",
    "Knić",
    "Knjaževac",
    "Koceljeva",
    "Kosjerić",
    "Kovačica",
    "Kovin",
    "Kragujevac",
    "Kraljevo",
    "Krupanj",
    "Kruševac",
    "Kučevo",
    "Kuršumlija",
    "Lajkovac",
    "Lapovo",
    "Lebane",
    "Leskovac",
    "Loznica",
    "Lučani",
    "Ljig",
    "Ljubovija",
    "Majdanpek",
    "Mali Iđoš",
    "Mali Zvornik",
    "Malo Crniće",
    "Medveđa",
    "Merošina",
    "Mionica",
    "Negotin",
    "Niš",
    "Nova Varoš",
    "Novi Bečej",
    "Novi Kneževac",
    "Novi Pazar",
    "Novi Sad",
    "Obrenovac",
    "Odžaci",
    "Opovo",
    "Osečina",
    "Pančevo",
    "Paraćin",
    "Petrovac na Mlavi",
    "Pećinci",
    "Pirot",
    "Plandište",
    "Požarevac",
    "Požega",
    "Preševo",
    "Priboj",
    "Prijepolje",
    "Prokuplje",
    "Rača",
    "Raška",
    "Rekovac",
    "Ruma",
    "Senta",
    "Sečanj",
    "Sjenica",
    "Smederevo",
    "Smederevska Palanka",
    "Sokobanja",
    "Sombor",
    "Srbobran",
    "Sremska Mitrovica",
    "Sremski Karlovci",
    "Stara Pazova",
    "Subotica",
    "Surdulica",
    "Svilajnac",
    "Svrljig",
    "Šabac",
    "Šid",
    "Temerin",
    "Titel",
    "Topola",
    "Trstenik",
    "Tutin",
    "Ub",
    "Užice",
    "Vranjska Banja",
    "Zubin Potok",
    "Zvečan",
  ];

  await seedCategories(prisma);

  for (const name of cities) {
    await prisma.city.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
  }

  const demoBusinessCount = await seedDemoBusinesses(prisma);
  const demo = await seedDemoEngagement(prisma);

  console.log("Seed completed successfully!");
  console.log("Categories:", categories.length);
  console.log("Cities:", cities.length);
  console.log("Demo businesses:", demoBusinessCount);
  console.log("Demo clients:", demo.clients);
  console.log("Demo reservations:", demo.reservations);
  console.log("Demo reviews:", demo.reviews);
  console.log("Demo favorites:", demo.favorites);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });