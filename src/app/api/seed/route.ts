import { NextResponse } from "next/server";
import { seedDatabase, clearDatabase } from "@/lib/seed-data";

export async function POST(req: Request) {
  try {
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
