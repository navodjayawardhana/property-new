"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AgentSlide, Agent } from "@/lib/api";

type Props = {
  slides: AgentSlide[];
  agent: Agent;
};

export default function AgentHeroSlider({ slides, agent }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = slides.filter((s) => s.is_active);

  function resetTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCurrent((c) => (c + 1) % Math.max(active.length, 1)), 5000);
  }

  useEffect(() => {
    if (active.length <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, active.length]);

  function prev() { setCurrent((c) => (c - 1 + active.length) % active.length); resetTimer(); }
  function next() { setCurrent((c) => (c + 1) % active.length); resetTimer(); }

  // Default banner when no slides
  if (active.length === 0) {
    return (
      <div className="relative w-full h-72 md:h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-[#121e80] to-[#16a34a] flex items-center justify-center">
        <div className="text-center text-white px-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/30">
            {agent.avatar ? (
              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center text-4xl font-black">
                {agent.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-black">{agent.name}</h2>
          <p className="text-white/70 mt-1">Real Estate Agent</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 md:h-[420px] overflow-hidden rounded-2xl group">
      {active.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img
            src={slide.url}
            alt={`${agent.name} - Real estate agent profile slide ${i + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Agent name overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-3">
          {agent.avatar && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/60 shrink-0">
              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <p className="font-black text-lg leading-tight drop-shadow">{agent.name}</p>
            <p className="text-white/70 text-sm">Real Estate Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 right-5 flex gap-1.5">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
