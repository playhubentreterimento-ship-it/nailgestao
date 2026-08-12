import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const sessionUser = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user: sessionUser });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
