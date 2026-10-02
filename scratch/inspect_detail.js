const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDetail() {
  console.log("=== DETALHAMENTO DE CRISTINA NO BANCO ===");
  const txs = await prisma.cashTransaction.findMany({
    where: {
      description: { contains: 'Cristina', mode: 'insensitive' }
    }
  });
  console.log("Transactions:", txs);

  const apps = await prisma.appointment.findMany({
    where: {
      date: '2026-09-30'
    },
    include: {
      services: true
    }
  });

  console.log("\n=== APPOINTMENTS EM 2026-09-30 ===");
  apps.forEach(a => {
    console.log({
      id: a.id,
      clientId: a.clientId,
      date: a.date,
      startTime: a.startTime,
      total: a.total,
      paymentStatus: a.paymentStatus,
      status: a.status,
      notes: a.notes
    });
  });

  await prisma.$disconnect();
}

inspectDetail();
