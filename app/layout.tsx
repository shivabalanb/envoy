import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./lib/providers/providers";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "Envoy - Decentralized Spending",
  description: "A platform for decentralized corporate spending with smart accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <div className="space-bg" />
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
