require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const ceoEmail = (process.env.SEED_CEO_EMAIL || "ceo@muhammadanlaw.edu.pk").toLowerCase();
  const ceoPassword = process.env.SEED_CEO_PASSWORD || "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email: ceoEmail } });
  if (existing) {
    console.log("CEO account already exists, skipping seed.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "College Director",
      email: ceoEmail,
      password: await bcrypt.hash(ceoPassword, 10),
      role: "CEO",
    },
  });

  const dept = await prisma.department.create({ data: { name: "Bachelor of Laws (LLB)" } });
  await prisma.class.create({ data: { name: "LLB Semester 1 - Section A", departmentId: dept.id } });

  console.log("Seed complete.");
  console.log(`CEO login -> email: ${ceoEmail}  password: ${ceoPassword}`);
  console.log("Log in as CEO first, then create Registrar/Accountant accounts, who in turn create Teachers/Students.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
