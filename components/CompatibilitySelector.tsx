"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand, StrollerModel } from "./types";
import { ChevronRight, RotateCcw } from "lucide-react";

interface CompatibilitySelectorProps {
  onSelectionComplete: (
    brand: Brand,
    model: StrollerModel,
  ) => void;
  onReset: () => void;
  selectedBrand: Brand | null;
  selectedModel: StrollerModel | null;
}

export default function CompatibilitySelector({
  onSelectionComplete,
  onReset,
  selectedBrand,
  selectedModel,
}: CompatibilitySelectorProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<StrollerModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Load brands on mount
  useEffect(() => {
    async function fetchBrands() {
      const { data } = await supabase
        .from("brands")
        .select("*")
        .order("name");
      if (data) setBrands(data);
    }
    fetchBrands();
  }, []);

  // Load models when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      return;
    }

    async function fetchModels() {
      setLoading(true);
      const { data } = await supabase
        .from("stroller_models")
        .select("*")
        .eq("brand_id", selectedBrand!.id)
        .order("name");
      if (data) setModels(data);
      setLoading(false);
    }
    fetchModels();
  }, [selectedBrand]);

  function handleBrandSelect(brand: Brand) {
    // If a brand is already selected, reset first
    if (selectedBrand) onReset();
    // Trigger selection with just brand — parent handles state
    onSelectionComplete(brand, null as unknown as StrollerModel);
  }

  function handleModelSelect(model: StrollerModel) {
    if (selectedBrand) {
      onSelectionComplete(selectedBrand, model);
    }
  }

  const isComplete = selectedBrand && selectedModel;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Vyberte svůj kočárek
          </h2>
          <p className="mt-3 text-neutral-500">
            Spárujeme vás s kompatibilním příslušenstvím.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-10 text-sm">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
              selectedBrand
                ? "bg-brand-400 text-white"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Značka
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300" />
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
              selectedModel
                ? "bg-brand-400 text-white"
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Model
          </div>
        </div>

        {/* Brand selection */}
        {!selectedBrand && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Vyberte značku
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="p-4 rounded-xl border border-neutral-200 text-neutral-800 font-medium hover:border-brand-400 hover:bg-brand-50 transition-all text-center"
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Model selection */}
        {selectedBrand && !selectedModel && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
              Vyberte model {selectedBrand.name}
            </h3>
            {loading ? (
              <p className="text-neutral-400 text-center py-8">
                Načítám modely…
              </p>
            ) : models.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">
                Pro tuto značku nebyly nalezeny žádné modely.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className="p-4 rounded-xl border border-neutral-200 text-neutral-800 font-medium hover:border-brand-400 hover:bg-brand-50 transition-all text-center"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selection summary */}
        {isComplete && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-brand-50 text-brand-700 font-medium">
              {selectedBrand.name} — {selectedModel.name}
            </div>
          </div>
        )}

        {/* Reset button */}
        {selectedBrand && (
          <div className="mt-6 text-center">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Změnit výběr
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
