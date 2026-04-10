"use client";

import { CartItem } from "./types";
import { updateQuantity, removeFromCart, cartTotalItems, cartTotalPrice } from "@/lib/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface CartSectionProps {
  cart: CartItem[];
  onCartChange: () => void;
  onCheckout: () => void;
}

export default function CartSection({
  cart,
  onCartChange,
  onCheckout,
}: CartSectionProps) {
  function handleIncrease(item: CartItem) {
    updateQuantity(
      item.productId,
      item.selectedBrandName,
      item.selectedModelName,
      item.quantity + 1,
    );
    onCartChange();
  }

  function handleDecrease(item: CartItem) {
    updateQuantity(
      item.productId,
      item.selectedBrandName,
      item.selectedModelName,
      item.quantity - 1,
    );
    onCartChange();
  }

  function handleRemove(item: CartItem) {
    removeFromCart(
      item.productId,
      item.selectedBrandName,
      item.selectedModelName,
    );
    onCartChange();
  }

  if (cart.length === 0) {
    return (
      <section id="cart" className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900">
            Košík je prázdný
          </h2>
          <p className="mt-2 text-neutral-500">
            Vyberte kočárek a přidejte kompatibilní příslušenství výše.
          </p>
        </div>
      </section>
    );
  }

  const totalItems = cartTotalItems(cart);
  const totalPrice = cartTotalPrice(cart);

  return (
    <section id="cart" className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Váš košík
          </h2>
          <p className="mt-2 text-neutral-500">
            {totalItems} {totalItems === 1 ? "položka" : totalItems < 5 ? "položky" : "položek"}
          </p>
        </div>

        <div className="space-y-4">
          {cart.map((item) => {
            const key = `${item.productId}-${item.selectedBrandName}-${item.selectedModelName}`;
            return (
              <div
                key={key}
                className="flex gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                {/* Image */}
                <div className="w-20 h-20 shrink-0 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-brand-400 text-xs font-medium text-center px-1">
                      {item.productName}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 truncate">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {item.selectedBrandName} — {item.selectedModelName}
                  </p>
                  <p className="text-sm font-bold text-neutral-900 mt-1">
                    {item.price.toFixed(0)}&nbsp;Kč
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecrease(item)}
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    aria-label="Snížit množství"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(item)}
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    aria-label="Zvýšit množství"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line total + remove */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <span className="text-sm font-bold text-neutral-900">
                    {(item.price * item.quantity).toFixed(0)}&nbsp;Kč
                  </span>
                  <button
                    onClick={() => handleRemove(item)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                    aria-label="Odebrat položku"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 p-5 rounded-xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-600">Mezisoučet</span>
            <span className="text-lg font-bold text-neutral-900">
              {totalPrice.toFixed(0)}&nbsp;Kč
            </span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Pokračovat k objednávce
          </button>
        </div>
      </div>
    </section>
  );
}
