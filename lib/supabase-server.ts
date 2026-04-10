import { createClient } from "@supabase/supabase-js";
import type { ProcessedOrder, ProcessedOrderItem } from "@/types/order";
import type { CreateOrderInput } from "@/lib/validation/order-schema";
import { generateOrderNumber } from "@/lib/utils/order-number";
import { logger } from "@/lib/utils/logger";

// ---------------------------------------------------------------------------
// Server-only Supabase client (uses the service-role key)
// ---------------------------------------------------------------------------

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      );
    }
    _client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Fetch verified product data from DB (never trust frontend prices)
// ---------------------------------------------------------------------------

interface VerifiedProduct {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
}

export async function fetchVerifiedProducts(
  productIds: string[],
): Promise<Map<string, VerifiedProduct>> {
  const supabase = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .select("id, name, base_price, is_active")
    .in("id", productIds);

  if (error || !data) {
    logger.error("Products lookup failed", { error });
    throw new Error("Nepodařilo se ověřit produkty.");
  }

  const map = new Map<string, VerifiedProduct>();
  for (const p of data) {
    map.set(p.id, p);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Insert a new order into existing tables: orders, order_items, addresses
// ---------------------------------------------------------------------------

export async function insertOrder(
  input: CreateOrderInput,
  productMap: Map<string, VerifiedProduct>,
): Promise<ProcessedOrder> {
  const supabase = getSupabaseAdmin();
  const orderNumber = generateOrderNumber();
  const { customer, items } = input;

  // Calculate totals from DB prices
  const processedItems: ProcessedOrderItem[] = items.map((item) => {
    const dbProduct = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      productName: dbProduct.name,
      unitPrice: dbProduct.base_price,
      quantity: item.quantity,
      lineTotal: dbProduct.base_price * item.quantity,
      selectedBrandName: item.selectedBrandName,
      selectedModelName: item.selectedModelName,
    };
  });

  const subtotal = processedItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const shippingPrice = 0;
  const totalPrice = subtotal + shippingPrice;

  // 1. Insert into `orders`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from("orders") as any)
    .insert({
      customer_name: customer.fullName,
      customer_email: customer.email,
      customer_phone: customer.phone || null,
      subtotal_price: subtotal,
      shipping_price: shippingPrice,
      total_price: totalPrice,
      payment_status: "pending",
      order_status: "new",
    })
    .select("id, created_at")
    .single();

  if (orderError || !order) {
    logger.error("Failed to insert order", { error: orderError });
    throw new Error(`Nepodařilo se vytvořit objednávku: ${orderError?.message}`);
  }

  logger.info("Order inserted", { orderId: order.id, orderNumber });

  // 2. Insert into `addresses`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: addressError } = await (supabase.from("addresses") as any)
    .insert({
      order_id: order.id,
      full_name: customer.fullName,
      street: customer.street,
      city: customer.city,
      zip: customer.zip,
      country: "CZ",
    });

  if (addressError) {
    logger.error("Failed to insert address", { error: addressError, orderId: order.id });
  }

  // 3. Insert into `order_items`
  const itemRows = processedItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name_snapshot: item.productName,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    line_total: item.lineTotal,
    selected_brand_name: item.selectedBrandName,
    selected_model_name: item.selectedModelName,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase.from("order_items") as any)
    .insert(itemRows);

  if (itemsError) {
    logger.error("Failed to insert order items", { error: itemsError, orderId: order.id });
    throw new Error(`Nepodařilo se uložit položky: ${itemsError.message}`);
  }

  logger.info("Order items inserted", { orderId: order.id, count: itemRows.length });

  // 4. Return processed order
  return {
    id: order.id,
    orderNumber,
    orderStatus: "new",
    paymentStatus: "pending",
    createdAt: order.created_at,
    customerName: customer.fullName,
    customerEmail: customer.email,
    customerPhone: customer.phone || null,
    shippingAddress: {
      fullName: customer.fullName,
      street: customer.street,
      city: customer.city,
      zip: customer.zip,
      country: "CZ",
    },
    items: processedItems,
    subtotalPrice: subtotal,
    shippingPrice: shippingPrice,
    totalPrice: totalPrice,
  };
}
