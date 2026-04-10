import { CartItem } from "@/components/types";

const CART_KEY = "stroller-shop-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/** Unique key for a cart line: product + brand + model */
function cartLineKey(item: Pick<CartItem, "productId" | "selectedBrandName" | "selectedModelName">) {
  return `${item.productId}::${item.selectedBrandName}::${item.selectedModelName}`;
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = readCart();
  const key = cartLineKey(item);
  const idx = cart.findIndex((c) => cartLineKey(c) === key);

  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push({ ...item });
  }

  writeCart(cart);
  return cart;
}

export function updateQuantity(
  productId: string,
  brandName: string,
  modelName: string,
  quantity: number,
): CartItem[] {
  let cart = readCart();
  const key = cartLineKey({ productId, selectedBrandName: brandName, selectedModelName: modelName });

  if (quantity <= 0) {
    cart = cart.filter((c) => cartLineKey(c) !== key);
  } else {
    const idx = cart.findIndex((c) => cartLineKey(c) === key);
    if (idx >= 0) cart[idx].quantity = quantity;
  }

  writeCart(cart);
  return cart;
}

export function removeFromCart(
  productId: string,
  brandName: string,
  modelName: string,
): CartItem[] {
  return updateQuantity(productId, brandName, modelName, 0);
}

export function clearCart(): CartItem[] {
  writeCart([]);
  return [];
}

export function cartTotalItems(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.quantity, 0);
}

export function cartTotalPrice(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
}
