import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const where: any = { salonId: "default-salon" };
    if (date) {
      where.date = date;
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(blockedDates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, startDate, endDate, reason, professionalId = "ALL" } = body;

    const blockReason = reason?.trim() || "Feriado / Recesso do Salão";

    // Se for bloqueio por intervalo de datas
    if (startDate && endDate) {
      const datesToBlock: string[] = [];
      const curr = new Date(startDate + "T12:00:00Z");
      const end = new Date(endDate + "T12:00:00Z");

      while (curr <= end) {
        datesToBlock.push(curr.toISOString().split("T")[0]);
        curr.setDate(curr.getDate() + 1);
      }

      const createdList = [];
      for (const d of datesToBlock) {
        // Evitar duplicidades na mesma data para o mesmo perfil
        const existing = await prisma.blockedDate.findFirst({
          where: { salonId: "default-salon", date: d, professionalId },
        });

        if (!existing) {
          const created = await prisma.blockedDate.create({
            data: {
              salonId: "default-salon",
              date: d,
              reason: blockReason,
              professionalId,
            },
          });
          createdList.push(created);
        }
      }

      return NextResponse.json({ success: true, count: createdList.length, blocked: createdList });
    }

    // Bloqueio para uma data única
    if (!date) {
      return NextResponse.json({ error: "A data do bloqueio é obrigatória." }, { status: 400 });
    }

    const cleanDate = date.trim();
    const existing = await prisma.blockedDate.findFirst({
      where: { salonId: "default-salon", date: cleanDate, professionalId },
    });

    if (existing) {
      const updated = await prisma.blockedDate.update({
        where: { id: existing.id },
        data: { reason: blockReason },
      });
      return NextResponse.json(updated);
    }

    const newBlocked = await prisma.blockedDate.create({
      data: {
        salonId: "default-salon",
        date: cleanDate,
        reason: blockReason,
        professionalId,
      },
    });

    return NextResponse.json(newBlocked);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");

    if (id) {
      await prisma.blockedDate.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Bloqueio removido com sucesso." });
    }

    if (date) {
      await prisma.blockedDate.deleteMany({
        where: { salonId: "default-salon", date },
      });
      return NextResponse.json({ success: true, message: "Bloqueio(s) da data removido(s)." });
    }

    return NextResponse.json({ error: "ID ou Data é obrigatório para remoção." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
