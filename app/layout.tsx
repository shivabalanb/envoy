import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "envoy",
  description: "a platform for decentralized spending",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-white" suppressHydrationWarning>
        <Providers>
          <div className="relative flex flex-col items-center justify-center min-h-screen">
            <Navbar />

            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
