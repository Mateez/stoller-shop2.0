import { getResend, EMAIL_FROM } from "./resend";
import { CartItem } from "@/components/types";

interface OrderEmailData {
  orderId: string;
  fullName: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  zip: string;
  items: CartItem[];
  totalPrice: number;
}

function itemName(item: any): string {
  return item.productName || item.name || "Produkt";
}
function itemBrand(item: any): string {
  return item.selectedBrandName || item.brandName || "";
}
function itemModel(item: any): string {
  return item.selectedModelName || item.modelName || "";
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">
          ${itemName(item)}
          <br><small style="color: #888;">${itemBrand(item)} — ${itemModel(item)}</small>
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
          ${(item.price * item.quantity).toFixed(0)}&nbsp;Kč
        </td>
      </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="padding: 32px 24px; background: linear-gradient(135deg, #faf6f1, #ffffff); border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Děkujeme za objednávku!</h1>
        <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Číslo objednávky: <strong>${data.orderId}</strong></p>
      </div>

      <div style="padding: 24px;">
        <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px;">Doručovací adresa</h2>
        <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.6;">
          ${data.fullName}<br>
          ${data.street}<br>
          ${data.zip} ${data.city}<br>
          ${data.phone ? `Tel: ${data.phone}` : ""}
        </p>

        <h2 style="font-size: 16px; font-weight: 600; margin: 24px 0 12px;">Položky objednávky</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #fafafa;">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600;">Produkt</th>
              <th style="padding: 8px 12px; text-align: center; font-weight: 600;">Ks</th>
              <th style="padding: 8px 12px; text-align: right; font-weight: 600;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 16px; padding: 16px; background: #fafafa; border-radius: 8px; text-align: right;">
          <strong style="font-size: 18px;">Celkem: ${data.totalPrice.toFixed(0)}&nbsp;Kč</strong>
        </div>
      </div>

      <div style="padding: 16px 24px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #f0f0f0;">
        Stroller Shop — Prémiové příslušenství ke kočárkům
      </div>
    </div>
  `;

  const { data: result, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: data.email,
    subject: `Potvrzení objednávky #${data.orderId}`,
    html,
  });

  if (error) {
    console.error("Failed to send order confirmation email:", error);
    throw error;
  }

  return result;
}

export async function sendOrderNotificationToAdmin(data: OrderEmailData) {
  const itemsList = data.items
    .map(
      (item) =>
        `• ${itemName(item)} (${itemBrand(item)} ${itemModel(item)}) × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} Kč`,
    )
    .join("\n");

  const text = `Nová objednávka #${data.orderId}

Zákazník: ${data.fullName}
Email: ${data.email}
Telefon: ${data.phone || "neuvedeno"}

Adresa:
${data.street}
${data.zip} ${data.city}

Položky:
${itemsList}

Celkem: ${data.totalPrice.toFixed(0)} Kč
`;

  const { data: result, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: process.env.ORDER_NOTIFICATION_EMAIL || data.email,
    subject: `[Nová objednávka] #${data.orderId} — ${data.fullName}`,
    text,
  });

  if (error) {
    console.error("Failed to send admin notification email:", error);
    throw error;
  }

  return result;
}
