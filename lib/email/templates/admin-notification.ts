import type { ProcessedOrder } from "@/types/order";

// ---------------------------------------------------------------------------
// HTML email template sent to the store admin when a new order arrives
// ---------------------------------------------------------------------------

export function buildAdminEmailHtml(order: ProcessedOrder): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #ddd;">${item.productName}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #ddd;">${item.selectedBrandName} / ${item.selectedModelName}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;">${item.unitPrice.toFixed(0)}&nbsp;Kč</td>
        <td style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:right;">${item.lineTotal.toFixed(0)}&nbsp;Kč</td>
      </tr>`,
    )
    .join("");

  const addr = order.shippingAddress;

  return `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;">
    <!-- Header -->
    <tr>
      <td style="background:#dc2626;padding:20px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:20px;">Nová objednávka: ${order.orderNumber}</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:20px;">
        <!-- Customer -->
        <h3 style="margin:0 0 8px;">Zákazník</h3>
        <table style="margin-bottom:16px;">
          <tr><td style="padding:2px 8px;font-weight:bold;">Jméno:</td><td>${order.customerName}</td></tr>
          <tr><td style="padding:2px 8px;font-weight:bold;">E-mail:</td><td>${order.customerEmail}</td></tr>
          <tr><td style="padding:2px 8px;font-weight:bold;">Telefon:</td><td>${order.customerPhone || "neuvedeno"}</td></tr>
        </table>

        <!-- Address -->
        <h3 style="margin:0 0 8px;">Doručovací adresa</h3>
        <p style="margin:0 0 16px;">
          ${addr.fullName}<br/>
          ${addr.street}<br/>
          ${addr.zip} ${addr.city}<br/>
          ${addr.country}
        </p>

        <!-- Items -->
        <h3 style="margin:0 0 8px;">Položky</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:6px 10px;text-align:left;">Produkt</th>
              <th style="padding:6px 10px;text-align:left;">Značka / Model</th>
              <th style="padding:6px 10px;text-align:center;">Ks</th>
              <th style="padding:6px 10px;text-align:right;">Jedn. cena</th>
              <th style="padding:6px 10px;text-align:right;">Celkem</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <!-- Totals -->
        <table style="margin-bottom:16px;">
          <tr><td style="padding:2px 8px;font-weight:bold;">Mezisoučet:</td><td>${order.subtotalPrice.toFixed(0)}&nbsp;Kč</td></tr>
          <tr><td style="padding:2px 8px;font-weight:bold;">Doprava:</td><td>${order.shippingPrice.toFixed(0)}&nbsp;Kč</td></tr>
          <tr><td style="padding:2px 8px;font-weight:bold;font-size:16px;">Celkem:</td><td style="font-size:16px;font-weight:bold;">${order.totalPrice.toFixed(0)}&nbsp;Kč</td></tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f1f5f9;padding:12px;text-align:center;font-size:12px;color:#64748b;">
        Automatická notifikace — Stroller Shop Admin
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAdminEmailSubject(orderNumber: string): string {
  return `Nová objednávka ${orderNumber}`;
}
