import { NextResponse } from "next/server";
import { seedDatabase, clearDatabase } from "@/lib/seed-data";

import { isDemoVisitor } from "@/lib/demo-check";

export async function POST(req: Request) {
  try {
    if (await isDemoVisitor()) {
      return NextResponse.json(
        { error: "🔒 Modo Demonstração (Somente Leitura): Entre com seu login de Administradora para zerar ou restaurar dados." },
        { status: 403 }
      );
    }

    const { action } = await req.json();

    if (action === "RESEED") {
      await seedDatabase();
      return NextResponse.json({ success: true, message: "Dados de demonstração restaurados com sucesso!" });
    }

    if (action === "CLEAR_ALL") {
      await clearDatabase();
      return NextResponse.json({ success: true, message: "Todos os dados foram removidos. O sistema está pronto para produção!" });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
