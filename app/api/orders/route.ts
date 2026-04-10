import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from "@/lib/email";
import { CartItem } from "@/components/types";

interface OrderRequestBody {
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    street: string;
    city: string;
    zip: string;
  };
  items: CartItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequestBody = await request.json();

    // ── Validate ──────────────────────────────────────────
    const { customer, items } = body;

    if (!customer?.fullName || !customer?.email || !customer?.street || !customer?.city || !customer?.zip) {
      return NextResponse.json(
        { error: "Chybí povinné údaje zákazníka." },
        { status: 400 },
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Košík je prázdný." },
        { status: 400 },
      );
    }

    // ── Calculate totals ──────────────────────────────────
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingPrice = 0;
    const totalPrice = subtotal + shippingPrice;

    const supabase = getSupabaseAdmin();

    // ── 1. Insert order ───────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (supabase
      .from("orders") as any)
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
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert failed:", orderError);
      return NextResponse.json(
        { error: "Nepodařilo se vytvořit objednávku." },
        { status: 500 },
      );
    }

    const orderId = order.id;

    // ── 2. Insert order items ─────────────────────────────
    // Handle both field naming conventions (localStorage may use short names)
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name_snapshot: item.productName || item.name || "Neznámý produkt",
      unit_price: item.price,
      quantity: item.quantity,
      line_total: item.price * item.quantity,
      selected_brand_name: item.selectedBrandName || item.brandName || null,
      selected_model_name: item.selectedModelName || item.modelName || null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await (supabase
      .from("order_items") as any)
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert failed:", itemsError);
      return NextResponse.json(
        { error: "Nepodařilo se uložit položky objednávky." },
        { status: 500 },
      );
    }

    // ── 3. Insert address ─────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: addressError } = await (supabase
      .from("addresses") as any)
      .insert({
        order_id: orderId,
        full_name: customer.fullName,
        street: customer.street,
        city: customer.city,
        zip: customer.zip,
        country: "CZ",
      });

    if (addressError) {
      console.error("Address insert failed:", addressError);
      // Order already saved — continue but log warning
    }

    // ── 4. Send emails (non-blocking for order success) ───
    const emailData = {
      orderId,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      street: customer.street,
      city: customer.city,
      zip: customer.zip,
      items,
      totalPrice,
    };

    let emailError = false;

    try {
      await Promise.all([
        sendOrderConfirmation(emailData),
        sendOrderNotificationToAdmin(emailData),
      ]);
    } catch (err) {
      console.error("Email sending failed (order is saved):", err);
      emailError = true;
    }

    // ── 5. Return success ─────────────────────────────────
    return NextResponse.json({
      success: true,
      orderId,
      emailSent: !emailError,
    });
  } catch (err) {
    console.error("Unexpected error in POST /api/orders:", err);
    return NextResponse.json(
      { error: "Neočekávaná chyba serveru." },
      { status: 500 },
    );
  }
}
