import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Password1", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@jlabs.com" },
    update: { password: hashedPassword },
    create: {
      email: "test@jlabs.com",
      password: hashedPassword,
    },
  });

  console.log("Seeded:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
