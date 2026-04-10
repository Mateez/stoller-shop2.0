/* ───────────────────────────────────────────
   Database row types (match Supabase schema)
   ─────────────────────────────────────────── */

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  base_price: number;
  main_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface StrollerModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductModelCompatibility {
  id: string;
  product_id: string;
  stroller_model_id: string;
  created_at: string;
}

/* ───────────────────────────────────────────
   Order-related types
   ─────────────────────────────────────────── */

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal_price: number;
  shipping_price: number;
  total_price: number;
  payment_status: string;
  order_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  selected_brand_name: string | null;
  selected_model_name: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  order_id: string;
  full_name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  created_at: string;
}

/* ───────────────────────────────────────────
   Client-side types
   ─────────────────────────────────────────── */

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  selectedBrandName: string;
  selectedModelName: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
}
