import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function LoginPage() { return <main className="grid min-h-screen place-items-center p-4"><Card className="w-full max-w-md p-6"><h1 className="text-2xl font-semibold">Вход</h1><p className="mt-2 text-sm text-slate-500">Авторизация демонстрационная. Используйте Demo menu в верхней панели.</p><LinkButton href="/dashboard" className="mt-6 w-full">Войти в demo</LinkButton></Card></main>; }
