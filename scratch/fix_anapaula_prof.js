const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== INSPECCIONANDO E CORRIGINDO AGENDAMENTO DA ANA PAULA POSTINHO ===");
  
  const client = await prisma.client.findFirst({
    where: {
      name: { contains: 'Ana Paula', mode: 'insensitive' }
    }
  });

  if (!client) {
    console.log("Cliente Ana Paula não encontrada.");
    await prisma.$disconnect();
    return;
  }

  console.log("Cliente encontrada:", client.id, client.name);

  const apps = await prisma.appointment.findMany({
    where: { clientId: client.id },
    orderBy: { date: 'asc' }
  });

  console.log("Agendamentos da cliente:", apps);

  const selma = await prisma.professional.findFirst({
    where: { name: { contains: 'Selma', mode: 'insensitive' } }
  });

  if (selma && apps.length > 0) {
    for (const app of apps) {
      if (app.notes && app.notes.includes("📦 Pacote")) {
        await prisma.appointment.update({
          where: { id: app.id },
          data: { professionalId: selma.id }
        });
        console.log(`✅ Profissional do agendamento ${app.id} (${app.date} às ${app.startTime}) atualizado para ${selma.name} (${selma.id})`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
