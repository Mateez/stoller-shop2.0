import { Resend } from "resend";
import { logger } from "@/lib/utils/logger";

// ---------------------------------------------------------------------------
// Resend client singleton
// ---------------------------------------------------------------------------

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable.");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// ---------------------------------------------------------------------------
// Send an email via Resend
// ---------------------------------------------------------------------------

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? "Stroller Shop <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error("Resend email failed", { to, subject, error: error.message });
    throw new Error(`Email send failed: ${error.message}`);
  }

  logger.info("Email sent", { to, subject });
}
