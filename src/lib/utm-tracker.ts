"use client";

import { useEffect } from "react";

export function useUTMTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      const utmData: Record<string, string> = {};
      let hasUtm = false;

      utmKeys.forEach((key) => {
        const val = urlParams.get(key);
        if (val) {
          utmData[key] = val;
          hasUtm = true;
        }
      });

      if (hasUtm) {
        sessionStorage.setItem("nailgestao_utm", JSON.stringify(utmData));
      }
    } catch (e) {
      console.error("Erro ao capturar UTMs:", e);
    }
  }, []);
}

export function getStoredUTMs(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const data = sessionStorage.getItem("nailgestao_utm");
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}
