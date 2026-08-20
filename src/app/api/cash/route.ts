import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sanitizeTxList = (txs: any[]) => {
  if (!txs) return [];

  const seenPackageKeys = new Set<string>();

  return txs
    .filter((tx: any) => {
      const desc = (tx.description || "").toLowerCase();
      const cat = (tx.category || "").toLowerCase();

      // Excluir lancamentos de sinal/deposito automatico de agendamentos passados
      const isSignal = desc.includes("sinal") || desc.includes("depósito") || desc.includes("deposito") || cat.includes("sinal");
      if (isSignal) return false;

      // Deduplicar vendas de pacote repetidas para a mesma cliente e pacote no mesmo caixa
      if (cat === "venda_pacote" || desc.includes("venda do pacote")) {
        const key = `${cat}_${desc.trim()}`;
        if (seenPackageKeys.has(key)) {
          return false; // Ignorar duplicadas extras
        }
        seenPackageKeys.add(key);
      }

      return true;
    })
    .map((tx: any) => ({
      ...tx,
      feeAmount: 0,
      netAmount: tx.amount || 0,
    }));
};

export async function GET() {
  try {
    const salon = await prisma.salon.findFirst().catch(() => null);
    const defaultOwnerName = salon?.ownerName || "Selma Gloor";

    const rawActive = await prisma.cashRegister.findFirst({
      where: { salonId: "default-salon", status: "ABERTO" },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const activeRegister = rawActive
      ? {
          ...rawActive,
          openedByName:
            rawActive.openedByUserId &&
            rawActive.openedByUserId !== "usr-admin" &&
            rawActive.openedByUserId !== "usr-admin-default"
              ? rawActive.openedByUserId
              : defaultOwnerName,
          transactions: sanitizeTxList(rawActive.transactions),
        }
      : null;

    const previousRegisters = await prisma.cashRegister.findMany({
      where: { salonId: "default-salon", status: "FECHADO" },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { openedAt: "desc" },
      take: 60,
    }).catch(() => []);

    const history = previousRegisters.map((reg) => ({
      ...reg,
      openedByName:
        reg.openedByUserId &&
        reg.openedByUserId !== "usr-admin" &&
        reg.openedByUserId !== "usr-admin-default"
          ? reg.openedByUserId
          : defaultOwnerName,
      closedByName:
        reg.closedByUserId &&
        reg.closedByUserId !== "usr-admin" &&
        reg.closedByUserId !== "usr-admin-default"
          ? reg.closedByUserId
          : defaultOwnerName,
      transactions: sanitizeTxList(reg.transactions),
    }));

    return NextResponse.json({
      activeRegister,
      history,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, initialAmount, openedByName, closedByName, category, amount, paymentMethod, description, finalAmount, notes } = body;

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
          openedByUserId: openedByName || "Selma Gloor",
          initialAmount: Number(initialAmount || 0),
          expectedAmount: Number(initialAmount || 0),
          status: "ABERTO",
          notes: notes || `Abertura por ${openedByName || "Selma Gloor"}`,
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

      const feeAmount = 0;
      const netAmount = numAmount;

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
          closedByUserId: closedByName || "Selma Gloor",
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
