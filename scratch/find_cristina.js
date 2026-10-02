const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== BUSCANDO TRANSAÇÕES DE CRISTINA E RECENTES CAIXAS ===");
  
  const txs = await prisma.cashTransaction.findMany({
    where: {
      description: {
        contains: 'Cristina',
        mode: 'insensitive',
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      cashRegister: true,
    }
  });

  console.log("Transações da Cristina encontradas:", txs.length);
  txs.forEach((t) => {
    console.log({
      id: t.id,
      cashRegisterId: t.cashRegisterId,
      type: t.type,
      category: t.category,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      description: t.description,
      createdAt: t.createdAt,
      registerStatus: t.cashRegister?.status,
      registerOpenedAt: t.cashRegister?.openedAt,
      registerClosedAt: t.cashRegister?.closedAt,
    });
  });

  console.log("\n=== BUSCANDO ÚLTIMOS CAIXAS ===");
  const registers = await prisma.cashRegister.findMany({
    take: 5,
    orderBy: { openedAt: 'desc' },
    include: {
      transactions: true,
    }
  });

  registers.forEach((r) => {
    console.log({
      id: r.id,
      openedAt: r.openedAt,
      closedAt: r.closedAt,
      status: r.status,
      initialAmount: r.initialAmount,
      expectedAmount: r.expectedAmount,
      finalAmount: r.finalAmount,
      difference: r.difference,
      txCount: r.transactions.length,
      txs: r.transactions.map((tx) => ({
        id: tx.id,
        desc: tx.description,
        amount: tx.amount,
        createdAt: tx.createdAt,
        paymentMethod: tx.paymentMethod,
      })),
    });
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
