import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prathmesh Ingole — Engineer",
  description:
    "Software engineer building the next big surety platform at SuretyNow. Design. Architect. Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
