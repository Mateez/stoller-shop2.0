"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Brand, StrollerModel, Product, CartItem } from "@/components/types";
import { getCart } from "@/lib/cart";

import HeroSection from "@/components/HeroSection";
import CompatibilitySelector from "@/components/CompatibilitySelector";
import ProductsSection from "@/components/ProductsSection";
import ProductModal from "@/components/ProductModal";
import CartSection from "@/components/CartSection";
import CheckoutSection from "@/components/CheckoutSection";

type View = "shop" | "checkout";

export default function HomePage() {
  // Selection state
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<StrollerModel | null>(null);

  // UI state
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<View>("shop");

  // Refs for scrolling
  const selectorRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(getCart());
  }, []);

  const refreshCart = useCallback(() => {
    setCart(getCart());
  }, []);

  function handleSelectionComplete(brand: Brand, model: StrollerModel | null) {
    setSelectedBrand(brand);
    if (model) {
      setSelectedModel(model);
    }
  }

  function handleReset() {
    setSelectedBrand(null);
    setSelectedModel(null);
  }

  function scrollToSelector() {
    selectorRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToCart() {
    cartRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Checkout view
  if (view === "checkout") {
    return (
      <CheckoutSection
        cart={cart}
        onCartChange={refreshCart}
        onBack={() => setView("shop")}
      />
    );
  }

  return (
    <>
      {/* Hero */}
      <HeroSection onScrollToSelector={scrollToSelector} />

      {/* Compatibility selector */}
      <div ref={selectorRef}>
        <CompatibilitySelector
          selectedBrand={selectedBrand}
          selectedModel={selectedModel}
          onSelectionComplete={handleSelectionComplete}
          onReset={handleReset}
        />
      </div>

      {/* Products (only when brand + model are selected) */}
      {selectedBrand && selectedModel && (
        <ProductsSection
          selectedBrand={selectedBrand}
          selectedModel={selectedModel}
          onCartChange={() => {
            refreshCart();
            scrollToCart();
          }}
          onOpenDetail={(product) => setModalProduct(product)}
        />
      )}

      {/* Cart */}
      <div ref={cartRef}>
        <CartSection
          cart={cart}
          onCartChange={refreshCart}
          onCheckout={() => setView("checkout")}
        />
      </div>

      {/* Product detail modal */}
      {modalProduct && selectedBrand && selectedModel && (
        <ProductModal
          product={modalProduct}
          selectedBrand={selectedBrand}
          selectedModel={selectedModel}
          onClose={() => setModalProduct(null)}
          onCartChange={refreshCart}
        />
      )}

      {/* Minimal footer */}
      <footer className="py-8 text-center text-sm text-neutral-400 border-t border-neutral-100">
        <p>&copy; {new Date().getFullYear()} Stroller Shop. Všechna práva vyhrazena.</p>
      </footer>
    </>
  );
}
