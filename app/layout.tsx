import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wattson -- EUC Ride Tracking",
  description: "Ride tracking, telemetry, and shareable rides for electric unicycles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
