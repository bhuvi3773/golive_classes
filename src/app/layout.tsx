import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { getUserFromCookie } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoLive - E-Learning Platform",
  description: "Learn anytime, anywhere with recorded and live classes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromCookie();
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-emerald-50 via-sky-50 to-purple-50 text-slate-900 selection:bg-emerald-200 min-h-screen bg-fixed`}>
        <LayoutWrapper isAuthenticated={!!user}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
