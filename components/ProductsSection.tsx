"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Brand, StrollerModel, CartItem } from "./types";
import { addToCart } from "@/lib/cart";
import { ShoppingBag, Eye } from "lucide-react";

interface ProductsSectionProps {
  selectedBrand: Brand;
  selectedModel: StrollerModel;
  onCartChange: () => void;
  onOpenDetail: (product: Product) => void;
}

export default function ProductsSection({
  selectedBrand,
  selectedModel,
  onCartChange,
  onOpenDetail,
}: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompatibleProducts() {
      setLoading(true);

      // 1. Get compatible product IDs for this model
      const { data: compat } = await supabase
        .from("product_model_compatibility")
        .select("product_id")
        .eq("stroller_model_id", selectedModel.id);

      if (!compat || compat.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productIds = compat.map((c) => c.product_id);

      // 2. Fetch those products
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true)
        .order("display_order");

      setProducts(data || []);
      setLoading(false);
    }

    fetchCompatibleProducts();
  }, [selectedModel.id]);

  function handleAddToCart(product: Product) {
    const item: CartItem = {
      productId: product.id,
      productName: product.name,
      price: product.base_price,
      imageUrl: product.main_image_url,
      quantity: 1,
      selectedBrandName: selectedBrand.name,
      selectedModelName: selectedModel.name,
    };
    addToCart(item);
    onCartChange();
  }

  if (loading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-neutral-400">Načítám kompatibilní produkty…</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-neutral-500 text-lg">
            Pro{" "}
            <strong>{selectedBrand.name} {selectedModel.name}</strong>{" "}
            nebyly nalezeny žádné kompatibilní produkty.
          </p>
          <p className="mt-2 text-neutral-400 text-sm">
            Zkuste vybrat jiný model kočárku.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Kompatibilní příslušenství
          </h2>
          <p className="mt-3 text-neutral-500">
            {products.length} {products.length === 1 ? "produkt" : products.length < 5 ? "produkty" : "produktů"} pro{" "}
            <strong className="text-neutral-700">
              {selectedBrand.name} {selectedModel.name}
            </strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-shadow"
            >
              {/* Image area */}
              <div
                className="relative aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center cursor-pointer"
                onClick={() => onOpenDetail(product)}
              >
                {product.main_image_url ? (
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-brand-400 font-medium text-sm px-4 text-center">
                    {product.name}
                  </span>
                )}

                {product.is_featured && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold">
                    Doporučujeme
                  </span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-white/90 rounded-full text-sm font-medium text-neutral-800">
                    <Eye className="w-4 h-4" />
                    Zobrazit detail
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <h3
                  className="font-semibold text-neutral-900 cursor-pointer hover:text-brand-600 transition-colors"
                  onClick={() => onOpenDetail(product)}
                >
                  {product.name}
                </h3>

                {product.short_description && (
                  <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2">
                    {product.short_description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-neutral-900">
                    {product.base_price.toFixed(0)}&nbsp;Kč
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-800 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Přidat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
