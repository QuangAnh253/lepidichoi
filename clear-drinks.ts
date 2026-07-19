import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all drinks...");
  await prisma.$executeRawUnsafe('DELETE FROM "drink_cafes" CASCADE;');
  await prisma.$executeRawUnsafe('DELETE FROM "drinks" CASCADE;');
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
