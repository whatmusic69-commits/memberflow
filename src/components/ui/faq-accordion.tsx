"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    question: "Нужно ли клиенту устанавливать приложение?",
    answer: "Нет. Клиент добавляет одну карту MemberFlow в Wallet и использует её во всех подключённых программах. Все подписки и карты лояльности доступны по ссылке «Мои карты».",
  },
  {
    question: "Как сотрудник отмечает посещение?",
    answer: "Сотрудник открывает сканер на телефоне или планшете, сканирует QR-код клиента и подтверждает использование услуги или начисление штампа.",
  },
  {
    question: "Чем подписка отличается от карты лояльности?",
    answer: "Подписка предполагает регулярную оплату клиента за определённое количество услуг. Карта лояльности бесплатна для клиента и выдаёт награду после заданного количества посещений или покупок.",
  },
  {
    question: "Кто устанавливает цену и условия программы?",
    answer: "Бизнес самостоятельно задаёт стоимость подписки, количество включённых услуг, срок действия, правила начисления штампов и награды.",
  },
  {
    question: "От чего зависит стоимость?",
    answer: "Стоимость зависит от выбранного продукта, количества активных клиентов, сотрудников и филиалов. Начать можно с плана Solo, а при росте бизнеса перейти на следующий тариф.",
  },
  {
    question: "Что произойдёт при превышении лимита?",
    answer: "Мы заранее уведомим владельца. Новый тариф начнёт действовать со следующего расчётного периода. Карты клиентов и обслуживание не будут заблокированы.",
  },
  {
    question: "Куда поступают платежи клиентов?",
    answer: "Платежи поступают бизнесу через подключённого платёжного провайдера. MemberFlow удерживает комиссию согласно выбранному тарифу.",
  },
  {
    question: "Что происходит с неиспользованными посещениями?",
    answer: "Это определяет бизнес при создании подписки: остаток можно переносить на следующий месяц или обнулять после обновления лимита. Условия видны клиенту до оплаты.",
  },
  {
    question: "Может ли клиент отменить подписку?",
    answer: "Да. После отмены новые списания прекращаются, а доступ к уже оплаченным услугам действует согласно установленным бизнесом условиям.",
  },
  {
    question: "Можно ли одновременно использовать подписки и карты лояльности?",
    answer: "Да. Бизнес может запустить один продукт или подключить оба и управлять ими из одного кабинета.",
  },
  {
    question: "Можно ли добавить сотрудников и несколько филиалов?",
    answer: "Да. Владелец добавляет сотрудников, назначает им доступ и может отслеживать операции по каждому филиалу.",
  },
  {
    question: "Защищён ли QR-код от повторного использования?",
    answer: "Каждая операция подтверждается сотрудником и сохраняется в истории. Система проверяет доступный лимит и не позволяет повторно списать уже использованную услугу.",
  },
  {
    question: "Сколько времени занимает запуск?",
    answer: "Базовую программу можно настроить примерно за 10 минут: добавить бизнес, создать условия, пригласить сотрудников и разместить ссылку или QR-код для клиентов.",
  },
  {
    question: "Можно ли изменить или остановить программу?",
    answer: "Да. Программу можно приостановить или изменить её условия. Изменения для действующих клиентов должны применяться с учётом уже оплаченного периода.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? faqItems : faqItems.slice(0, 7);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="divide-y divide-slate-200 overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        {visibleItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <button
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-[var(--foreground)] transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:px-6 sm:py-5 sm:text-base"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span>{item.question}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <div className={cn("grid transition-all duration-200", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 text-sm leading-6 text-[var(--muted-foreground)] sm:px-6 sm:pb-5">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!showAll ? (
        <div className="mt-5 text-center">
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            onClick={() => setShowAll(true)}
          >
            Показать ещё
          </button>
        </div>
      ) : null}
    </div>
  );
}
