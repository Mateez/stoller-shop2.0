import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validation/order-schema";
import { fetchVerifiedProducts, insertOrder } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/email/resend";
import {
  buildCustomerEmailHtml,
  buildCustomerEmailSubject,
} from "@/lib/email/templates/customer-confirmation";
import {
  buildAdminEmailHtml,
  buildAdminEmailSubject,
} from "@/lib/email/templates/admin-notification";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import type { OrderApiResponse } from "@/types/order";

// ---------------------------------------------------------------------------
// POST /api/orders — validate, verify prices, save, send emails
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit (5 orders per IP per 15 min)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const limit = checkRateLimit(`order:${ip}`, {
      maxRequests: 5,
      windowSeconds: 15 * 60,
    });

    if (!limit.allowed) {
      const response: OrderApiResponse = {
        success: false,
        error: `Příliš mnoho objednávek. Zkuste to znovu za ${limit.retryAfterSeconds} sekund.`,
      };
      return NextResponse.json(response, {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    // 2. Parse & validate with Zod
    const body: unknown = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn("Order validation failed", {
        errors: parsed.error.flatten(),
      });
      const response: OrderApiResponse = {
        success: false,
        error: "Validace selhala",
        details: parsed.error.flatten(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const payload = parsed.data;

    // 3. Verify products & prices from DB (never trust frontend)
    const productIds = [...new Set(payload.items.map((i) => i.productId))];
    const productMap = await fetchVerifiedProducts(productIds);

    for (const item of payload.items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        const response: OrderApiResponse = {
          success: false,
          error: `Produkt nebyl nalezen: ${item.productId}`,
        };
        return NextResponse.json(response, { status: 400 });
      }
      if (!dbProduct.is_active) {
        const response: OrderApiResponse = {
          success: false,
          error: `Produkt "${dbProduct.name}" již není dostupný.`,
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // 4. Save to Supabase (prices calculated from DB inside insertOrder)
    logger.info("Saving order to database", {
      email: payload.customer.email,
      itemCount: payload.items.length,
    });
    const order = await insertOrder(payload, productMap);

    // 5. Send confirmation email to customer
    try {
      await sendEmail({
        to: order.customerEmail,
        subject: buildCustomerEmailSubject(order.orderNumber),
        html: buildCustomerEmailHtml(order),
      });
    } catch (emailError) {
      logger.error("Customer confirmation email failed", {
        orderId: order.id,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    // 6. Send notification email to admin
    try {
      const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: buildAdminEmailSubject(order.orderNumber),
          html: buildAdminEmailHtml(order),
        });
      } else {
        logger.warn("ORDER_NOTIFICATION_EMAIL not set — skipping admin notification");
      }
    } catch (emailError) {
      logger.error("Admin notification email failed", {
        orderId: order.id,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    // 7. Return success
    logger.info("Order processed successfully", {
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    const response: OrderApiResponse = {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
      message: "Objednávka byla úspěšně vytvořena",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error("Unhandled error in POST /api/orders", {
      error: error instanceof Error ? error.message : String(error),
    });

    const response: OrderApiResponse = {
      success: false,
      error: "Neočekávaná chyba serveru.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
