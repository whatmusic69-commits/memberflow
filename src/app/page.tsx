import { Roboto_Condensed } from "next/font/google";
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

const displayFont = Roboto_Condensed({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["800"], variable: "--font-growth-display", display: "swap" });

export const metadata: Metadata = {
  title: "MemberFlow — Create once. Grow everywhere.",
  description: "Платформа роста для локального бизнеса. Создавайте предложения, привлекайте клиентов и возвращайте их с помощью Apple Wallet, лояльности и кампаний.",
  openGraph: { title: "MemberFlow — Create once. Grow everywhere.", description: "One input. Many channels. Customers who come back. The growth platform for local business.", siteName: "MemberFlow", type: "website" },
};

export default function Home() {
  return <div className={displayFont.variable}><LandingPage /></div>;
}
