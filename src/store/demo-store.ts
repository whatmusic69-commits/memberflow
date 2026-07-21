"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { businesses as initialBusinesses, chartData, customers as initialCustomers, operations as initialOperations, payments, programs as initialPrograms, workers as initialWorkers } from "@/data/mock-data";
import type { Business, Customer, DemoRole, Operation, OperationType, Program, ProgramStatus, ProgramType, SaaSPlan, Worker } from "@/types";
import { uid } from "@/lib/utils";

interface DemoStore {
  role: DemoRole;
  businesses: Business[];
  programs: Program[];
  customers: Customer[];
  workers: Worker[];
  operations: Operation[];
  selectedBusinessId: string;
  toast: string | null;
  roleViewWarning: boolean;
  setRole: (role: DemoRole) => void;
  setSelectedBusiness: (id: string, adminPreview?: boolean) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  resetDemo: () => void;
  createProgram: (program: Partial<Program> & { type: ProgramType; name: string }) => void;
  updateProgramStatus: (id: string, status: ProgramStatus) => void;
  duplicateProgram: (id: string) => void;
  updateBusiness: (id: string, patch: Partial<Pick<Business, "name" | "category" | "city" | "address" | "phone" | "email" | "brandColor" | "logoDataUrl">>) => void;
  updateBusinessPlan: (id: string, plan: SaaSPlan) => void;
  addWorker: (worker: Pick<Worker, "name" | "email" | "role">) => void;
  updateWorkerStatus: (id: string, status: Worker["status"]) => void;
  deleteWorker: (id: string) => void;
  addBranch: (name: string) => void;
  deleteBranch: (name: string) => void;
  adjustCustomer: (customerId: string, action: "use_service" | "add_service" | "add_stamp" | "remove_stamp" | "issue_reward" | "redeem_reward", branch?: string) => void;
}

const initialState = {
  businesses: initialBusinesses,
  programs: initialPrograms,
  customers: initialCustomers,
  workers: initialWorkers,
  operations: initialOperations,
  selectedBusinessId: "biz-wash",
};

function migrateLegacyNames(state: unknown): Partial<DemoStore> {
  if (!state || typeof state !== "object") return {};
  const persisted = state as Partial<DemoStore>;
  return {
    ...persisted,
    programs: persisted.programs?.some((program) => program.id === "loy-tattoo") ? persisted.programs : [
      ...(persisted.programs ?? initialPrograms),
      { id: "loy-tattoo", businessId: "biz-glow", type: "loyalty", name: "Tattoo Club", description: "3 посещения и консультация в подарок", status: "active", loyaltyMechanic: "visits", targetCount: 3, rewardName: "Консультация мастера", stampExpiryDays: 180, repeatable: true, customers: 76, mrrCents: 0, stampsIssued: 188, rewardsAvailable: 9, rewardsRedeemed: 21 },
    ],
    businesses: persisted.businesses?.map((business) => {
      if (business.id === "biz-wash") return { ...business, owner: "Rihards Melderis" };
      if (business.id === "biz-paws") return { ...business, owner: "Marta Vītola" };
      return business;
    }),
    customers: persisted.customers?.map((customer) => {
      if (customer.id === "cust-1") return { ...customer, name: "Anna Ozola", email: "anna.ozola@example.com", token: "mfp_c_8f3k29x7", customerNumber: "MF-000184", remainingUses: 2, includedUses: 2 };
      if (customer.id === "cust-9") return { ...customer, businessId: "biz-coffee", name: "Anna Ozola", email: "anna.ozola@example.com", token: "mfp_c_8f3k29x7", customerNumber: "MF-000184", loyaltyProgramId: "loy-coffee", subscriptionProgramId: undefined, stamps: 4 };
      if (customer.id === "cust-14") return { ...customer, businessId: "biz-glow", name: "Anna Ozola", email: "anna.ozola@example.com", token: "mfp_c_8f3k29x7", customerNumber: "MF-000184", loyaltyProgramId: "loy-tattoo", subscriptionProgramId: undefined, stamps: 2 };
      if (customer.id === "cust-3") return { ...customer, name: "Robert Kalniņš", email: "robert.kalniņš@example.com" };
      return customer;
    }),
  };
}

