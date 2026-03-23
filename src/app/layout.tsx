import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Netso | South African Streetwear & Events",
  description: "Authentic South African streetwear brand. Shop clothes, accessories and get tickets to exclusive events.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
