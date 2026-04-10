"use client";

import { useState } from "react";
import { CartItem, CheckoutFormData } from "./types";
import { clearCart, cartTotalPrice } from "@/lib/cart";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

interface CheckoutSectionProps {
  cart: CartItem[];
  onCartChange: () => void;
  onBack: () => void;
}

export default function CheckoutSection({
  cart,
  onCartChange,
  onBack,
}: CheckoutSectionProps) {
  const [form, setForm] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function isEmailValid(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.street || !form.city || !form.zip) {
      alert("Prosím vyplňte všechna povinná pole.");
      return;
    }

    if (!isEmailValid(form.email)) {
      alert("Prosím zadejte platnou e-mailovou adresu.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone || undefined,
            street: form.street,
            city: form.city,
            zip: form.zip,
          },
          items: cart,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Order API error:", data.error);
        setStatus("error");
        return;
      }

      setOrderId(data.orderId);
      clearCart();
      onCartChange();
      setStatus("success");
    } catch (err) {
      console.error("Order submission failed:", err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  const total = cartTotalPrice(cart);

  if (status === "success") {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900">
            Objednávka odeslána!
          </h2>
          {orderId && (
            <p className="mt-2 text-sm text-neutral-400">
              Číslo objednávky: <strong className="text-neutral-600">{orderId.slice(0, 8)}</strong>
            </p>
          )}
          <p className="mt-3 text-neutral-500">
            Děkujeme, {form.fullName}. Potvrzení objednávky jsme odeslali
            na <strong>{form.email}</strong>.
          </p>
          <button
            onClick={onBack}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Zpět do obchodu
          </button>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900">
            Něco se pokazilo
          </h2>
          <p className="mt-3 text-neutral-500">
            Zkuste to prosím znovu nebo kontaktujte podporu.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors"
          >
            Zkusit znovu
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět do košíku
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
          Objednávka
        </h2>
        <p className="text-neutral-500 mb-8">
          Celkem: <strong className="text-neutral-900">{total.toFixed(0)}&nbsp;Kč</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Jméno a příjmení *
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ulice a číslo *
            </label>
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Město *
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                PSČ *
              </label>
              <input
                type="text"
                name="zip"
                value={form.zip}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Odesílám objednávku…" : `Odeslat objednávku — ${total.toFixed(0)}\u00a0Kč`}
            </button>
          </div>

          <p className="text-center text-xs text-neutral-400">
            Po odeslání obdržíte potvrzení na váš e-mail.
          </p>
        </form>
      </div>
    </section>
  );
}
