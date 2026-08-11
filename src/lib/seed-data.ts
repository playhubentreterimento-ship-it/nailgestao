import { prisma } from "./prisma";

export async function seedDatabase() {
  console.log("🌱 Iniciando inserção dos dados de demonstração ultra-realistas...");

  // 1. Limpar dados existentes
  await clearDatabase();

  // 2. Criar Salão Principal
  const salon = await prisma.salon.create({
    data: {
      id: "default-salon",
      name: "Studio Luxe Nail Designer",
      slogan: "Especialistas em Alongamento & Estética de Alta Performance",
      logoUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&auto=format&fit=crop&q=80",
      phone: "(11) 98765-4321",
      whatsapp: "5511987654321",
      instagram: "@studioluxenails",
      email: "contato@studioluxe.com.br",
      cnpj: "12.345.678/0001-90",
      address: "Av. Paulista, 1000 - Sala 402, Bela Vista, São Paulo - SP",
      primaryColor: "#E0A96D",
      secondaryColor: "#2B1B2F",
      buttonColor: "#C58B58",
      themeMode: "light",
      slotIntervalMinutes: 30,
      defaultDurationMinutes: 90,
      minAdvanceHours: 2,
      cancelWindowHours: 24,
      requireDeposit: true,
      defaultDepositAmount: 50.0,
      creditFeePercent: 2.99,
      debitFeePercent: 1.49,
    },
  });

  // 3. Usuários do Sistema (RBAC)
  await prisma.user.createMany({
    data: [
      {
        id: "usr-admin",
        salonId: salon.id,
        name: "Juliana Silva (Proprietária)",
        email: "juliana@studioluxe.com.br",
        passwordHash: "$2a$12$e.vS2d5wGgZ6yJ4F0o7uMe1d5X8/z1K6vW9q8y3t1u5o9q8y3t1u5", // mock hash
        role: "ADMINISTRADOR",
        phone: "(11) 98765-4321",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "usr-gerente",
        salonId: salon.id,
        name: "Mariana Alvez (Gerente)",
        email: "mariana@studioluxe.com.br",
        passwordHash: "$2a$12$e.vS2d5wGgZ6yJ4F0o7uMe1d5X8/z1K6vW9q8y3t1u5o9q8y3t1u5",
        role: "GERENTE",
        phone: "(11) 97777-6666",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "usr-prof1",
        salonId: salon.id,
        name: "Camila Santos (Master Nail)",
        email: "camila@studioluxe.com.br",
        passwordHash: "$2a$12$e.vS2d5wGgZ6yJ4F0o7uMe1d5X8/z1K6vW9q8y3t1u5o9q8y3t1u5",
        role: "PROFISSIONAL",
        phone: "(11) 96666-5555",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "usr-prof2",
        salonId: salon.id,
        name: "Amanda Costa (Especialista Gel)",
        email: "amanda@studioluxe.com.br",
        passwordHash: "$2a$12$e.vS2d5wGgZ6yJ4F0o7uMe1d5X8/z1K6vW9q8y3t1u5o9q8y3t1u5",
        role: "PROFISSIONAL",
        phone: "(11) 95555-4444",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      },
    ],
  });

  // 4. Profissionais da Equipe
  const prof1 = await prisma.professional.create({
    data: {
      id: "prof-1",
      salonId: salon.id,
      userId: "usr-admin",
      name: "Juliana Silva",
      phone: "(11) 98765-4321",
      email: "juliana@studioluxe.com.br",
      bio: "Master em Fibra de Vidro e Banho de Gel com 8 anos de experiência.",
      color: "#E0A96D",
      commissionRatePercent: 50.0,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const prof2 = await prisma.professional.create({
    data: {
      id: "prof-2",
      salonId: salon.id,
      userId: "usr-prof1",
      name: "Camila Santos",
      phone: "(11) 96666-5555",
      email: "camila@studioluxe.com.br",
      bio: "Especialista em Nail Art 3D, Encapsuladas e Formatos Europeus.",
      color: "#9B51E0",
      commissionRatePercent: 45.0,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const prof3 = await prisma.professional.create({
    data: {
      id: "prof-3",
      salonId: salon.id,
      userId: "usr-prof2",
      name: "Amanda Costa",
      phone: "(11) 95555-4444",
      email: "amanda@studioluxe.com.br",
      bio: "Especialista em Manutenção de Gel, Esmaltação em Gel e SPA dos Pés.",
      color: "#27AE60",
      commissionRatePercent: 40.0,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 5. Categorias de Serviços
  const catAlong = await prisma.serviceCategory.create({
    data: { salonId: salon.id, name: "Alongamentos & Moldados", description: "Fibra de Vidro, Gel Moldado e Acrigel", order: 1 },
  });
  const catManut = await prisma.serviceCategory.create({
    data: { salonId: salon.id, name: "Manutenções", description: "Reestruturação e nivelamento de unhas", order: 2 },
  });
  const catNailArt = await prisma.serviceCategory.create({
    data: { salonId: salon.id, name: "Nail Art & Decorações", description: "Encapsuladas, Francesas Reversa, Glitter e Pedrarias", order: 3 },
  });
  const catTradicional = await prisma.serviceCategory.create({
    data: { salonId: salon.id, name: "Manicure & Pedicure SPA", description: "Cuidados tradicionais e tratamento de cutículas", order: 4 },
  });

  // 6. Serviços
  const srv1 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catAlong.id,
      name: "Alongamento em Fibra de Vidro Premium",
      description: "Aplicação completa de fibra de vidro ultra fina com acabamento natural, curvatura C e esmaltação gel.",
      durationMinutes: 150,
      price: 220.0,
      promoPrice: 199.0,
      commissionPercent: 45.0,
      photoUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&auto=format&fit=crop&q=80",
    },
  });

  const srv2 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catAlong.id,
      name: "Alongamento em Gel Moldado",
      description: "Gel construtor moldado sobre a unha natural com estrutura reforçada e brilho intenso.",
      durationMinutes: 135,
      price: 190.0,
      commissionPercent: 45.0,
      photoUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=300&auto=format&fit=crop&q=80",
    },
  });

  const srv3 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catManut.id,
      name: "Manutenção de Fibra / Gel (até 25 dias)",
      description: "Remoção do crescimento, nivelamento, reposição de estrutura e esmaltação.",
      durationMinutes: 90,
      price: 130.0,
      commissionPercent: 40.0,
    },
  });

  const srv4 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catManut.id,
      name: "Banho de Gel (Blindagem Natural)",
      description: "Camada protetora de gel sobre a unha natural para evitar quebras e descamação.",
      durationMinutes: 75,
      price: 110.0,
      commissionPercent: 40.0,
    },
  });

  const srv5 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catNailArt.id,
      name: "Nail Art Encapsulada (por unha)",
      description: "Decoração sob camada de gel transparente (glitter, folhas de ouro, flores secas).",
      durationMinutes: 30,
      price: 25.0,
      commissionPercent: 50.0,
    },
  });

  const srv6 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catNailArt.id,
      name: "Francesa Reversa de Luxo (Par)",
      description: "Leito reconstruído com ponta decorada ou branca impecável.",
      durationMinutes: 45,
      price: 60.0,
      commissionPercent: 50.0,
    },
  });

  const srv7 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catTradicional.id,
      name: "Esmaltação em Gel de Longa Duração",
      description: "Secagem em cabine LED com durabilidade garantida de até 21 dias.",
      durationMinutes: 60,
      price: 85.0,
      commissionPercent: 40.0,
    },
  });

  const srv8 = await prisma.service.create({
    data: {
      salonId: salon.id,
      categoryId: catTradicional.id,
      name: "SPA dos Pés Completo com Plástica dos Pés",
      description: "Esfoliação profunda, hidratação parafínica, remoção de calosidades e cutilagem.",
      durationMinutes: 75,
      price: 140.0,
      commissionPercent: 40.0,
    },
  });

  // 7. Clientes com Histórico de Unhas
  const clientsData = [
    {
      id: "cli-1",
      name: "Maria Fernanda Rossi",
      phone: "(11) 99111-2233",
      whatsapp: "5511991112233",
      email: "maria.rossi@gmail.com",
      birthDate: "1994-08-15", // Aniversariante do mês
      instagram: "@mf_rossi",
      address: "Al. Santos, 450 - SP",
      tag: "VIP",
      referralSource: "Instagram",
      totalSpent: 1450.0,
      attendanceCount: 9,
      nailForm: "Amendoado",
      nailColor: "Esmalte Gel Nude Rendado D&Z",
      nailMaterial: "Fibra de Vidro",
      nailSize: "Médio (2.5)",
      extensionType: "Fibra de Vidro Silk",
      nailDecoration: "Francesa Reversa com Folha de Ouro",
      notes: "Alergia a acetona pura. Usar apenas removedor sem acetona.",
    },
    {
      id: "cli-2",
      name: "Beatriz Cavalcante",
      phone: "(11) 99222-3344",
      whatsapp: "5511992223344",
      email: "biacavalcante@outlook.com",
      birthDate: "1991-03-22",
      instagram: "@bia_cavalcante",
      address: "R. Augusta, 1200 - SP",
      tag: "FREQUENTE",
      totalSpent: 890.0,
      attendanceCount: 6,
      nailForm: "Quadrado Suave",
      nailColor: "Vermelho OPI Gel",
      nailMaterial: "Gel Moldado",
      nailSize: "Curto (1)",
      extensionType: "Gel em Molde Fixo",
      nailDecoration: "Sem decoração (Clássico)",
      notes: "Gosta de cutícula bem fundinha.",
    },
    {
      id: "cli-3",
      name: "Carla Mendes",
      phone: "(11) 99333-4455",
      whatsapp: "5511993334455",
      email: "carla.mendes@uol.com.br",
      birthDate: "1988-11-05",
      instagram: "@carlamendes_art",
      address: "R. Oscar Freire, 890 - SP",
      tag: "VIP",
      totalSpent: 2100.0,
      attendanceCount: 14,
      nailForm: "Stiletto",
      nailColor: "Preto Abissal Gel",
      nailMaterial: "Fibra de Vidro",
      nailSize: "Longo (4)",
      extensionType: "Fibra de Vidro Trama Fina",
      nailDecoration: "Encapsulada Glitter Holográfico + Pedrarias Swarovski",
      notes: "Sempre agenda com Camila Santos para Nail Art complexa.",
    },
    {
      id: "cli-4",
      name: "Fernanda Lima Silva",
      phone: "(11) 99444-5566",
      whatsapp: "5511994445566",
      email: "nanda.lima@hotmai.com",
      birthDate: "1997-08-11", // Aniversariante HOJE!
      instagram: "@nandalima",
      address: "Av. Faria Lima, 3000 - SP",
      tag: "NOVO",
      totalSpent: 220.0,
      attendanceCount: 1,
      nailForm: "Bailarina",
      nailColor: "Rosa Quartz Esmalte Gel",
      nailMaterial: "Gel Moldado",
      nailSize: "Médio (2)",
      extensionType: "Gel Moldado",
      nailDecoration: "Baby Boomer com Putter Glitter",
      notes: "Primeiro atendimento no salão.",
    },
    {
      id: "cli-5",
      name: "Juliana Paes de Barros",
      phone: "(11) 99555-6677",
      whatsapp: "5511995556677",
      email: "jupaes.barros@gmail.com",
      birthDate: "1985-05-18",
      instagram: "@jupaesbarros",
      address: "R. Haddock Lobo, 500 - SP",
      tag: "INATIVO",
      totalSpent: 450.0,
      attendanceCount: 3,
      nailForm: "Amendoado",
      nailColor: "Vinho Marsala",
      nailMaterial: "Banho de Gel",
      nailSize: "Natural",
      extensionType: "Blindagem",
      nailDecoration: "Nenhum",
      notes: "Não retorna há mais de 50 dias. Enviar campanha de retorno!",
    },
  ];

  for (const c of clientsData) {
    await prisma.client.create({
      data: {
        id: c.id,
        salonId: salon.id,
        name: c.name,
        phone: c.phone,
        whatsapp: c.whatsapp,
        email: c.email,
        birthDate: c.birthDate,
        instagram: c.instagram,
        address: c.address,
        tag: c.tag,
        referralSource: c.referralSource,
        totalSpent: c.totalSpent,
        attendanceCount: c.attendanceCount,
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nailForm: c.nailForm,
        nailColor: c.nailColor,
        nailMaterial: c.nailMaterial,
        nailSize: c.nailSize,
        extensionType: c.extensionType,
        nailDecoration: c.nailDecoration,
        notes: c.notes,
        photos: {
          create: [
            {
              photoUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80",
              type: "RESULTADO",
              description: "Resultado da manutenção em fibra com acabamento nacre.",
            },
          ],
        },
      },
    });
  }

  // 8. Agendamentos
  const todayStr = new Date().toISOString().split("T")[0];

  const app1 = await prisma.appointment.create({
    data: {
      id: "app-1",
      salonId: salon.id,
      clientId: "cli-1",
      professionalId: prof1.id,
      date: todayStr,
      startTime: "10:00",
      endTime: "12:30",
      totalDurationMinutes: 150,
      subtotal: 220.0,
      discount: 20.0,
      depositPaid: 50.0,
      remainingAmount: 150.0,
      total: 200.0,
      paymentStatus: "SINAL_PAGO",
      status: "CONFIRMADO",
      notes: "Cliente confirmou via WhatsApp.",
      confirmedAt: new Date(),
      services: {
        create: [
          { serviceId: srv1.id, serviceName: srv1.name, price: 220.0, durationMinutes: 150 },
        ],
      },
    },
  });

  const app2 = await prisma.appointment.create({
    data: {
      id: "app-2",
      salonId: salon.id,
      clientId: "cli-2",
      professionalId: prof2.id,
      date: todayStr,
      startTime: "14:00",
      endTime: "15:30",
      totalDurationMinutes: 90,
      subtotal: 130.0,
      discount: 0.0,
      depositPaid: 0.0,
      remainingAmount: 130.0,
      total: 130.0,
      paymentStatus: "PENDENTE",
      status: "EM_ATENDIMENTO",
      notes: "Atendimento iniciado às 14:02.",
      services: {
        create: [
          { serviceId: srv3.id, serviceName: srv3.name, price: 130.0, durationMinutes: 90 },
        ],
      },
    },
  });

  const app3 = await prisma.appointment.create({
    data: {
      id: "app-3",
      salonId: salon.id,
      clientId: "cli-4",
      professionalId: prof3.id,
      date: todayStr,
      startTime: "16:00",
      endTime: "17:15",
      totalDurationMinutes: 75,
      subtotal: 110.0,
      discount: 10.0,
      depositPaid: 50.0,
      remainingAmount: 50.0,
      total: 100.0,
      paymentStatus: "SINAL_PAGO",
      status: "AGUARDANDO_CONFIRMACAO",
      services: {
        create: [
          { serviceId: srv4.id, serviceName: srv4.name, price: 110.0, durationMinutes: 75 },
        ],
      },
    },
  });

  // 9. Caixa do Dia
  const cashRegister = await prisma.cashRegister.create({
    data: {
      id: "cash-today",
      salonId: salon.id,
      openedByUserId: "usr-admin",
      openedAt: new Date(new Date().setHours(8, 0, 0, 0)),
      initialAmount: 200.0,
      expectedAmount: 550.0,
      status: "ABERTO",
      notes: "Caixa aberto com troco de R$ 200 em espécie.",
      transactions: {
        create: [
          {
            salonId: salon.id,
            type: "ENTRADA",
            category: "ATENDIMENTO",
            amount: 50.0,
            paymentMethod: "PIX",
            feeAmount: 0.0,
            netAmount: 50.0,
            description: "Sinal de Agendamento - Maria Fernanda Rossi",
          },
          {
            salonId: salon.id,
            type: "ENTRADA",
            category: "ATENDIMENTO",
            amount: 300.0,
            paymentMethod: "CREDITO",
            feeAmount: 8.97, // 2.99% de taxa
            netAmount: 291.03,
            description: "Pagamento de Pacote de Manutenção - Carla Mendes",
          },
          {
            salonId: salon.id,
            type: "SANGRIA",
            category: "DESPESA",
            amount: 40.0,
            paymentMethod: "DINHEIRO",
            feeAmount: 0.0,
            netAmount: 40.0,
            description: "Compra urgente de lixas 100/180 para estoque.",
          },
        ],
      },
    },
  });

  // 10. Despesas do Salão
  await prisma.expense.createMany({
    data: [
      {
        salonId: salon.id,
        name: "Aluguel da Sala Comercial 402",
        category: "ALUGUEL",
        amount: 2500.0,
        dueDate: "2026-08-20",
        status: "PENDENTE",
        isRecurring: true,
      },
      {
        salonId: salon.id,
        name: "Energia Elétrica (Enel)",
        category: "ENERGIA",
        amount: 480.0,
        dueDate: "2026-08-15",
        status: "PENDENTE",
        isRecurring: true,
      },
      {
        salonId: salon.id,
        name: "Compra de Produtos Mega Nails (Géis & Fibras)",
        category: "PRODUTOS",
        amount: 1250.0,
        dueDate: "2026-08-05",
        paidDate: "2026-08-05",
        paymentMethod: "PIX",
        status: "PAGO",
        isRecurring: false,
      },
      {
        salonId: salon.id,
        name: "Anúncios Meta Ads (Instagram)",
        category: "MARKETING",
        amount: 600.0,
        dueDate: "2026-08-10",
        paidDate: "2026-08-10",
        paymentMethod: "CREDITO",
        status: "PAGO",
        isRecurring: true,
      },
    ],
  });

  // 11. Fornecedores & Estoque
  const supplier = await prisma.supplier.create({
    data: {
      salonId: salon.id,
      name: "Mega Nails Distribuidora Pro",
      company: "Mega Nails Importadora LTDA",
      phone: "(11) 3333-4444",
      whatsapp: "5511933334444",
      email: "vendas@meganails.com.br",
      cnpj: "98.765.432/0001-10",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        salonId: salon.id,
        supplierId: supplier.id,
        name: "Gel Construtor D&Z Pink Hard 50g",
        category: "GEL",
        quantity: 3, // ALERTA ESTOQUE BAIXO (min 5)
        minQuantity: 5,
        costPrice: 65.0,
        salePrice: 120.0,
      },
      {
        salonId: salon.id,
        supplierId: supplier.id,
        name: "Fibra de Vidro em Rolo Silk 2 metros",
        category: "FIBRA",
        quantity: 12,
        minQuantity: 5,
        costPrice: 28.0,
      },
      {
        salonId: salon.id,
        supplierId: supplier.id,
        name: "Esmalte Gel Nude Rendado D&Z 15ml",
        category: "ESMALTE",
        quantity: 2, // ALERTA ESTOQUE BAIXO (min 4)
        minQuantity: 4,
        costPrice: 22.0,
        salePrice: 45.0,
      },
      {
        salonId: salon.id,
        supplierId: supplier.id,
        name: "Lixa Banana 100/180 Pro (Pacote 10un)",
        category: "LIXA",
        quantity: 15,
        minQuantity: 6,
        costPrice: 18.0,
      },
      {
        salonId: salon.id,
        supplierId: supplier.id,
        name: "Prep Higienizador Antisséptico 500ml",
        category: "REMOVEDOR",
        quantity: 4,
        minQuantity: 3,
        costPrice: 35.0,
      },
    ],
  });

  // 12. Pacotes & Vales Presente
  await prisma.package.create({
    data: {
      salonId: salon.id,
      name: "Combo Club: 3 Manutenções em Fibra",
      price: 330.0,
      totalSessions: 3,
      validityDays: 90,
      description: "Economize R$ 60 no plano trimestral de manutenções de fibra.",
    },
  });

  await prisma.giftCard.create({
    data: {
      salonId: salon.id,
      code: "LUXE-GIFT-2026",
      initialValue: 200.0,
      remainingValue: 200.0,
      buyerName: "Roberto Rossi",
      recipientName: "Maria Fernanda Rossi",
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: "ATIVO",
    },
  });

  // 13. Templates de WhatsApp
  await prisma.whatsAppTemplate.createMany({
    data: [
      {
        salonId: salon.id,
        name: "Lembrete 24h Antes",
        type: "LEMBRETE_24H",
        content: "Olá, {CLIENTE_NOME}! 💅\nPassando para lembrar do seu horário no Studio Luxe.\n📅 Data: {DATA}\n⏰ Horário: {HORARIO}\n💅 Serviço: {SERVICO}\nProfissional: {PROFISSIONAL}\n\nPor favor, confirme sua presença:\n1️⃣ Digite CONFIRMAR\n2️⃣ Digite REAGENDAR",
      },
      {
        salonId: salon.id,
        name: "Confirmação Instantânea",
        type: "CONFIRMACAO",
        content: "Seu agendamento foi CONFIRMADO com sucesso! 💖\nEsperamos você no {SALON_NOME}.\nLocalização: {ENDERECO}",
      },
      {
        salonId: salon.id,
        name: "Lembrete de Retorno 21 Dias",
        type: "LEMBRETE_RETORNO",
        content: "Oi, {CLIENTE_NOME}! 💕 Já se passaram 21 dias do seu último alongamento. Está chegando o momento da sua manutenção para manter as unhas impecáveis!\nClique aqui para agendar seu próximo horário: {LINK_AGENDAMENTO}",
      },
      {
        salonId: salon.id,
        name: "Feliz Aniversário",
        type: "ANIVERSARIO",
        content: "Parabéns, {CLIENTE_NOME}! 🎂🎉 O Studio Luxe preparou um presente especial para você: GANHE 15% DE DESCONTO na sua próxima manutenção este mês! Agende já seu horário especial.",
      },
    ],
  });

  // 14. Avaliações
  await prisma.review.createMany({
    data: [
      {
        salonId: salon.id,
        appointmentId: "app-past-1",
        clientName: "Maria Fernanda Rossi",
        rating: 5,
        comment: "O trabalho da Juliana é simplesmente espetacular! Curvatura natural e durabilidade incrível.",
      },
      {
        salonId: salon.id,
        appointmentId: "app-past-2",
        clientName: "Carla Mendes",
        rating: 5,
        comment: "A melhor Nail Art de SP! Atendimento pontual e ambiente muito agradável com cafezinho expresso.",
      },
    ],
  });

  // 15. Notificações
  await prisma.notification.createMany({
    data: [
      {
        salonId: salon.id,
        title: "⚠️ Alerta de Estoque Baixo",
        message: "O produto 'Gel Construtor D&Z Pink Hard 50g' atingiu o limite mínimo (3 unidades).",
        type: "WARNING",
      },
      {
        salonId: salon.id,
        title: "🎂 Aniversariante Hoje!",
        message: "A cliente Fernanda Lima Silva faz aniversário hoje! Clique para enviar os parabéns no WhatsApp.",
        type: "SUCCESS",
      },
    ],
  });

  console.log("✅ Seed de demonstração concluído com sucesso!");
}

export async function clearDatabase() {
  console.log("🧹 Limpando todos os dados do banco de dados...");
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.automationSetting.deleteMany();
  await prisma.whatsAppMessage.deleteMany();
  await prisma.whatsAppTemplate.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.cashTransaction.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.waitlist.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.clientPackage.deleteMany();
  await prisma.package.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.clientPhoto.deleteMany();
  await prisma.client.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.user.deleteMany();
  await prisma.salon.deleteMany();
  console.log("✨ Banco de dados zerado com sucesso!");
}
