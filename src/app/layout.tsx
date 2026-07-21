import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toast } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemberFlow",
  description: "SaaS prototype for subscriptions and digital loyalty cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F2F4F8] text-[#151625]">
        {children}
        <Toast />
      </body>
    </html>
  );
}
