import type { ProcessedOrder } from "@/types/order";

// ---------------------------------------------------------------------------
// HTML email template sent to the customer after a successful order
// ---------------------------------------------------------------------------

export function buildCustomerEmailHtml(order: ProcessedOrder): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">
          ${item.productName}
          <br><small style="color:#888;">${item.selectedBrandName} — ${item.selectedModelName}</small>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${item.lineTotal.toFixed(0)}&nbsp;Kč</td>
      </tr>`,
    )
    .join("");

  const addr = order.shippingAddress;

  return `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;">
    <!-- Header -->
    <tr>
      <td style="background:#1e293b;padding:24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;">Děkujeme za vaši objednávku!</h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 16px;">Dobrý den, <strong>${order.customerName}</strong>,</p>
        <p style="margin:0 0 16px;">vaše objednávka <strong>${order.orderNumber}</strong> byla úspěšně přijata.</p>

        <!-- Items table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:8px 12px;text-align:left;">Produkt</th>
              <th style="padding:8px 12px;text-align:center;">Ks</th>
              <th style="padding:8px 12px;text-align:right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px 12px;text-align:right;font-weight:bold;">Mezisoučet:</td>
              <td style="padding:8px 12px;text-align:right;">${order.subtotalPrice.toFixed(0)}&nbsp;Kč</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 12px;text-align:right;font-weight:bold;">Doprava:</td>
              <td style="padding:8px 12px;text-align:right;">${order.shippingPrice.toFixed(0)}&nbsp;Kč</td>
            </tr>
            <tr style="background:#f1f5f9;">
              <td colspan="2" style="padding:8px 12px;text-align:right;font-weight:bold;">Celkem:</td>
              <td style="padding:8px 12px;text-align:right;font-weight:bold;">${order.totalPrice.toFixed(0)}&nbsp;Kč</td>
            </tr>
          </tfoot>
        </table>

        <!-- Shipping address -->
        <h3 style="margin:0 0 8px;">Doručovací adresa</h3>
        <p style="margin:0 0 16px;">
          ${addr.fullName}<br/>
          ${addr.street}<br/>
          ${addr.zip} ${addr.city}<br/>
          ${addr.country}
        </p>

        <!-- Next steps -->
        <h3 style="margin:0 0 8px;">Co bude následovat?</h3>
        <ol style="margin:0 0 16px;padding-left:20px;">
          <li>Objednávku nyní zpracováváme.</li>
          <li>Jakmile bude zásilka odeslána, dostanete e-mail s číslem sledování.</li>
          <li>Pokud máte dotazy, odpovězte na tento e-mail.</li>
        </ol>

        <p style="margin:0;">S pozdravem,<br/><strong>Stroller Shop tým</strong></p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#64748b;">
        &copy; ${new Date().getFullYear()} Stroller Shop. Všechna práva vyhrazena.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCustomerEmailSubject(orderNumber: string): string {
  return `Potvrzení objednávky ${orderNumber}`;
}
