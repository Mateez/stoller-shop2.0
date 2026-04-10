import type { CreateOrderPayload, OrderApiResponse } from "@/types/order";

// ---------------------------------------------------------------------------
// Reusable frontend helper to submit an order to the API
// Use this from any component or checkout page.
// ---------------------------------------------------------------------------

export async function submitOrder(
  payload: CreateOrderPayload,
): Promise<OrderApiResponse> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data: OrderApiResponse = await response.json();
  return data;
}
