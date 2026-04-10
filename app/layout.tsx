import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stroller Shop — Prémiové příslušenství ke kočárkům",
  description:
    "Najděte kompatibilní příslušenství pro váš kočárek. Vyberte značku a model a ukážeme vám, co sedí.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
