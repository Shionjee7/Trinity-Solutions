import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trinity Solutions · Insurance Quotes",
  description:
    "Get a free insurance quote from Trinity Solutions. Auto, home, and bundle coverage options available.",
  keywords: "insurance quote, auto insurance, home insurance, Trinity Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0f1e] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
