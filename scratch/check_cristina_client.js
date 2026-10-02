const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClient() {
  const clients = await prisma.client.findMany({
    where: {
      name: { contains: 'Cristina', mode: 'insensitive' }
    }
  });

  console.log("Clientes Cristina:", clients);
  await prisma.$disconnect();
}

checkClient();
