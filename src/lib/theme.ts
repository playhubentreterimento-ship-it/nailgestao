// Helper para aplicar dinamicamente a cor primaria de destaque escolhida pelo cliente em todo o sistema
export function applyPrimaryColor(color?: string | null) {
  if (typeof window === "undefined" || !color || !color.trim()) return;
  const cleanColor = color.trim();
  
  try {
    document.documentElement.style.setProperty("--primary-color", cleanColor);
    document.documentElement.style.setProperty("--primary", cleanColor);
    document.documentElement.style.setProperty("--primary-hover", cleanColor);
    
    // Salvar localmente para carregamento ultra-rápido instantâneo antes da API responder
    localStorage.setItem("salon-primary-color", cleanColor);
  } catch (e) {}
}

export function getStoredPrimaryColor(): string {
  if (typeof window === "undefined") return "#6B1615";
  return localStorage.getItem("salon-primary-color") || "#6B1615";
}
