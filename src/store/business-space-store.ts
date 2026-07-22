"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { businessPages as initialBusinessPages, offers as initialOffers, reservedBusinessSlugs, services as initialServices } from "@/data/business-space-data";
import type { BusinessPageBlock, BusinessPageContent, BusinessPageSettings, Offer, ServiceItem } from "@/types";

interface BusinessSpaceStore {
  services: ServiceItem[];
  offers: Offer[];
  businessPages: BusinessPageSettings[];
  updateBusinessPageDraft: (businessId: string, patch: Partial<BusinessPageContent>) => void;
  updateBusinessPageBlock: (businessId: string, blockId: string, patch: Partial<BusinessPageBlock>) => void;
  moveBusinessPageBlock: (businessId: string, blockId: string, direction: "up" | "down") => void;
  updateBusinessPageSlug: (businessId: string, slug: string) => { ok: boolean; message: string };
  publishBusinessPage: (businessId: string) => void;
  revertBusinessPageDraft: (businessId: string) => void;
  updateService: (id: string, patch: Partial<ServiceItem>) => void;
  addService: (businessId: string, service: Omit<ServiceItem, "id" | "businessId" | "order">) => void;
  addOffer: (businessId: string, offer: Omit<Offer, "id" | "businessId">) => void;
}

export const useBusinessSpaceStore = create<BusinessSpaceStore>()(
  persist(
    (set, get) => ({
      services: initialServices,
      offers: initialOffers,
      businessPages: initialBusinessPages,
      updateBusinessPageDraft: (businessId, patch) => set((state) => ({
        businessPages: state.businessPages.map((page) => page.businessId === businessId ? { ...page, draft: { ...page.draft, ...patch, appearance: { ...page.draft.appearance, ...patch.appearance }, seo: { ...page.draft.seo, ...patch.seo } } } : page),
      })),
      updateBusinessPageBlock: (businessId, blockId, patch) => set((state) => ({
        businessPages: state.businessPages.map((page) => page.businessId === businessId ? { ...page, draft: { ...page.draft, blocks: page.draft.blocks.map((block) => block.id === blockId ? { ...block, ...patch } : block) } } : page),
      })),
      moveBusinessPageBlock: (businessId, blockId, direction) => set((state) => ({
        businessPages: state.businessPages.map((page) => {
          if (page.businessId !== businessId) return page;
          const ordered = [...page.draft.blocks].sort((a, b) => a.order - b.order);
          const index = ordered.findIndex((block) => block.id === blockId);
          const swap = direction === "up" ? index - 1 : index + 1;
          if (index < 0 || swap < 0 || swap >= ordered.length) return page;
          [ordered[index], ordered[swap]] = [ordered[swap], ordered[index]];
          return { ...page, draft: { ...page.draft, blocks: ordered.map((block, orderIndex) => ({ ...block, order: orderIndex + 1 })) } };
        }),
      })),
      updateBusinessPageSlug: (businessId, rawSlug) => {
        const slug = sanitizeSlug(rawSlug);
        if (slug.length < 3) return { ok: false, message: "Slug должен содержать минимум 3 символа" };
        if (reservedBusinessSlugs.has(slug)) return { ok: false, message: "Этот slug зарезервирован системой" };
        const taken = get().businessPages.some((page) => page.businessId !== businessId && page.slug === slug);
        if (taken) return { ok: false, message: "Этот slug уже используется другим бизнесом" };
        set((state) => ({ businessPages: state.businessPages.map((page) => page.businessId === businessId ? { ...page, slug } : page) }));
        return { ok: true, message: "Slug доступен" };
      },
      publishBusinessPage: (businessId) => set((state) => ({
        businessPages: state.businessPages.map((page) => page.businessId === businessId ? { ...page, status: "published", published: page.draft, lastPublishedAt: new Date().toISOString() } : page),
      })),
      revertBusinessPageDraft: (businessId) => set((state) => ({
        businessPages: state.businessPages.map((page) => page.businessId === businessId && page.published ? { ...page, draft: page.published } : page),
      })),
      updateService: (id, patch) => set((state) => ({ services: state.services.map((service) => service.id === id ? { ...service, ...patch } : service) })),
      addService: (businessId, service) => set((state) => ({
        services: [{ ...service, id: `svc-${Date.now()}`, businessId, order: state.services.filter((item) => item.businessId === businessId).length + 1 }, ...state.services],
      })),
      addOffer: (businessId, offer) => set((state) => ({ offers: [{ ...offer, id: `off-${Date.now()}`, businessId }, ...state.offers] })),
    }),
    { name: "memberflow-business-space-store", version: 1 },
  ),
);

export function sanitizeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
