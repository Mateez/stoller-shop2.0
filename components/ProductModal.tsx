"use client";

import { useEffect, useCallback } from "react";
import { Product, Brand, StrollerModel, CartItem } from "./types";
import { addToCart } from "@/lib/cart";
import { X, ShoppingBag } from "lucide-react";

interface ProductModalProps {
  product: Product;
  selectedBrand: Brand;
  selectedModel: StrollerModel;
  onClose: () => void;
  onCartChange: () => void;
}

export default function ProductModal({
  product,
  selectedBrand,
  selectedModel,
  onClose,
  onCartChange,
}: ProductModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  function handleAddToCart() {
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
    onClose();
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-neutral-100 transition-colors"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Image */}
        <div className="aspect-[16/10] bg-gradient-to-br from-brand-50 to-brand-100 rounded-t-2xl flex items-center justify-center">
          {product.main_image_url ? (
            <img
              src={product.main_image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          ) : (
            <span className="text-brand-400 font-medium">
              {product.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {product.is_featured && (
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
              Doporučujeme
            </span>
          )}

          <h2 className="text-2xl font-bold text-neutral-900">
            {product.name}
          </h2>

          {product.short_description && (
            <p className="mt-2 text-neutral-500">
              {product.short_description}
            </p>
          )}

          {product.description && (
            <div className="mt-4 text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </div>
          )}

          {/* Compatibility info */}
          <div className="mt-5 p-3 rounded-xl bg-neutral-50 text-sm text-neutral-600">
            Kompatibilní s{" "}
            <strong className="text-neutral-800">
              {selectedBrand.name} {selectedModel.name}
            </strong>
          </div>

          {/* Price + CTA */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-2xl font-bold text-neutral-900">
              {product.base_price.toFixed(0)}&nbsp;Kč
            </span>
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Přidat do košíku
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
