import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const RULES_FILE = path.join(process.cwd(), "scratch", "loyalty_rules.json");

function getStoredRules(): any[] {
  try {
    if (!fs.existsSync(RULES_FILE)) {
      const defaultRules = [
        {
          id: "rule-1",
          title: "1 ponto a cada R$ 10,00 gastos",
          rewardDescription: "Ao atingir 50 pontos, a cliente ganha R$ 25,00 de desconto na manutenção.",
          targetPoints: 50,
          type: "VALOR_GASTO",
        },
        {
          id: "rule-2",
          title: "5 atendimentos consecutivos",
          rewardDescription: "Ganhe 1 SPA dos pés de cortesia ou 1 Nail Art Encapsulada gratuita.",
          targetPoints: 5,
          type: "ATENDIMENTOS",
        },
      ];
      saveRules(defaultRules);
      return defaultRules;
    }
    const content = fs.readFileSync(RULES_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

function saveRules(rules: any[]) {
  try {
    const dir = path.dirname(RULES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
  } catch (e) {
    console.error("Erro ao salvar loyalty_rules.json:", e);
  }
}

export async function GET() {
  try {
    const rules = getStoredRules();

    const clients = await prisma.client.findMany({
      where: { salonId: "default-salon" },
      select: { id: true, name: true, phone: true, whatsapp: true, totalSpent: true, attendanceCount: true },
      orderBy: { name: "asc" },
    });

    const pointsLogs = await prisma.loyaltyPoint.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Calcular saldo total de pontos de cada cliente
    const clientBalances = clients.map((cli) => {
      const logs = pointsLogs.filter((p) => p.clientId === cli.id);
      const totalPoints = logs.reduce((sum, item) => sum + item.points, 0);
      return {
        ...cli,
        totalPoints,
        history: logs,
      };
    });

    return NextResponse.json({ rules, clientBalances, clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Creditar/Abater Pontos de Cliente
    if (body.action === "ADD_POINTS") {
      const { clientId, points, reason } = body;
      if (!clientId || !points) {
        return NextResponse.json({ error: "Cliente e pontos são obrigatórios." }, { status: 400 });
      }

      const log = await prisma.loyaltyPoint.create({
        data: {
          clientId,
          points: Number(points),
          reason: reason || "Pontos do Programa de Fidelidade",
        },
      });

      return NextResponse.json(log);
    }

    // Criar Nova Regra de Fidelidade
    const { title, rewardDescription, targetPoints, type } = body;
    if (!title || !rewardDescription) {
      return NextResponse.json({ error: "Título e Recompensa são obrigatórios." }, { status: 400 });
    }

    const currentRules = getStoredRules();
    const newRule = {
      id: "rule-" + Date.now(),
      title,
      rewardDescription,
      targetPoints: Number(targetPoints || 50),
      type: type || "VALOR_GASTO",
    };

    currentRules.push(newRule);
    saveRules(currentRules);

    return NextResponse.json(newRule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, rewardDescription, targetPoints, type } = body;

    if (!id || !title) {
      return NextResponse.json({ error: "ID e título são obrigatórios." }, { status: 400 });
    }

    const currentRules = getStoredRules();
    const idx = currentRules.findIndex((r) => r.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Regra não encontrada." }, { status: 404 });
    }

    currentRules[idx] = {
      ...currentRules[idx],
      title,
      rewardDescription,
      targetPoints: Number(targetPoints || currentRules[idx].targetPoints),
      type: type || currentRules[idx].type,
    };

    saveRules(currentRules);

    return NextResponse.json(currentRules[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório para exclusão." }, { status: 400 });
    }

    const currentRules = getStoredRules();
    const filtered = currentRules.filter((r) => r.id !== id);
    saveRules(filtered);

    return NextResponse.json({ success: true, message: "Regra excluída com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
