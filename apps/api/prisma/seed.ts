import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const email =
    process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Tradie",
      email,
      passwordHash: "temporary-password-hash",
      businessName: "Demo Trade Services",
      abn: "12345678901",
    },
  });

  console.log("Demo user ready:");
  console.log({
    id: user.id,
    email: user.email,
    businessName: user.businessName,
  });
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
