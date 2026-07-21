import type { Business, ChartPoint, Customer, Operation, Payment, Program, Worker } from "@/types";

export const businesses: Business[] = [
  { id: "biz-wash", name: "Wash Club", category: "Автомойка", owner: "Rihards Melderis", city: "Riga", address: "Brīvības 21", phone: "+371 20 111 222", email: "owner@washclub.lv", brandColor: "#6D5DFB", plan: "Complete", status: "active", stripeStatus: "connected", joinedAt: "2026-02-12", turnoverCents: 3142000, platformFeeCents: 81200, branches: ["Center", "Airport"] },
  { id: "biz-cut", name: "North Cut", category: "Барбершоп", owner: "Jānis Bērziņš", city: "Riga", address: "Dzirnavu 8", phone: "+371 20 333 444", email: "hello@northcut.lv", brandColor: "#151625", plan: "Membership", status: "active", stripeStatus: "connected", joinedAt: "2026-03-08", turnoverCents: 1836000, platformFeeCents: 52100, branches: ["Old Town"] },
  { id: "biz-coffee", name: "Mīkla Coffee", category: "Кофейня", owner: "Laura Ozola", city: "Riga", address: "Tallinas 12", phone: "+371 20 555 666", email: "team@mikla.lv", brandColor: "#20B486", plan: "Loyalty", status: "trial", stripeStatus: "pending", joinedAt: "2026-04-20", turnoverCents: 962000, platformFeeCents: 15000, branches: ["Tallinas", "Market"] },
  { id: "biz-paws", name: "Paws & Care", category: "Груминг", owner: "Marta Vītola", city: "Jūrmala", address: "Jomas 44", phone: "+371 20 777 888", email: "care@paws.lv", brandColor: "#F59E0B", plan: "Complete", status: "active", stripeStatus: "connected", joinedAt: "2026-01-16", turnoverCents: 1264000, platformFeeCents: 33600, branches: ["Jomas"] },
  { id: "biz-forma", name: "Forma Studio", category: "Фитнес", owner: "Ieva Kalniņa", city: "Riga", address: "Sporta 2", phone: "+371 20 999 101", email: "hi@forma.lv", brandColor: "#6D5DFB", plan: "Membership", status: "active", stripeStatus: "failed", joinedAt: "2026-05-01", turnoverCents: 2189000, platformFeeCents: 68200, branches: ["Sporta"] },
  { id: "biz-glow", name: "Glow Room", category: "Beauty", owner: "Sofia Petrova", city: "Riga", address: "Elizabetes 33", phone: "+371 21 123 456", email: "book@glow.lv", brandColor: "#DC2626", plan: "Loyalty", status: "disabled", stripeStatus: "pending", joinedAt: "2026-06-01", turnoverCents: 549000, platformFeeCents: 15000, branches: ["Elizabetes"] },
];

export const programs: Program[] = [
  { id: "sub-wash", businessId: "biz-wash", type: "subscription", name: "Wash Club", description: "Всегда чистый автомобиль", status: "active", priceCents: 2999, billingPeriod: "month", includedService: "Комплексная мойка", includedUses: 2, rollover: true, maxRollover: 4, extraDiscountPercent: 10, allBranches: true, cancellationRules: "Отмена до следующего платежа", customers: 184, mrrCents: 551816 },
  { id: "sub-cut", businessId: "biz-cut", type: "subscription", name: "Sharp Monthly", description: "Стрижка каждый месяц", status: "active", priceCents: 2499, billingPeriod: "month", includedService: "Мужская стрижка", includedUses: 1, rollover: false, maxRollover: 0, extraDiscountPercent: 15, allBranches: true, cancellationRules: "Можно отменить в любой день", customers: 96, mrrCents: 239904 },
  { id: "sub-forma", businessId: "biz-forma", type: "subscription", name: "Forma 8", description: "8 тренировок в месяц", status: "paused", priceCents: 5900, billingPeriod: "month", includedService: "Групповая тренировка", includedUses: 8, rollover: false, maxRollover: 0, extraDiscountPercent: 0, allBranches: true, cancellationRules: "Пауза до 14 дней", customers: 71, mrrCents: 418900 },
  { id: "loy-wash", businessId: "biz-wash", type: "loyalty", name: "Wax Bonus", description: "3 мойки и воск в подарок", status: "active", loyaltyMechanic: "visits", targetCount: 3, rewardName: "Нанесение воска", stampExpiryDays: 120, repeatable: true, customers: 412, mrrCents: 0, stampsIssued: 1240, rewardsAvailable: 34, rewardsRedeemed: 92 },
  { id: "loy-coffee", businessId: "biz-coffee", type: "loyalty", name: "Coffee Regular", description: "5 кофе, шестой бесплатно", status: "active", loyaltyMechanic: "purchases", targetCount: 5, rewardName: "Бесплатный кофе", stampExpiryDays: 90, repeatable: true, customers: 638, mrrCents: 0, stampsIssued: 3102, rewardsAvailable: 57, rewardsRedeemed: 241 },
  { id: "loy-paws", businessId: "biz-paws", type: "loyalty", name: "Happy Paws", description: "4 визита и уход за лапами", status: "active", loyaltyMechanic: "visits", targetCount: 4, rewardName: "Уход за лапами", stampExpiryDays: 180, repeatable: true, customers: 203, mrrCents: 0, stampsIssued: 706, rewardsAvailable: 18, rewardsRedeemed: 44 },
  { id: "loy-tattoo", businessId: "biz-glow", type: "loyalty", name: "Tattoo Club", description: "3 посещения и консультация в подарок", status: "active", loyaltyMechanic: "visits", targetCount: 3, rewardName: "Консультация мастера", stampExpiryDays: 180, repeatable: true, customers: 76, mrrCents: 0, stampsIssued: 188, rewardsAvailable: 9, rewardsRedeemed: 21 },
];

