import type { Locale } from "@/content";
type Copy = {
  [
    key in
      | "title"
      | "subtitle"
      | "period"
      | "unavailable"
      | "revenue"
      | "revenueHint"
      | "returned"
      | "returnedHint"
      | "newCustomers"
      | "newHint"
      | "redeemed"
      | "redeemedHint"
      | "trend"
      | "visits"
      | "emptyChart"
      | "performance"
      | "offerRevenue"
      | "returnRevenue"
      | "attribution"
      | "salesMissing"
      | "emptyPerformance"
      | "demo"
      | "table"
      | "date"
      | "setup"
  ]: string;
};
export const businessResultsContent: Record<Locale, Copy> = {
  ru: {
    title: "Как растёт ваш бизнес",
    subtitle:
      "Клиенты, повторные визиты и результаты ваших предложений — в одном месте.",
    period: "Период",
    unavailable: "Нет данных",
    revenue: "Выручка по предложениям",
    revenueHint: "Подтверждённые покупки, связанные с предложениями",
    returned: "Клиенты вернулись",
    returnedHint: "После периода неактивности",
    newCustomers: "Новые клиенты",
    newHint: "Подключились к вашему бизнесу",
    redeemed: "Предложения использованы",
    redeemedHint: "Подтверждённые использования за период",
    trend: "Посещения и возвращения",
    visits: "Посещения",
    emptyChart:
      "Здесь появится динамика посещений и возвращений, когда будут доступны данные за период.",
    performance: "Что приносят ваши предложения",
    offerRevenue: "Покупки по предложениям",
    returnRevenue: "Покупки вернувшихся клиентов",
    attribution:
      "Это выручка покупок, связанных с предложениями или возвращениями, а не расчёт дополнительной прибыли. Категории могут пересекаться — суммы не складываются.",
    salesMissing:
      "Для отображения выручки нужны подтверждённые данные о покупках и их связи с предложениями.",
    emptyPerformance:
      "Данные об использовании предложений появятся после первых подтверждённых событий.",
    demo: "Иллюстративная статистика — не реальные результаты бизнеса",
    table: "Посмотреть данные графика",
    date: "Дата",
    setup: "Настройка бизнеса",
  },
  en: {
    title: "How your business is growing",
    subtitle: "Customers, repeat visits and offer results, in one place.",
    period: "Period",
    unavailable: "No data",
    revenue: "Offer-linked revenue",
    revenueHint: "Confirmed purchases linked to offers",
    returned: "Customers returned",
    returnedHint: "After a period of inactivity",
    newCustomers: "New customers",
    newHint: "Connected to your business",
    redeemed: "Offers redeemed",
    redeemedHint: "Confirmed redemptions in this period",
    trend: "Visits and customer returns",
    visits: "Visits",
    emptyChart:
      "Visit and return trends will appear when data for this period is available.",
    performance: "What your offers bring",
    offerRevenue: "Purchases linked to offers",
    returnRevenue: "Purchases by reactivated customers",
    attribution:
      "This is purchase revenue linked to offers or customer returns, not estimated incremental profit. Categories may overlap; do not add them together.",
    salesMissing:
      "Revenue requires confirmed purchase data and its attribution to offers.",
    emptyPerformance:
      "Offer redemption data will appear after the first confirmed events.",
    demo: "Illustrative statistics — not actual business results",
    table: "View chart data",
    date: "Date",
    setup: "Business setup",
  },
  lv: {
    title: "Kā aug jūsu uzņēmums",
    subtitle:
      "Klienti, atkārtoti apmeklējumi un piedāvājumu rezultāti vienuviet.",
    period: "Periods",
    unavailable: "Nav datu",
    revenue: "Ieņēmumi no piedāvājumiem",
    revenueHint: "Apstiprināti pirkumi, kas saistīti ar piedāvājumiem",
    returned: "Klienti atgriezās",
    returnedHint: "Pēc neaktivitātes perioda",
    newCustomers: "Jauni klienti",
    newHint: "Pievienojās jūsu uzņēmumam",
    redeemed: "Izmantoti piedāvājumi",
    redeemedHint: "Apstiprinātas izmantošanas šajā periodā",
    trend: "Apmeklējumi un klientu atgriešanās",
    visits: "Apmeklējumi",
    emptyChart:
      "Apmeklējumu un atgriešanās dinamika būs redzama, kad būs pieejami dati par šo periodu.",
    performance: "Ko dod jūsu piedāvājumi",
    offerRevenue: "Ar piedāvājumiem saistīti pirkumi",
    returnRevenue: "Atgriezušos klientu pirkumi",
    attribution:
      "Tie ir pirkumu ieņēmumi, kas saistīti ar piedāvājumiem vai klientu atgriešanos, nevis aprēķināta papildu peļņa. Kategorijas var pārklāties; summas nav jāsaskaita.",
    salesMissing:
      "Ieņēmumu attēlošanai nepieciešami apstiprināti pirkumu dati un to saistība ar piedāvājumiem.",
    emptyPerformance:
      "Piedāvājumu izmantošanas dati parādīsies pēc pirmajiem apstiprinātajiem notikumiem.",
    demo: "Ilustratīva statistika — nav uzņēmuma reālie rezultāti",
    table: "Skatīt diagrammas datus",
    date: "Datums",
    setup: "Uzņēmuma iestatīšana",
  },
};