function operationLabel(action: string): { type: OperationType; change: string; toast: string } {
  switch (action) {
    case "use_service":
      return { type: "subscription_usage", change: "-1 услуга", toast: "Услуга списана" };
    case "add_service":
      return { type: "manual_adjustment", change: "+1 услуга", toast: "Услуга добавлена" };
    case "add_stamp":
      return { type: "stamp_added", change: "+1 штамп", toast: "Штамп начислен" };
    case "remove_stamp":
      return { type: "manual_adjustment", change: "-1 штамп", toast: "Штамп убран" };
    case "issue_reward":
      return { type: "manual_adjustment", change: "+1 награда", toast: "Награда выдана" };
    default:
      return { type: "reward_redeemed", change: "-1 награда", toast: "Награда использована" };
  }
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      role: "owner",
      toast: null,
      roleViewWarning: false,
      setRole: (role) => set({ role }),
      setSelectedBusiness: (id, adminPreview = false) => set({ selectedBusinessId: id, roleViewWarning: adminPreview }),
      showToast: (message) => set({ toast: message }),
      clearToast: () => set({ toast: null }),
      resetDemo: () => set({ ...initialState, role: "owner", toast: "Демо-данные сброшены", roleViewWarning: false }),
      createProgram: (program) => {
        const businessId = get().selectedBusinessId;
        const newProgram: Program = {
          id: uid(program.type === "subscription" ? "sub" : "loy"),
          businessId,
          type: program.type,
          name: program.name,
          description: program.description ?? "Новая demo-программа",
          status: "active",
          priceCents: program.priceCents,
          billingPeriod: program.billingPeriod ?? "month",
          includedService: program.includedService,
          includedUses: program.includedUses,
          rollover: program.rollover,
          maxRollover: program.maxRollover,
          extraDiscountPercent: program.extraDiscountPercent,
          allBranches: program.allBranches,
          cancellationRules: program.cancellationRules,
          loyaltyMechanic: program.loyaltyMechanic,
          targetCount: program.targetCount,
          rewardName: program.rewardName,
          stampExpiryDays: program.stampExpiryDays,
          repeatable: program.repeatable,
          customers: 0,
          mrrCents: 0,
          stampsIssued: 0,
          rewardsAvailable: 0,
          rewardsRedeemed: 0,
        };
        set((state) => ({
          programs: [newProgram, ...state.programs],
          operations: [{
            id: uid("op"),
            businessId,
            customerId: state.customers.find((customer) => customer.businessId === businessId)?.id ?? state.customers[0].id,
            programId: newProgram.id,
            date: new Date().toISOString(),
            type: "program_created",
            worker: "Demo Owner",
            branch: "Center",
            change: "Создана программа",
            status: "success",
          }, ...state.operations],
          toast: "Программа создана",
        }));
      },
      updateProgramStatus: (id, status) => set((state) => ({
        programs: state.programs.map((program) => program.id === id ? { ...program, status } : program),
        toast: `Статус программы изменён на ${status}`,
      })),
      duplicateProgram: (id) => {
        const source = get().programs.find((program) => program.id === id);
        if (!source) return;
        set((state) => ({
          programs: [{ ...source, id: uid(source.type), name: `${source.name} copy`, status: "paused", customers: 0, mrrCents: 0 }, ...state.programs],
          toast: "Программа продублирована",
        }));
      },
      updateBusiness: (id, patch) => set((state) => ({
        businesses: state.businesses.map((business) => business.id === id ? { ...business, ...patch } : business),
        toast: "Настройки бизнеса сохранены",
      })),
      updateBusinessPlan: (id, plan) => set((state) => ({
        businesses: state.businesses.map((business) => business.id === id ? { ...business, plan } : business),
        toast: `Тариф изменён на ${plan}`,
      })),
      addWorker: (worker) => set((state) => ({
        workers: [{
          id: uid("wrk"),
          businessId: state.selectedBusinessId,
          name: worker.name,
          email: worker.email,
          role: worker.role,
          branch: "Center",
          status: "invited",
          lastAction: "Приглашение отправлено",
        }, ...state.workers],
        toast: "Сотрудник добавлен",
      })),
      updateWorkerStatus: (id, status) => set((state) => ({
        workers: state.workers.map((worker) => worker.id === id ? { ...worker, status } : worker),
        toast: status === "disabled" ? "Сотрудник отключён" : "Приглашение отправлено повторно",
      })),
      deleteWorker: (id) => set((state) => ({ workers: state.workers.filter((worker) => worker.id !== id), toast: "Сотрудник удалён" })),
      addBranch: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => {
          const business = state.businesses.find((item) => item.id === state.selectedBusinessId);
          if (business?.branches.includes(trimmed)) return { toast: "Такая точка уже есть" };
          return {
            businesses: state.businesses.map((item) => item.id === state.selectedBusinessId ? { ...item, branches: [...item.branches, trimmed] } : item),
            toast: "Точка добавлена",
          };
        });
      },
      deleteBranch: (name) => set((state) => {
        const business = state.businesses.find((item) => item.id === state.selectedBusinessId);
        if ((business?.branches.length ?? 0) <= 1) return { toast: "Нужна хотя бы одна точка" };
        const fallback = business?.branches.find((branch) => branch !== name) ?? "Main";
        return {
          businesses: state.businesses.map((item) => item.id === state.selectedBusinessId ? { ...item, branches: item.branches.filter((branch) => branch !== name) } : item),
          workers: state.workers.map((worker) => worker.businessId === state.selectedBusinessId && worker.branch === name ? { ...worker, branch: fallback } : worker),
          operations: state.operations.map((operation) => operation.businessId === state.selectedBusinessId && operation.branch === name ? { ...operation, branch: fallback } : operation),
          toast: "Точка удалена",
        };
      }),
      adjustCustomer: (customerId, action, branch) => {
        const meta = operationLabel(action);
        const customer = get().customers.find((item) => item.id === customerId);
        if (!customer) return;
        set((state) => ({
          customers: state.customers.map((item) => {
            if (item.id !== customerId) return item;
            if (action === "use_service") return { ...item, remainingUses: Math.max(0, item.remainingUses - 1), lastVisit: new Date().toISOString() };
            if (action === "add_service") return { ...item, remainingUses: item.remainingUses + 1 };
            if (action === "add_stamp") {
              const nextStamps = item.stamps + 1;
              const program = state.programs.find((entry) => entry.id === item.loyaltyProgramId);
              const target = program?.targetCount ?? 5;
              return nextStamps >= target ? { ...item, stamps: 0, rewards: item.rewards + 1, lastVisit: new Date().toISOString() } : { ...item, stamps: nextStamps, lastVisit: new Date().toISOString() };
            }
            if (action === "remove_stamp") return { ...item, stamps: Math.max(0, item.stamps - 1) };
            if (action === "issue_reward") return { ...item, rewards: item.rewards + 1 };
            return { ...item, rewards: Math.max(0, item.rewards - 1), lastVisit: new Date().toISOString() };
          }),
          operations: [{
            id: uid("op"),
            businessId: customer.businessId,
            customerId: customer.id,
            programId: customer.subscriptionProgramId ?? customer.loyaltyProgramId ?? state.programs[0].id,
            date: new Date().toISOString(),
            type: meta.type,
            worker: state.role === "staff" ? "Diana Scan" : "Demo Owner",
            branch: branch ?? state.businesses.find((item) => item.id === customer.businessId)?.branches[0] ?? "Main",
            change: meta.change,
            status: "success",
          }, ...state.operations],
          toast: meta.toast,
        }));
      },
    }),
    {
      name: "memberflow-demo-store",
      version: 3,
      migrate: (persistedState) => migrateLegacyNames(persistedState),
    },
  ),
);

export const staticData = { payments, chartData };
