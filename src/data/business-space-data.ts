import type { BusinessPageContent, BusinessPageSettings, Offer, ServiceItem } from "@/types";

export const reservedBusinessSlugs = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "b",
  "card",
  "customer",
  "dashboard",
  "demo",
  "join",
  "login",
  "onboarding",
  "register",
  "staff",
  "subscribe",
]);

export const services: ServiceItem[] = [
  { id: "svc-wash-1", businessId: "biz-wash", name: "Комплексная мойка", description: "Кузов, салон, коврики и сушка", category: "Мойка", priceCents: 2999, durationMinutes: 45, visible: true, popular: true, order: 1 },
  { id: "svc-wash-2", businessId: "biz-wash", name: "Защитное покрытие", description: "Блеск и защита кузова после мойки", category: "Уход", priceCents: 1800, pricePrefix: "from", durationMinutes: 20, visible: true, order: 2 },
  { id: "svc-wash-3", businessId: "biz-wash", name: "Химчистка салона", description: "Глубокая очистка ткани и пластика", category: "Детейлинг", priceCents: 7900, pricePrefix: "from", durationMinutes: 120, visible: true, order: 3 },
  { id: "svc-cut-1", businessId: "biz-cut", name: "Мужская стрижка", description: "Консультация, стрижка и укладка", category: "Barber", priceCents: 2800, durationMinutes: 45, visible: true, popular: true, order: 1 },
  { id: "svc-coffee-1", businessId: "biz-coffee", name: "Flat white", description: "Фирменный кофе на зерне недели", category: "Coffee", priceCents: 420, durationMinutes: 5, visible: true, popular: true, order: 1 },
  { id: "svc-paws-1", businessId: "biz-paws", name: "Груминг собаки", description: "Мытьё, стрижка и уход за лапами", category: "Grooming", priceCents: 4500, pricePrefix: "from", durationMinutes: 90, visible: true, popular: true, order: 1 },
];

export const offers: Offer[] = [
  { id: "off-wash-1", businessId: "biz-wash", title: "Вернитесь на чистый старт", description: "Скидка на комплексную мойку для клиентов без визита 30 дней.", discountLabel: "-20%", status: "active", publicVisible: true, validUntil: "2026-08-15", promoCode: "CLEAN20" },
  { id: "off-wash-2", businessId: "biz-wash", title: "Воск после трёх моек", description: "Получите защитное покрытие в подарок после трёх посещений.", discountLabel: "Подарок", status: "active", publicVisible: true, validUntil: "2026-09-01" },
  { id: "off-coffee-1", businessId: "biz-coffee", title: "Утренний кофе", description: "Каждый шестой кофе бесплатно в программе Coffee Regular.", discountLabel: "6-й бесплатно", status: "active", publicVisible: true },
];

export const businessPages: BusinessPageSettings[] = [
  makeBusinessPage("biz-wash", "wash-club", "Wash Club", "Автомойка, которая возвращает клиентов", "Запишитесь на мойку, подключите награды и следите за прогрессом в личном кабинете."),
  makeBusinessPage("biz-cut", "north-cut", "North Cut", "Барбершоп рядом с вами", "Стрижки, уход и регулярные визиты в одном клиентском кабинете."),
  makeBusinessPage("biz-coffee", "mikla-coffee", "Mīkla Coffee", "Кофе, за который хочется возвращаться", "Награды, акции и любимые напитки без установки приложения."),
  makeBusinessPage("biz-paws", "paws-care", "Paws & Care", "Груминг и забота о питомце", "Запись, история визитов и награды для постоянных клиентов."),
];

function makeBusinessPage(businessId: string, slug: string, name: string, title: string, text: string): BusinessPageSettings {
  const content: BusinessPageContent = {
    appearance: {
      primaryColor: "#6D5DFB",
      secondaryColor: "#20B486",
      backgroundColor: "#F4F5F9",
      textColor: "#121320",
      theme: "light",
      buttonShape: "soft",
      cardStyle: "soft",
    },
    seo: {
      title: `${name} — клиентский кабинет и услуги`,
      description: text,
    },
    blocks: [
      { id: "hero", type: "hero", enabled: true, order: 1, title, text, ctaLabel: "Присоединиться", secondaryCtaLabel: "Посмотреть услуги" },
      { id: "about", type: "about", enabled: true, order: 2, title: `О ${name}`, text: "Мы создали удобное цифровое пространство, чтобы клиентам было проще возвращаться, видеть услуги и получать награды." },
      { id: "services", type: "services", enabled: true, order: 3, title: "Услуги и цены", text: "Выберите услугу и продолжите в клиентском кабинете." },
      { id: "offers", type: "offers", enabled: true, order: 4, title: "Актуальные предложения", text: "Публичные акции и бонусы для новых клиентов." },
      { id: "loyalty", type: "loyalty", enabled: true, order: 5, title: "Программа лояльности", text: "Сканируйте QR-код, получайте прогресс и открывайте награды без установки приложения." },
      { id: "contacts", type: "contacts", enabled: true, order: 6, title: "Контакты", text: "Адрес, телефон и быстрый маршрут." },
      { id: "cta", type: "cta", enabled: true, order: 7, title: "Откройте личный кабинет", text: "Получайте награды, предложения и историю визитов.", ctaLabel: "Зарегистрироваться" },
    ],
  };
  return { businessId, slug, status: "published", lastPublishedAt: "2026-07-20T10:00:00.000Z", draft: content, published: content };
}
