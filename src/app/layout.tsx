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
  title: "MemberFlow — персональный кабинет и программа лояльности для бизнеса",
  description: "Создайте брендированный клиентский кабинет с наградами, предложениями, записями и подписками. Возвращайте клиентов автоматически — без разработки приложения.",
  openGraph: {
    title: "MemberFlow — персональный клиентский кабинет для локального бизнеса",
    description: "Лояльность, предложения, записи, пакеты и подписки в персональном кабинете клиента без разработки приложения.",
    siteName: "MemberFlow",
    type: "website",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
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
