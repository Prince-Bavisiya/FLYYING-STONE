import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

import { AuthProvider } from "../context/AuthContext";
import { BagProvider } from "../context/BagContext";
import { WishlistProvider } from "../context/WishlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flyying Stone",
  description: "Premium Fashion Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <BagProvider>
            <WishlistProvider>
              {children}

              <Toaster
                position="top-center"
                richColors
                closeButton
                duration={3000}
                expand
              />
            </WishlistProvider>
          </BagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}