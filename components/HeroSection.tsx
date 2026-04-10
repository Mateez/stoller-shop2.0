"use client";

import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
  onScrollToSelector: () => void;
}

export default function HeroSection({ onScrollToSelector }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
          Prémiové příslušenství ke kočárkům
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
          Najděte ideální doplňky{" "}
          <span className="text-brand-500">pro váš kočárek</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Vyberte značku a model vašeho kočárku — ukážeme vám pouze
          příslušenství, které je zaručeně kompatibilní.
        </p>

        <button
          onClick={onScrollToSelector}
          className="mt-10 inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-all hover:shadow-elevated group"
        >
          Začít výběr
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* subtle background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-brand-50/50 to-transparent" />
    </section>
  );
}
