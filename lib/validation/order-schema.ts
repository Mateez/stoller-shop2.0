import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas — aligned with existing stroller-shop DB schema
// Server validates structure; prices are fetched from DB (never trusted)
// ---------------------------------------------------------------------------

const customerSchema = z.object({
  fullName: z.string().min(1, "Jméno je povinné"),
  email: z.string().email("Neplatná e-mailová adresa"),
  phone: z.string().optional(),
  street: z.string().min(1, "Ulice je povinná"),
  city: z.string().min(1, "Město je povinné"),
  zip: z.string().min(3, "PSČ je povinné"),
});

const orderItemSchema = z.object({
  productId: z.string().uuid("Product ID musí být platné UUID"),
  quantity: z.number().int().positive("Množství musí být kladné celé číslo"),
  selectedBrandName: z.string().min(1, "Značka je povinná"),
  selectedModelName: z.string().min(1, "Model je povinný"),
});

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, "Košík musí obsahovat alespoň jednu položku"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
