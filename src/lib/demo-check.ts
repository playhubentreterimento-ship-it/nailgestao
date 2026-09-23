import { cookies } from "next/headers";

export async function isDemoVisitor(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("nailgestao_session");
    if (!sessionCookie || !sessionCookie.value) {
      return true; // É visitante de demonstração
    }
    const user = JSON.parse(sessionCookie.value);
    return !user || !user.id;
  } catch (err) {
    return true;
  }
}
