import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      salonName,
      ownerName,
      email,
      password,
      phone,
      whatsapp,
      slogan,
      primaryColor,
      planName,
    } = body;

    if (!salonName || !ownerName || !email || !password) {
      return NextResponse.json(
        { error: "Por favor, preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Calcular data de expiração do teste (7 dias corridos a partir de agora)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // 2. Atualizar ou criar o Salão com os dados PREENCHIDOS PELA CLIENTE!
    let salon: any = null;
    try {
      salon = await prisma.salon.upsert({
        where: { id: "default-salon" },
        update: {
          name: salonName,
          ownerName: ownerName,
          email: cleanEmail,
          phone: phone || "(11) 99999-8888",
          whatsapp: whatsapp || "5511999998888",
          slogan: slogan || "Especialistas em Alongamento & Estética de Unhas",
          primaryColor: primaryColor || "#E0A96D",
          planName: planName || "PRO",
          subscriptionStatus: "TRIAL",
          trialEndsAt: trialEndsAt,
        },
        create: {
          id: "default-salon",
          name: salonName,
          ownerName: ownerName,
          email: cleanEmail,
          phone: phone || "(11) 99999-8888",
          whatsapp: whatsapp || "5511999998888",
          slogan: slogan || "Especialistas em Alongamento & Estética de Unhas",
          primaryColor: primaryColor || "#E0A96D",
          planName: planName || "PRO",
          subscriptionStatus: "TRIAL",
          trialEndsAt: trialEndsAt,
        },
      });
    } catch (dbErr) {
      console.warn("Criando salão em memória como fallback de segurança:", dbErr);
      salon = {
        id: "default-salon",
        name: salonName,
        ownerName: ownerName,
        email: cleanEmail,
        phone: phone || "",
        whatsapp: whatsapp || "",
        slogan: slogan || "Especialistas em Alongamento & Estética de Unhas",
        primaryColor: primaryColor || "#E0A96D",
        planName: planName || "PRO",
        subscriptionStatus: "TRIAL",
        trialEndsAt: trialEndsAt,
      };
    }

    // 3. Atualizar ou criar a Usuária Administradora Master com os DADOS DA CLIENTE!
    let user: any = null;
    try {
      user = await prisma.user.upsert({
        where: { id: "usr-admin-master" },
        update: {
          salonId: salon.id,
          name: ownerName,
          email: cleanEmail,
          passwordHash: password,
          role: "ADMINISTRADOR",
          phone: phone,
          active: true,
        },
        create: {
          id: "usr-admin-master",
          salonId: salon.id,
          name: ownerName,
          email: cleanEmail,
          passwordHash: password,
          role: "ADMINISTRADOR",
          phone: phone,
          active: true,
        },
      });
    } catch (uErr) {
      user = {
        id: "usr-admin-master",
        salonId: salon.id,
        name: ownerName,
        email: cleanEmail,
        role: "ADMINISTRADOR",
      };
    }

    // 4. Criar Profissional & Serviços Iniciais se não existirem
    try {
      const existingProf = await prisma.professional.findFirst({
        where: { salonId: salon.id },
      });

      if (!existingProf) {
        await prisma.professional.create({
          data: {
            salonId: salon.id,
            userId: user.id,
            name: ownerName,
            phone: phone || "(11) 99999-8888",
            email: cleanEmail,
            color: primaryColor || "#E0A96D",
            commissionRatePercent: 100.0,
          },
        });
      } else {
        await prisma.professional.update({
          where: { id: existingProf.id },
          data: {
            name: ownerName,
            phone: phone || existingProf.phone,
            email: cleanEmail,
            color: primaryColor || existingProf.color,
          },
        });
      }

      const existingCat = await prisma.serviceCategory.findFirst({
        where: { salonId: salon.id },
      });

      if (!existingCat) {
        const catNails = await prisma.serviceCategory.create({
          data: {
            salonId: salon.id,
            name: "Alongamentos & Manutenção",
            description: "Técnicas de alongamento em gel e fibra",
            order: 1,
          },
        });

        await prisma.service.createMany({
          data: [
            {
              salonId: salon.id,
              categoryId: catNails.id,
              name: "Alongamento em Fibra de Vidro",
              description: "Aplicação completa de alta durabilidade",
              durationMinutes: 120,
              price: 180.0,
              commissionPercent: 100.0,
            },
            {
              salonId: salon.id,
              categoryId: catNails.id,
              name: "Manutenção Fibra / Gel",
              description: "Nivelamento e esmaltação em gel",
              durationMinutes: 90,
              price: 110.0,
              commissionPercent: 100.0,
            },
          ],
        });
      }
    } catch (initErr) {
      console.warn("Aviso ao criar serviços iniciais:", initErr);
    }

    // 5. Salvar TODOS os Dados Reais da Cliente no Cookie de Sessão
    const sessionUser = {
      id: user.id,
      name: ownerName,
      ownerName: ownerName,
      email: cleanEmail,
      role: "ADMINISTRADOR",
      salonId: salon.id,
      salonName: salonName,
      phone: phone || "",
      whatsapp: whatsapp || "",
      slogan: slogan || "Especialistas em Alongamento & Estética de Unhas",
      primaryColor: primaryColor || "#E0A96D",
      subscriptionStatus: "TRIAL",
      trialEndsAt: trialEndsAt.toISOString(),
      planName: planName || "PRO",
    };

    const response = NextResponse.json({
      success: true,
      salonId: salon.id,
      userId: user.id,
      user: sessionUser,
      message: `Salão "${salonName}" cadastrado com sucesso! Seu teste de 7 dias começou.`,
    });

    response.cookies.set({
      name: "nailgestao_session",
      value: JSON.stringify(sessionUser),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error: any) {
    console.error("Erro geral no onboarding:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar o cadastro do salão." },
      { status: 500 }
    );
  }
}
