// ---------------------------------------------------------------------------
// Order API types — adapted from AI Agent, aligned with existing DB schema
// DB tables: orders, order_items, addresses
// ---------------------------------------------------------------------------

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Payload the frontend sends to POST /api/orders */
export interface CreateOrderPayload {
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    street: string;
    city: string;
    zip: string;
  };
  items: {
    productId: string;
    quantity: number;
    selectedBrandName: string;
    selectedModelName: string;
  }[];
}

/** Internal order representation after DB insert (used in emails etc.) */
export interface ProcessedOrder {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  items: ProcessedOrderItem[];
  subtotalPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export interface ProcessedOrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedBrandName: string;
  selectedModelName: string;
}

/** Successful API response */
export interface OrderSuccessResponse {
  success: true;
  order: {
    id: string;
    orderNumber: string;
    orderStatus: OrderStatus;
    createdAt: string;
  };
  message: string;
}

/** Error API response */
export interface OrderErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type OrderApiResponse = OrderSuccessResponse | OrderErrorResponse;
