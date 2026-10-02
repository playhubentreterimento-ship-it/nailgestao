const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplication() {
  console.log("=== EXECUTANDO CORREÇÃO DA DUPLICAÇÃO DE CRISTINA ===");

  const duplicateTxId = 'b501b3ba-6332-48bd-aa17-977dd7336178'; // Transação duplicada de R$ 40 às 09:58
  const registerId = '7f70060e-bb41-4842-bf56-307258024b6c';    // Caixa de 30/09

  // 1. Remover a transação duplicada do caixa
  const deletedTx = await prisma.cashTransaction.delete({
    where: { id: duplicateTxId },
  });
  console.log("✅ Transação duplicada removida com sucesso:", deletedTx.id, deletedTx.description, deletedTx.amount);

  // 2. Recalcular os lançamentos do caixa de ontem (30/09)
  const remainingTxs = await prisma.cashTransaction.findMany({
    where: { cashRegisterId: registerId },
  });

  const totalEntradas = remainingTxs
    .filter((t) => t.type === 'ENTRADA')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = remainingTxs
    .filter((t) => t.type === 'SAIDA')
    .reduce((acc, t) => acc + t.amount, 0);

  const register = await prisma.cashRegister.findUnique({
    where: { id: registerId },
  });

  const newExpectedAmount = (register.initialAmount || 0) + totalEntradas - totalSaidas;

  // 3. Atualizar os totais do caixa fechado
  const updatedRegister = await prisma.cashRegister.update({
    where: { id: registerId },
    data: {
      expectedAmount: newExpectedAmount,
      finalAmount: newExpectedAmount,
      difference: 0,
    },
  });

  console.log("✅ Caixa atualizado com sucesso:");
  console.log({
    id: updatedRegister.id,
    openedAt: updatedRegister.openedAt,
    closedAt: updatedRegister.closedAt,
    initialAmount: updatedRegister.initialAmount,
    totalEntradas,
    totalSaidas,
    newExpectedAmount: updatedRegister.expectedAmount,
    newFinalAmount: updatedRegister.finalAmount,
    difference: updatedRegister.difference,
    remainingTxCount: remainingTxs.length,
  });

  await prisma.$disconnect();
}

fixDuplication().catch((e) => {
  console.error("❌ Erro ao corrigir duplicação:", e);
  prisma.$disconnect();
});
