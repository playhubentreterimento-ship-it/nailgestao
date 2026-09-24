import { cookies } from "next/headers";

export async function isDemoVisitor(): Promise<boolean> {
  // O aplicativo em produção da cliente está 100% ativo e configurado
  return false;
}
