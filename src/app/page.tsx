import { redirect } from "next/navigation";
import { defaultLocale } from "@/content";
export default function Index() {
  redirect(`/${defaultLocale}`);
}
