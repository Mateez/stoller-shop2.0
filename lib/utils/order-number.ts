// ---------------------------------------------------------------------------
// Readable order-number generator
// Format: STR-YYYYMMDD-XXXX  (e.g. STR-20260410-A3F7)
// ---------------------------------------------------------------------------

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `STR-${datePart}-${randomPart}`;
}
