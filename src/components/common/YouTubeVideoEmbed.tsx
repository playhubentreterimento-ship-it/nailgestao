"use client";

import React from "react";
import { ExternalLink, Play } from "lucide-react";

interface YouTubeVideoEmbedProps {
  videoId?: string;
  title?: string;
}

export function YouTubeVideoEmbed({
  videoId = "gwLrje8vuVU",
  title = "NailGestão PRO — Vídeo Oficial de Demonstração"
}: YouTubeVideoEmbedProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=1&rel=0`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="space-y-4">
      {/* Container Responsivo do Vídeo do YouTube (Aspect Ratio 16:9) */}
      <div className="relative rounded-3xl bg-[#17171C] border-2 border-rose-500/40 shadow-2xl overflow-hidden aspect-video max-w-4xl mx-auto group">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 rounded-3xl"
        />

        {/* Floating Action Button para Abrir no YouTube */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="click_watch_youtube_video"
            className="px-4 py-2 rounded-full bg-[#0F0F12]/90 hover:bg-[#0F0F12] backdrop-blur-md border border-rose-500/50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xl transition-all hover:scale-105"
          >
            <Play className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <span>Assistir no YouTube</span>
            <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-[#B8B8C2] font-medium flex items-center justify-center gap-1.5">
        <span>🎬 Vídeo Oficial do NailGestão PRO — Tocando com reprodução automática ativada.</span>
      </p>
    </div>
  );
}