const names = ["Anna Ozola", "Jānis Bērziņš", "Robert Kalniņš", "Laura Ozola", "Ieva Kalniņa", "Sofia Petrova", "Rihards Liepa", "Elina Ziediņa", "Anna Ozola", "Daria Volkova", "Tom Anderson", "Līga Jansone", "Andrejs Sokolovs", "Anna Ozola", "Kristaps Ozols"];
export const customers: Customer[] = names.map((name, index) => {
  const biz = index < 8 ? "biz-wash" : index < 11 ? "biz-coffee" : index < 13 ? "biz-cut" : "biz-paws";
  const annaShared = index === 0 || index === 8 || index === 13;
  const businessId = index === 13 ? "biz-glow" : biz;
  return {
    id: `cust-${index + 1}`,
    businessId,
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
    phone: `+371 2${index} ${100 + index} ${200 + index}`,
    customerNumber: annaShared ? "MF-000184" : `MF-${String(184 + index).padStart(6, "0")}`,
    status: index === 5 ? "failed_payment" : "active",
    subscriptionProgramId: businessId === "biz-wash" ? "sub-wash" : businessId === "biz-cut" ? "sub-cut" : undefined,
    loyaltyProgramId: businessId === "biz-wash" ? "loy-wash" : businessId === "biz-coffee" ? "loy-coffee" : businessId === "biz-paws" ? "loy-paws" : businessId === "biz-glow" ? "loy-tattoo" : undefined,
    remainingUses: businessId === "biz-wash" ? (index === 0 ? 2 : (index % 3) + 1) : 0,
    includedUses: businessId === "biz-wash" ? 2 : businessId === "biz-cut" ? 1 : 0,
    nextRenewal: "2026-08-01",
    stamps: index === 8 ? 4 : index === 13 ? 2 : (index % 5) + 1,
    rewards: index % 6 === 0 ? 1 : 0,
    lastVisit: `2026-07-${String(3 + index).padStart(2, "0")}`,
    token: annaShared ? "mfp_c_8f3k29x7" : `mfp_c_demo_${index + 1}`,
  };
});

export const workers: Worker[] = [
  { id: "wrk-1", businessId: "biz-wash", name: "Karlis Staff", email: "karlis@washclub.lv", role: "Manager", branch: "Center", status: "active", lastAction: "Списал мойку" },
  { id: "wrk-2", businessId: "biz-wash", name: "Diana Scan", email: "diana@washclub.lv", role: "Staff", branch: "Airport", status: "active", lastAction: "Добавила штамп" },
  { id: "wrk-3", businessId: "biz-cut", name: "Arturs Barber", email: "arturs@northcut.lv", role: "Staff", branch: "Old Town", status: "invited", lastAction: "Приглашение отправлено" },
  { id: "wrk-4", businessId: "biz-coffee", name: "Marta Coffee", email: "marta@mikla.lv", role: "Manager", branch: "Market", status: "active", lastAction: "Использовала награду" },
  { id: "wrk-5", businessId: "biz-paws", name: "Eva Groom", email: "eva@paws.lv", role: "Staff", branch: "Jomas", status: "disabled", lastAction: "Отключена" },
];

export const operations: Operation[] = Array.from({ length: 30 }, (_, index) => {
  const customer = customers[index % customers.length];
  const program = programs.find((item) => item.businessId === customer.businessId) ?? programs[0];
  const types = ["subscription_usage", "subscription_renewal", "stamp_added", "reward_redeemed", "manual_adjustment"] as const;
  return {
    id: `op-${index + 1}`,
    businessId: customer.businessId,
    customerId: customer.id,
    programId: program.id,
    date: `2026-07-${String(1 + (index % 18)).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:30:00`,
    type: types[index % types.length],
    worker: workers[index % workers.length].name,
    branch: businesses.find((biz) => biz.id === customer.businessId)?.branches[0] ?? "Main",
    change: index % 4 === 0 ? "+1 штамп" : index % 4 === 1 ? "-1 услуга" : index % 4 === 2 ? "+€29,99" : "Награда",
    status: index === 9 ? "failed" : "success",
  };
});

export const payments: Payment[] = Array.from({ length: 12 }, (_, index) => ({
  id: `pay-${index + 1}`,
  businessId: businesses[index % businesses.length].id,
  customerId: customers[index % customers.length].id,
  date: `2026-07-${String(1 + index).padStart(2, "0")}`,
  amountCents: [2999, 2499, 5900, 1500][index % 4],
  feeCents: 90 + index * 7,
  status: index === 8 ? "failed" : index === 10 ? "refunded" : "paid",
}));

export const chartData: ChartPoint[] = [
  { month: "Фев", revenueCents: 426000, subscribers: 720, loyalty: 1190, platformMrrCents: 210000, newBusinesses: 5 },
  { month: "Мар", revenueCents: 518000, subscribers: 811, loyalty: 1326, platformMrrCents: 244000, newBusinesses: 7 },
  { month: "Апр", revenueCents: 641000, subscribers: 892, loyalty: 1510, platformMrrCents: 286000, newBusinesses: 8 },
  { month: "Май", revenueCents: 734000, subscribers: 975, loyalty: 1706, platformMrrCents: 321000, newBusinesses: 9 },
  { month: "Июн", revenueCents: 861000, subscribers: 1064, loyalty: 1904, platformMrrCents: 354000, newBusinesses: 11 },
  { month: "Июл", revenueCents: 964200, subscribers: 1147, loyalty: 2036, platformMrrCents: 380500, newBusinesses: 8 },
];
