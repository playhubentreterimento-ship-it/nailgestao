import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activeRegister = await prisma.cashRegister.findFirst({
      where: { salonId: "default-salon", status: "ABERTO" },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const previousRegisters = await prisma.cashRegister.findMany({
      where: { salonId: "default-salon", status: "FECHADO" },
      orderBy: { openedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      activeRegister,
      history: previousRegisters,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, initialAmount, category, amount, paymentMethod, description, finalAmount, notes } = body;

    // ABRIR CAIXA
    if (action === "OPEN") {
      const existing = await prisma.cashRegister.findFirst({
        where: { salonId: "default-salon", status: "ABERTO" },
      });
      if (existing) {
        return NextResponse.json({ error: "Já existe um caixa aberto para este salão." }, { status: 400 });
      }

      const newRegister = await prisma.cashRegister.create({
        data: {
          salonId: "default-salon",
          openedByUserId: "usr-admin",
          initialAmount: Number(initialAmount || 0),
          expectedAmount: Number(initialAmount || 0),
          status: "ABERTO",
          notes: notes || "Abertura de caixa",
        },
      });

      return NextResponse.json(newRegister);
    }

    // ADICIONAR MOVIMENTAÇÃO (SANGRIA / SUPRIMENTO / ENTRADA)
    if (action === "TRANSACTION") {
      let activeRegister = await prisma.cashRegister.findFirst({
        where: { salonId: "default-salon", status: "ABERTO" },
      });

      if (!activeRegister) {
        activeRegister = await prisma.cashRegister.create({
          data: {
            salonId: "default-salon",
            openedByUserId: "usr-admin",
            initialAmount: 0,
            expectedAmount: 0,
            status: "ABERTO",
            notes: "Caixa aberto automaticamente no checkout de atendimento",
          },
        });
      }

      const numAmount = Number(amount);
      const isOut = category === "SANGRIA" || category === "DESPESA";
      const type = isOut ? "SANGRIA" : "SUPRIMENTO";

      const salon = await prisma.salon.findFirst();
      let feeAmount = 0;
      if (paymentMethod === "CREDITO") feeAmount = numAmount * ((salon?.creditFeePercent || 2.99) / 100);
      if (paymentMethod === "DEBITO") feeAmount = numAmount * ((salon?.debitFeePercent || 1.49) / 100);

      const netAmount = numAmount - feeAmount;

      const tx = await prisma.cashTransaction.create({
        data: {
          cashRegisterId: activeRegister.id,
          salonId: "default-salon",
          type,
          category: category || "DIVERSOS",
          amount: numAmount,
          paymentMethod: paymentMethod || "DINHEIRO",
          feeAmount,
          netAmount,
          description: description || "Movimentação manual",
        },
      });

      // Atualizar expectedAmount do caixa
      const adjustment = isOut ? -numAmount : netAmount;
      await prisma.cashRegister.update({
        where: { id: activeRegister.id },
        data: {
          expectedAmount: { increment: adjustment },
        },
      });

      return NextResponse.json(tx);
    }

    // FECHAR CAIXA
    if (action === "CLOSE") {
      const activeRegister = await prisma.cashRegister.findFirst({
        where: { salonId: "default-salon", status: "ABERTO" },
      });

      if (!activeRegister) {
        return NextResponse.json({ error: "Nenhum caixa aberto para fechar." }, { status: 400 });
      }

      const reportedFinal = Number(finalAmount);
      const difference = reportedFinal - activeRegister.expectedAmount;

      const closed = await prisma.cashRegister.update({
        where: { id: activeRegister.id },
        data: {
          status: "FECHADO",
          closedByUserId: "usr-admin",
          closedAt: new Date(),
          finalAmount: reportedFinal,
          difference,
          notes,
        },
      });

      return NextResponse.json(closed);
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
