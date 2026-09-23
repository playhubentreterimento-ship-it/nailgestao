import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // "today", "week", "month", "all"
    const dateParam = searchParams.get("date");

    const todayStr = dateParam || new Date().toISOString().split("T")[0];

    // Intervalo da Semana (Segunda a Domingo)
    const [y, m, d] = todayStr.split("-").map(Number);
    const curr = new Date(y, m - 1, d);
    const dayOfWeek = curr.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayDate = new Date(curr);
    mondayDate.setDate(curr.getDate() + distanceToMonday);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);

    const mondayStr = mondayDate.toISOString().split("T")[0];
    const sundayStr = sundayDate.toISOString().split("T")[0];
    const monthStr = todayStr.substring(0, 7); // YYYY-MM

    const expenses = await prisma.expense.findMany({
      where: { salonId: "default-salon" },
      orderBy: { dueDate: "asc" },
    });

    const transactions = await prisma.cashTransaction.findMany({
      where: { salonId: "default-salon" },
      orderBy: { createdAt: "desc" },
    });

    const professionals = await prisma.professional.findMany({
      where: { salonId: "default-salon" },
    });

    const allAppointments = await prisma.appointment.findMany({
      where: {
        salonId: "default-salon",
        status: { notIn: ["CANCELADO"] },
      },
      include: {
        services: true,
      },
    });

    // Calcular estatísticas por profissional por período (Dia, Semana, Mês, Total)
    const commissionsByProf = professionals.map((p) => {
      const pApps = allAppointments.filter((a) => a.professionalId === p.id);

      const todayApps = pApps.filter((a) => a.date === todayStr);
      const weekApps = pApps.filter((a) => a.date >= mondayStr && a.date <= sundayStr);
      const monthApps = pApps.filter((a) => a.date.startsWith(monthStr));

      const rate = p.commissionRatePercent || 40;

      const calcStats = (appsList: any[]) => {
        const revenue = appsList.reduce((acc, a) => acc + (a.total || 0), 0);
        const commission = revenue * (rate / 100);
        const salonKeep = Math.max(0, revenue - commission);
        return {
          revenue,
          commission,
          salonKeep,
          count: appsList.length,
        };
      };

      return {
        id: p.id,
        name: p.name,
        color: p.color || "#E0A96D",
        rate,
        today: calcStats(todayApps),
        week: calcStats(weekApps),
        month: calcStats(monthApps),
        all: calcStats(pApps),
      };
    });

    // Filtrar agendamentos e despesas do período selecionado para o DRE
    let periodApps = allAppointments;
    let periodExpenses = expenses;
    let periodTransactions = transactions;

    if (period === "today") {
      periodApps = allAppointments.filter((a) => a.date === todayStr);
      periodExpenses = expenses.filter((e) => e.dueDate === todayStr);
    } else if (period === "week") {
      periodApps = allAppointments.filter((a) => a.date >= mondayStr && a.date <= sundayStr);
      periodExpenses = expenses.filter((e) => e.dueDate >= mondayStr && e.dueDate <= sundayStr);
    } else if (period === "month") {
      periodApps = allAppointments.filter((a) => a.date.startsWith(monthStr));
      periodExpenses = expenses.filter((e) => e.dueDate.startsWith(monthStr));
    }

    const totalInflow = periodApps.reduce((acc, a) => acc + (a.total || 0), 0);
    const totalCardFees = periodTransactions.reduce((acc, t) => acc + (t.feeAmount || 0), 0);
    const totalExpenses = periodExpenses
      .filter((e) => e.status === "PAGO")
      .reduce((acc, e) => acc + e.amount, 0);

    const totalCommissions = commissionsByProf.reduce((acc, p) => {
      const stats: any = (p as any)[period] || p.all;
      return acc + stats.commission;
    }, 0);

    const netProfit = totalInflow - totalCardFees - totalExpenses - totalCommissions;

    return NextResponse.json({
      summary: {
        inflow: totalInflow,
        cardFees: totalCardFees,
        expenses: totalExpenses,
        commissions: totalCommissions,
        profit: netProfit,
      },
      expenses,
      commissionsByProfessional: commissionsByProf,
      transactions,
      periodInfo: {
        selectedDate: todayStr,
        weekRange: `${mondayStr} a ${sundayStr}`,
        month: monthStr,
      },
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
