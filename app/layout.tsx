import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "NSN Database - Premium Access",
  description: "Access our comprehensive NSN database with monthly subscription",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
