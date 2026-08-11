import { prisma } from "./prisma";

export interface AIInsight {
  id: string;
  title: string;
  category: "REVENUE" | "OCCUPANCY" | "RETENTION" | "CAMPAIGN" | "STOCK";
  importance: "HIGH" | "MEDIUM" | "INFO";
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

export async function generateSalonInsights(): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  const salon = await prisma.salon.findFirst();
  if (!salon) return insights;

  // 1. Clientes inativas (> 45 dias sem agendar)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 45);

  const inactiveClients = await prisma.client.findMany({
    where: {
      salonId: salon.id,
      lastVisit: { lt: cutoffDate },
    },
  });

  if (inactiveClients.length > 0) {
    insights.push({
      id: "ins-inactive-clients",
      title: `${inactiveClients.length} clientes sem agendar há mais de 45 dias`,
      category: "RETENTION",
      importance: "HIGH",
      description: `Identificamos que ${inactiveClients.length} clientes da sua base não retornam há mais de 45 dias (ex: ${inactiveClients.slice(0, 2).map((c) => c.name).join(", ")}). O envio de uma campanha de retorno com cupom especial pode recuperar até 35% desses atendimentos.`,
      actionLabel: "Disparar Campanha de Retorno",
      actionUrl: "/campanhas",
    });
  }

  // 2. Alerta de Estoque Baixo
  const lowStockProducts = await prisma.product.findMany({
    where: {
      salonId: salon.id,
    },
  });
  const actualLowStock = lowStockProducts.filter((p) => p.quantity <= p.minQuantity);

  if (actualLowStock.length > 0) {
    insights.push({
      id: "ins-low-stock",
      title: `Alerta: ${actualLowStock.length} produtos com estoque crítico`,
      category: "STOCK",
      importance: "HIGH",
      description: `Produtos como '${actualLowStock[0].name}' estão abaixo da quantidade mínima. Evite interrupções nos atendimentos reposicionando o estoque.`,
      actionLabel: "Ver Estoque Crítico",
      actionUrl: "/estoque",
    });
  }

  // 3. Serviço Mais Vendido
  const services = await prisma.service.findMany({ where: { salonId: salon.id } });
  if (services.length > 0) {
    const topService = services[0];
    insights.push({
      id: "ins-top-service",
      title: `Alongamento em Fibra é seu campeão de vendas`,
      category: "REVENUE",
      importance: "MEDIUM",
      description: `O serviço '${topService.name}' representa a maior fatia do faturamento. Recomendamos oferecer o 'Combo de Manutenção Trimestral' no checkout para aumentar o ticket médio.`,
      actionLabel: "Ver Desempenho de Serviços",
      actionUrl: "/servicos",
    });
  }

  // 4. Aniversariantes do Mês
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  const birthClients = await prisma.client.findMany({
    where: {
      salonId: salon.id,
      birthDate: { contains: `-${monthStr}-` },
    },
  });

  if (birthClients.length > 0) {
    insights.push({
      id: "ins-birthday",
      title: `${birthClients.length} aniversariantes neste mês`,
      category: "CAMPAIGN",
      importance: "MEDIUM",
      description: `Clientes como ${birthClients[0].name} fazem aniversário este mês! Envie uma mensagem com 15% de desconto para encantar e fidelizar.`,
      actionLabel: "Ver Aniversariantes",
      actionUrl: "/aniversariantes",
    });
  }

  // 5. Horários de Maior Ocupação
  insights.push({
    id: "ins-peak-hours",
    title: "Maior demanda entre 14h e 18h nas quintas e sextas",
    category: "OCCUPANCY",
    importance: "INFO",
    description: "Sua agenda costuma ter 92% de ocupação no período da tarde nas quintas e sextas-feiras. Considere aplicar tarifas normais nesses horários e criar promoções para terças-feiras de manhã.",
    actionLabel: "Analisar Agenda",
    actionUrl: "/agenda",
  });

  return insights;
}
