import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: { salonId: "default-salon" },
      orderBy: { dueDate: "asc" },
    });

    const commissions = await prisma.commission.findMany({
      where: { salonId: "default-salon" },
      orderBy: { date: "desc" },
    });

    const transactions = await prisma.cashTransaction.findMany({
      where: { salonId: "default-salon" },
      orderBy: { createdAt: "desc" },
    });

    const professionals = await prisma.professional.findMany({
      where: { salonId: "default-salon" },
    });

    const totalInflow = transactions
      .filter((t) => t.type === "ENTRADA" || t.type === "SUPRIMENTO")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalCardFees = transactions.reduce((acc, t) => acc + t.feeAmount, 0);

    const totalExpenses = expenses
      .filter((e) => e.status === "PAGO")
      .reduce((acc, e) => acc + e.amount, 0);

    const totalCommissions = commissions
      .filter((c) => c.status === "PENDENTE" || c.status === "PAGO")
      .reduce((acc, c) => acc + c.amount, 0);

    const netProfit = totalInflow - totalCardFees - totalExpenses - totalCommissions;

    const commissionsByProf = professionals.map((p) => {
      const profComms = commissions.filter((c) => c.professionalId === p.id);
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        rate: p.commissionRatePercent,
        totalAmount: profComms.reduce((acc, c) => acc + c.amount, 0),
        pendingAmount: profComms.filter((c) => c.status === "PENDENTE").reduce((acc, c) => acc + c.amount, 0),
        itemsCount: profComms.length,
      };
    });

    return NextResponse.json({
      summary: {
        inflow: totalInflow,
        cardFees: totalCardFees,
        expenses: totalExpenses,
        commissions: totalCommissions,
        profit: netProfit,
      },
      expenses,
      commissions,
      commissionsByProfessional: commissionsByProf,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (action === "reset_all") {
      await prisma.expense.deleteMany({ where: { salonId: "default-salon" } });
      await prisma.commission.deleteMany({ where: { salonId: "default-salon" } });
      await prisma.cashTransaction.deleteMany({ where: { salonId: "default-salon" } });
      return NextResponse.json({ success: true, message: "Todas as despesas e métricas financeiras foram zeradas com sucesso!" });
    }

    if (id) {
      await prisma.expense.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "ID ou ação é obrigatório." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, amount, dueDate, paymentMethod, isRecurring, notes } = body;

    if (!name || !amount || !dueDate) {
      return NextResponse.json({ error: "Nome, valor e data de vencimento são obrigatórios." }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        salonId: "default-salon",
        name,
        category: category || "OUTROS",
        amount: Number(amount),
        dueDate,
        paymentMethod: paymentMethod || "PIX",
        status: "PENDENTE",
        isRecurring: Boolean(isRecurring),
        notes,
      },
    });

    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, paidDate } = body;

    if (!id) return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status,
        paidDate: paidDate || new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
